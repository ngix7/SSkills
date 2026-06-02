# File Inclusion & Path Traversal Router

## Signal Classes
- `lfi-rfi-detected` — Evidence of the vulnerability
- `lfi-rfi-confirmed` — Confirmed exploitable
- `lfi-rfi-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic Path Traversal | path-traversal |
| Basic PHP Wrappers | php-wrappers |
| Basic Log Poisoning | log-poisoning |
| Basic Remote File Inclusion | rfi |
| Basic Windows Traversal | windows-traversal |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
