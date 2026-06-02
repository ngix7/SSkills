# Cross-Site Request Forgery Router

## Signal Classes
- `csrf-detected` — Evidence of the vulnerability
- `csrf-confirmed` — Confirmed exploitable
- `csrf-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic Token Analysis | token-analysis |
| Basic SameSite Bypass | samesite-bypass |
| Basic Multi-Step CSRF | multistep-csrf |
| Basic Cookie Forcing | cookie-forcing |
| Basic Referer/Origin Check Bypass | referer-origin |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
