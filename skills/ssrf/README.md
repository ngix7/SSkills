# Server-Side Request Forgery

Detection and exploitation of SSRF vulnerabilities

## Techniques

| Technique | Description |
|-----------|-------------|
| [Cloud Metadata](techniques/cloud-metadata.md) | Access cloud provider metadata endpoints |
| [Internal Network Scan](techniques/internal-scan.md) | Scan internal networks via SSRF |
| [Protocol Smuggling](techniques/protocol-smuggling.md) | Use file://, gopher://, dict://, etc. |
| [Blind SSRF](techniques/blind-ssrf.md) | OOB detection via DNS/HTTP interactions |
| [Open Redirect to SSRF](techniques/redirect-ssrf.md) | Chain open redirect for SSRF |

## Safety

See [safety.md](safety.md) before testing.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
