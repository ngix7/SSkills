# Cross-Site Scripting Router

## Signal Classes
- `xss-detected` — Evidence of the vulnerability
- `xss-confirmed` — Confirmed exploitable
- `xss-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic Reflected XSS | reflected |
| Basic Stored XSS | stored |
| Basic DOM-Based XSS | dom-based |
| Basic Context Analysis | context-analysis |
| Basic CSP Bypass | csp-bypass |
| Basic WAF Bypass | waf-bypass |
| Basic Mutation XSS (mXSS) | mutation-xss |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
