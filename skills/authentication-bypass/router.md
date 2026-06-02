# Authentication Bypass Router

## Signal Classes
- `authentication-bypass-detected` — Evidence of the vulnerability
- `authentication-bypass-confirmed` — Confirmed exploitable
- `authentication-bypass-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic JWT Attacks | jwt-attacks |
| Basic OAuth Misconfiguration | oauth-misconfig |
| Basic Session Hijacking | session-hijack |
| Basic Password Reset Flaws | password-reset |
| Basic 2FA/MFA Bypass | 2fa-bypass |
| Basic Rate Limiting Bypass | rate-limit-bypass |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
