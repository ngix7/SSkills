# SQL Injection

Detection and exploitation of SQL injection vulnerabilities across major DBMS

## Techniques

| Technique | Description |
|-----------|-------------|
| [Error-Based SQLi](techniques/error-based.md) | Extract data via database error messages |
| [UNION-Based SQLi](techniques/union-based.md) | Extract data via UNION SELECT statements |
| [Blind Boolean SQLi](techniques/blind-boolean.md) | Boolean-based inference |
| [Blind Time-Based SQLi](techniques/blind-time.md) | Time-delay inference |
| [Out-of-Band SQLi](techniques/oob-sqli.md) | DNS/HTTP exfiltration |
| [Second-Order SQLi](techniques/second-order.md) | Payload stored then executed in different context |

## Safety


## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
