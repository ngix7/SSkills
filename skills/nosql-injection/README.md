# NoSQL Injection

Detection and exploitation of NoSQL injection in MongoDB, CouchDB, and other document databases

## Techniques

| Technique | Description |
|-----------|-------------|
| [Detection](techniques/detection.md) | Differentiate NoSQL from SQL injection |
| [MongoDB Query Operators](techniques/mongodb-query-operator.md) | $ne, $gt, $regex, $where injection |
| [Blind NoSQL](techniques/blind-nosql.md) | Time-based and boolean-based blind injection |
| [NoSQL in JSON](techniques/nosql-in-json.md) | Injection via JSON body payloads |

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
