# Session Hijacking

## Summary
Steal or fixate session tokens to impersonate users.

## Detection

### Session Fixation
1. Get a session cookie from the app
2. Send the link to victim (via CSRF/open redirect)
3. Victim authenticates with that session ID
4. Use the same session ID to access victim's account

### Weak Session Tokens
- Base64-encoded user IDs
- Predictable patterns (timestamp + counter)
- No rotation after login

## Remediation
- Regenerate session ID after login
- Use secure, random session tokens
- HttpOnly + Secure + SameSite flags
