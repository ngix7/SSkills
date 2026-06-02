# Unkeyed Inputs — Finding Cache Key Gaps

## Summary
Web caches generate a cache key from parts of the request (typically URL, method, and sometimes Host header). Any input not included in the cache key is "unkeyed" and can be used to poison the cached response.

## Detection

### Step 1: Confirm Caching

```bash
# Send request twice; check for caching headers
curl -sI "https://target.com/" | grep -i "x-cache\|cf-cache\|age\|cache-status"

# Send two identical requests
curl -s -D- "https://target.com/" | head -20
curl -s -D- "https://target.com/" | head -20
```

If the second request has a much shorter response time or includes `Age` / `CF-Cache-Status: HIT`, caching is active.

### Step 2: Parameter Poisoning
Test query parameters that are not part of the cache key:

```bash
# Check if a random parameter changes the response but not the cache key
curl -s "https://target.com/?cachebuster=123" | grep -i "unique-string"
curl -s "https://target.com/?cachebuster=456" | grep -i "different-string"

# If both return the same cached response, the parameter is unkeyed
```

### Step 3: Header Poisoning
Test headers that may be unkeyed:

```bash
# Test X-Forwarded-Host
curl -s "https://target.com/" -H "X-Forwarded-Host: attacker.com"

# Test X-Forwarded-Scheme
curl -s "https://target.com/" -H "X-Forwarded-Scheme: http"

# Test X-Original-URL
curl -s "https://target.com/" -H "X-Original-URL: /admin"

# Test X-Forwarded-For
curl -s "https://target.com/" -H "X-Forwarded-For: 127.0.0.1"

# Test custom headers
curl -s "https://target.com/" -H "X-Custom: <script>alert(1)</script>"
```

### Step 4: Cookie Poisoning
Test if specific cookies are unkeyed:

```bash
curl -s "https://target.com/" -H "Cookie: session=abc; lang=en"
curl -s "https://target.com/" -H "Cookie: session=abc; lang=fr"
```

If both return the same cached response, the `lang` cookie is unkeyed.

### Step 5: HTTP Method Poisoning
Some caches do not key on the HTTP method:

```bash
curl -X OPTIONS -s "https://target.com/"
```

If this returns the same cached response as GET, methods are unkeyed.

## Remediation
- Include all inputs that affect the response in the cache key
- Use a CDN or proxy that allows explicit cache key configuration (Cloudflare Cache Keys, Fastly VCL)
- Set Cache-Control: no-store on dynamic responses
- Normalise or reject unexpected headers at the proxy layer
