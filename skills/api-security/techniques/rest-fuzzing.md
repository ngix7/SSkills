# REST API Fuzzing

## Summary
Fuzz REST API endpoints for security issues.

## Phase 1: Endpoint Discovery

### Common API Paths
```bash
# Probe these patterns
/api
/rest
/swagger, /swagger.json, /api-docs, /openapi.json
/graphql
/trpc
/.well-known
/sockjs, /socket.io
/health, /healthcheck, /status
/version
/robots.txt
/sitemap.xml
```

### Authentication Status
```bash
# Check each endpoint with and without auth
for path in /api/Users /api/Products /api/Admin; do
  echo -n "No auth: "
  curl -s -o /dev/null -w "%{http_code}" "https://target.com$path"
  echo -n " | Auth: "
  curl -s -o /dev/null -w "%{http_code}" "https://target.com$path" \
    -H "Authorization: Bearer $TOKEN"
  echo " | $path"
done
```

## Phase 2: Method Enumeration
```bash
# Method fuzzing on discovered endpoints
GET  /api/admin/users → 401/403 (expected)
POST /api/admin/users → 405 (expected)
PUT  /api/admin/users → 200? (vulnerable!)
PATCH /api/admin/users → 200? (vulnerable!)
DELETE /api/admin/users → 200? (vulnerable!)
OPTIONS /api/admin/users → reveals allowed methods
```

## Phase 3: Parameter & Content-Type Attacks

### HTTP Method Override
```bash
POST /api/users
X-HTTP-Method-Override: PUT
# Bypasses method-level access controls
```

### Content-Type Switch
```bash
# Try XML when JSON is expected (vs XXE)
Content-Type: application/xml
# Try form-encoded
Content-Type: application/x-www-form-urlencoded
```

### Parameter Pollution
```bash
POST /api/users?id=1&id=2&id=admin
# Multiple parameters with same name
```

## Techniques
- HTTP method override
- Content-Type manipulation
- Parameter pollution
- Unauthenticated endpoint discovery
- UUID/ID enumeration in path
- Version probing (`/v1`, `/v2`, `/v3`)
