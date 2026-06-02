# HTTP Request Smuggling

Detection and exploitation of HTTP request smuggling vulnerabilities arising from parser discrepancies between front-end proxies and back-end servers.

## Techniques

| Technique | Description |
|-----------|-------------|
| [Detection](techniques/detection.md) | CL.TE and TE.CL detection with differential response analysis |
| [CL.TE](techniques/cl-te.md) | Content-Length vs Transfer-Encoding: front-end uses CL, back-end uses TE |
| [TE.CL](techniques/te-cl.md) | Transfer-Encoding vs Content-Length: front-end uses TE, back-end uses CL |
| [TE.TE](techniques/te-te.md) | Obfuscated Transfer-Encoding headers for parser differential |
| [Impact](techniques/impact.md) | Web cache poisoning, request hijacking, and WAF bypass |

## Safety

Request smuggling testing uses malformed HTTP and can poison shared infrastructure. Test only on isolated environments. Never use on production without explicit authorisation.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
