# HTTP Request Smuggling Router

## Signal Classes
- `smuggling-detected` — Parser discrepancy detected via differential responses
- `smuggling-confirmed` — Smuggling variant confirmed with timing or queue poisoning
- `smuggling-queue-poisoning` — Response queue poisoning confirmed, cross-user impact

## Triage Rules

1. Identify front-end and back-end proxy/WAAP architecture
2. Test with basic CL.TE and TE.CL differential probes first
3. Confirm with timing-based detection (delayed response for smuggled prefix)
4. Never test queue poisoning on shared production infrastructure
5. Document the exact parser behaviour of each hop

## Technique Selection

| Signal | Technique |
|--------|-----------|
| General parser discrepancy | detection |
| CL.TE variant confirmed | cl-te |
| TE.CL variant confirmed | te-cl |
| Obfuscated TE header | te-te |
| Confirmed variant, need impact assessment | impact |

## Rejection Rules

- Both servers parse Content-Length identically → Reject
- Both servers parse Transfer-Encoding identically → Reject
- Response timing difference < 50ms may be network jitter → Low confidence
- HTTP pipelining mistaken for smuggling → Reject (check Connection reuse)
