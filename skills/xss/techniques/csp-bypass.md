# CSP Bypass

## Summary
Bypass Content Security Policy restrictions.

## Techniques
- Script gadgets (Angular, Prototype.js, etc.)
- JSONP endpoints for script injection
- File upload to whitelisted CDN
- Base tag injection
- Dangling markup

## Example
```html
<!-- CSP: script-src 'self' https://cdn.example.com -->
<script src="https://cdn.example.com/jsonp?callback=alert(1)"></script>
```
