# Prototype Pollution

Detection and exploitation of prototype pollution vulnerabilities in client-side and server-side JavaScript

## Techniques

| Technique | Description |
|-----------|-------------|
| [Detection](techniques/detection.md) | Identify PP vectors in merge, assign, and clone patterns |
| [Client-Side](techniques/client-side.md) | Client-side PP via merge gadgets, DOM XSS |
| [Server-Side](techniques/server-side.md) | Server-side PP in Node.js, RCE via child_process |
| [Mitigation Bypass](techniques/mitigation-bypass.md) | Bypassing freeze, seal, and Object.create(null) |

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
