# tRPC Enumeration

## Summary
Discover and test tRPC procedures in Next.js / tRPC applications.

## Detection

Look for these indicators:
```
/api/trpc          (Next.js App Router standard)
/api/trpc/*        (batched or single procedures)
/trpc
/_next/*           (framework chunks may reveal procedure names)
```

## Procedure Discovery

### 1. Fuzz Common Procedure Names
```bash
# Try GET requests (tRPC supports both GET and POST)
curl "https://target.com/api/trpc/user.list?batch=1&input={}"
curl "https://target.com/api/trpc/user.get?batch=1&input={\"id\":1}"
curl "https://target.com/api/trpc/admin.users?batch=1"
curl "https://target.com/api/trpc/admin.list?batch=1"
curl "https://target.com/api/trpc/health?batch=1"
curl "https://target.com/api/trpc/config?batch=1"
```

### 2. Check Error Messages
```bash
# Some apps leak procedure names in error responses
curl -s "https://target.com/api/trpc/nonexistent"
# Look for: "No procedure found for '...'"
```

### 3. Extract from Client-Side Code
```bash
# Search JS bundles for procedure name patterns
curl -s "https://target.com/_next/static/chunks/main-app-*.js" \
  | grep -oP 'trpc\.\w+\.\w+' | sort -u
```

## Procedure Testing

### Input Fuzzing
```bash
# Try different Content-Types
POST /api/trpc/user.list
Content-Type: application/json
[{"procedure":"user.list","input":{}}]

# Try JSON-RPC batch
POST /api/trpc
Content-Type: application/json
[
  {"procedure":"user.list","input":{}},
  {"procedure":"user.get","input":{"id":1}}
]
```

### Auth Bypass
```bash
# Test procedures with and without auth
curl "https://target.com/api/trpc/admin.list"
curl "https://target.com/api/trpc/admin.list" \
  -H "Authorization: Bearer $TOKEN"
```
## Remediation
- Disable tRPC introspection in production
- Implement procedure-level auth checks
- Sanitize tRPC error messages
