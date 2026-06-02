# SSTI Router

## Signal Classes
- `ssti-detected` — Template syntax produces different output
- `ssti-confirmed` — Math expression evaluated server-side
- `ssti-rce` — Arbitrary command execution achieved

## Triage Rules

### Detection Phase
1. Inject probe strings: `{{7*7}}`, `${7*7}`, `#{7*7}`, `<%=7*7%>`
2. Compare output with baseline (probe without template syntax)
3. If `49` or `7*7` evaluated → SSTI confirmed
4. If error → might be SSTI or might be broken parser

### Engine Identification
```
If {{7*7}} = 49     → Try Jinja2, Twig, or Handlebars
If ${7*7} = 49      → Try Freemarker or Velocity
If <%=7*7%> = 49    → Try ERB
If #{7*7} = 49      → Try Pug/Jade
```

### Rejection Rules
- Input reflected verbatim (no evaluation) → NOT SSTI
- Error for ALL inputs → broken endpoint, not SSTI
- HTML encoding of template syntax → NOT SSTI
- Client-side evaluation only (Angular `{{}}`) → NOT SSTI

## Technique Selection

| Engine Identified | Go to |
|-------------------|-------|
| Unknown | detection |
| Flask/Python | jinja2 |
| PHP/Symfony | twig |
| Java/Freemarker | freemarker |
| Java/Velocity | velocity |
| Node.js/Pug | jade-pug |
| Node.js/Handlebars | handlebars |
| Ruby/Rails | erb |
| No output visible | blind-ssti |
