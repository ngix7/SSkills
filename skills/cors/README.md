# CORS Misconfiguration

Detection and exploitation of CORS misconfigurations including origin reflection, wildcard credentials, preflight bypass, and chained attacks.

## Techniques

| Technique | Description |
|-----------|-------------|
| [Origin Reflection](techniques/origin-reflection.md) | Testing origin reflection, null origin, regex bypass |
| [Wildcard Credentials](techniques/wildcard-credentials.md) | Wildcard ACA-Origin with credentials=true |
| [Preflight Bypass](techniques/preflight-bypass.md) | Bypassing preflight with simple requests |
| [Impact](techniques/impact.md) | API abuse, data exfiltration, CSRF-style attacks |

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).

