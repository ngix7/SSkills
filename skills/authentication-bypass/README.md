# Authentication Bypass

Detection and exploitation of authentication bypass vulnerabilities

## Techniques

| Technique | Description |
|-----------|-------------|
| [JWT Attacks](techniques/jwt-attacks.md) | Algorithm confusion, key confusion, none algo |
| [OAuth Misconfiguration](techniques/oauth-misconfig.md) | Redirect URI, state param, scope attacks |
| [Session Hijacking](techniques/session-hijack.md) | Session fixation, token theft, CSRF in auth |
| [Password Reset Flaws](techniques/password-reset.md) | Weak tokens, host header injection, email bypass |
| [2FA/MFA Bypass](techniques/2fa-bypass.md) | Backup code, rate limiting, race condition |
| [Rate Limiting Bypass](techniques/rate-limit-bypass.md) | IP rotation, header manipulation, race conditions |

## Safety

See [safety.md](safety.md) before testing.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
