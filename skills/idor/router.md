# Insecure Direct Object References Router

## Signal Classes
- `idor-detected` — Evidence of the vulnerability
- `idor-confirmed` — Confirmed exploitable
- `idor-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic UUID/ID Enumeration | uuid-enum |
| Basic Parameter Manipulation | param-manip |
| Basic Horizontal Privilege Escalation | horizontal-privesc |
| Basic Vertical Privilege Escalation | vertical-privesc |
| Basic Mass Assignment | mass-assignment |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
