# API Security Testing Router

## Signal Classes
- `api-security-detected` — Evidence of the vulnerability
- `api-security-confirmed` — Confirmed exploitable
- `api-security-mitigated` — Protection detected

## Triage Rules

1. Check for WAF/CDN indicators first
2. Identify input vectors (GET/POST params, headers, uploads)
3. Match technique cards based on context
4. Verify with minimal safe payload before proceeding

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Basic REST API Fuzzing | rest-fuzzing |
| Basic GraphQL Introspection | graphql-introspection |
| Basic GraphQL Depth/Query Batching | graphql-depth |
| Basic tRPC Enumeration | trpc-enum |
| Basic Rate Limit Testing | rate-limit-api |
| Basic Mass Assignment | mass-assignment-api |

## Rejection Rules

- False positive from self-filtering? → Reject
- Payload reflected but not executed? → Low confidence
- Requires user interaction in non-sensitive context? → Informational
