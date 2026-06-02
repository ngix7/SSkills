# Server-Side Template Injection

Detection and exploitation of SSTI vulnerabilities. SSTI occurs when user input is embedded in a template string and executed server-side. Impact ranges from data disclosure to RCE.

## Principles

1. **Probe with math expressions** — `{{7*7}}` — not all syntax errors are SSTI
2. **Identify the engine** — each engine has different syntax and capabilities
3. **Confirm with read/RCE** — math evaluation only proves expression parsing, not arbitrary execution

## Detection Flow

```
Input: {{7*7}}           → Output: 49        → SSTI confirmed (math evaluated)
Input: ${7*7}            → Output: 49        → SSTI confirmed
Input: {{7*7}}           → Output: {{7*7}}   → Not SSTI (reflected as-is)
Input: {{7*7}}           → Output: 500 error → Inconclusive (test other syntaxes)
```

## Techniques

| Technique | Engine | Payload Prefix |
|-----------|--------|---------------|
| [Detection](techniques/detection.md) | All | `{{}}`, `${}`, `#{}`, `<% %>` |
| [Jinja2](techniques/jinja2.md) | Python/Flask | `{{...}}` |
| [Twig](techniques/twig.md) | PHP/Symfony | `{{...}}` |
| [Freemarker](techniques/freemarker.md) | Java | `${...}`, `<#...>` |
| [Velocity](techniques/velocity.md) | Java | `${{...}}` |
| [Pug](techniques/jade-pug.md) | Node.js | `#{...}`, `!{...}` |
| [Handlebars](techniques/handlebars.md) | Node.js | `{{...}}` |
| [ERB](techniques/erb.md) | Ruby/Rails | `<%= %>` |
| [Blind SSTI](techniques/blind-ssti.md) | All | OOB detection |

## Tooling

```bash
# Tplmap — automated SSTI detection (deprecated but useful)
git clone https://github.com/epinna/tplmap.git
python tplmap.py -u "http://target.com/page?name=*" --engine jinja2

# Manual probes work better — engines are too diverse
```

## Safety

- ⛔ No RCE payloads without authorization
- ⛔ `os.system('/bin/bash -c "..."')` — extremely destructive
- ⛔ `cat /etc/shadow` — exfiltrating real secrets

