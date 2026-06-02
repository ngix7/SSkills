# Open Redirect

Detection and exploitation of open redirect vulnerabilities including URL validation bypasses, parameter injection, and chaining attacks.

## Techniques

| Technique | Description |
|-----------|-------------|
| [Detection](techniques/detection.md) | Parameter discovery and basic redirect tests |
| [URL Validation Bypass](techniques/url-bypass.md) | Protocol confusion, encoding, Unicode tricks |
| [Parameter Injection](techniques/parameter-injection.md) | Injecting redirect URLs across frameworks |
| [Chaining](techniques/chaining.md) | Open redirect to SSRF, OAuth theft, phishing |

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).

