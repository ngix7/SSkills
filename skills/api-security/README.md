# API Security Testing

Comprehensive API security testing for REST, GraphQL, and tRPC

## Techniques

| Technique | Description |
|-----------|-------------|
| [REST API Fuzzing](techniques/rest-fuzzing.md) | HTTP method, header, parameter fuzzing |
| [GraphQL Introspection](techniques/graphql-introspection.md) | Extract schema, find deprecated fields |
| [GraphQL Depth/Query Batching](techniques/graphql-depth.md) | Depth attacks, batching for brute force |
| [tRPC Enumeration](techniques/trpc-enum.md) | Discover and test tRPC procedures |
| [Rate Limit Testing](techniques/rate-limit-api.md) | Bypass API rate limiting |
| [Mass Assignment](techniques/mass-assignment-api.md) | Extra fields in JSON/XML payloads |

## Safety

See [safety.md](safety.md) before testing.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
