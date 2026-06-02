# Reflected XSS

## Summary
Payload reflected immediately in the HTTP response without proper encoding.

## Detection
1. Identify parameters reflected in the response
2. Test with: `<script>alert(1)</script>`
3. Confirm execution context (HTML, JS, attribute)

## Payloads

```html
<script>alert(document.domain)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
```

## Remediation
- Context-appropriate output encoding
- Content Security Policy headers
