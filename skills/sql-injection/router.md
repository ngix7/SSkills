# SQL Injection Router

## Signal Classes
- `sql-injection-detected` — Evidence of the vulnerability
- `sql-injection-confirmed` — Confirmed exploitable
- `sql-injection-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic Error-Based SQLi | error-based |
| Basic UNION-Based SQLi | union-based |
| Basic Blind Boolean SQLi | blind-boolean |
| Basic Blind Time-Based SQLi | blind-time |
| Basic Out-of-Band SQLi | oob-sqli |
| Basic Second-Order SQLi | second-order |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
