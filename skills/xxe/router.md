# XML External Entity Injection Router

## Signal Classes
- `xxe-detected` — Evidence of the vulnerability
- `xxe-confirmed` — Confirmed exploitable
- `xxe-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic In-Band XXE | in-band-xxe |
| Basic Blind/OOB XXE | blind-oob-xxe |
| Basic XInclude | xinclude |
| Basic SVG XXE | svg-xxe |
| Basic DOCX/OOXML XXE | docx-xxe |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
