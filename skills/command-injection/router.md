# Command Injection Router

## Signal Classes
- `command-injection-detected` — Evidence of the vulnerability
- `command-injection-confirmed` — Confirmed exploitable
- `command-injection-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic In-Band Command Injection | in-band-cmdi |
| Basic Blind Time-Based | blind-time-cmdi |
| Basic Blind OOB Command Injection | blind-oob-cmdi |
| Basic Filter Bypass | filter-bypass |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
