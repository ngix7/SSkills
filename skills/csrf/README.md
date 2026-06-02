# Cross-Site Request Forgery

Detection and exploitation of CSRF vulnerabilities

## Techniques

| Technique | Description |
|-----------|-------------|
| [Token Analysis](techniques/token-analysis.md) | Weak/absent/predictable anti-CSRF tokens |
| [SameSite Bypass](techniques/samesite-bypass.md) | Bypass SameSite cookie restrictions |
| [Multi-Step CSRF](techniques/multistep-csrf.md) | CSRF across multiple requests |
| [Cookie Forcing](techniques/cookie-forcing.md) | Set session cookie via subdomain |
| [Referer/Origin Check Bypass](techniques/referer-origin.md) | Bypass referer-based CSRF protections |

## Safety

See [safety.md](safety.md) before testing.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
