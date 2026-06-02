# Server-Side Request Forgery Router

## Signal Classes
- `ssrf-detected` — Evidence of the vulnerability
- `ssrf-confirmed` — Confirmed exploitable
- `ssrf-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic Cloud Metadata | cloud-metadata |
| Basic Internal Network Scan | internal-scan |
| Basic Protocol Smuggling | protocol-smuggling |
| Basic Blind SSRF | blind-ssrf |
| Basic Open Redirect to SSRF | redirect-ssrf |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
