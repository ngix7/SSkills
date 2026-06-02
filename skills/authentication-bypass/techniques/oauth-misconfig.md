# OAuth Misconfiguration

## Summary
Exploit flaws in OAuth 2.0 / OpenID Connect implementations.

## Detection

### Redirect URI Bypass
- Test `redirect_uri` manipulation: path traversal, subdomain takeover, open redirect
- Parameter pollution in `redirect_uri`

### State Parameter
- Missing `state` param → CSRF in OAuth flow
- Predictable `state` → session hijacking

## Payloads

```
redirect_uri=https://app.com/callback?url=https://evil.com
redirect_uri=https://app.com.evil.com/
redirect_uri=https://evil.com/#@app.com/
```

## Remediation
- Strict redirect URI allowlist
- Required and random state parameter
- PKCE for public clients
