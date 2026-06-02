# Cross-Site Scripting

Detection and exploitation of reflected, stored, and DOM-based XSS vulnerabilities

## Techniques

| Technique | Description |
|-----------|-------------|
| [Reflected XSS](techniques/reflected.md) | Payload reflected immediately in response |
| [Stored XSS](techniques/stored.md) | Payload persisted and served to other users |
| [DOM-Based XSS](techniques/dom-based.md) | Client-side JS executes payload from URL/fragment |
| [Context Analysis](techniques/context-analysis.md) | Identify injection context: HTML, attribute, JS, CSS, URL |
| [CSP Bypass](techniques/csp-bypass.md) | Bypass Content Security Policy restrictions |
| [WAF Bypass](techniques/waf-bypass.md) | Bypass web application firewall rules |
| [Mutation XSS (mXSS)](techniques/mutation-xss.md) | Exploit parser differentials for XSS |

## Safety


## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
