# Referer/Origin Check Bypass

## Summary
Bypass CSRF protections based on Referer/Origin headers.

## Techniques
- Remove Referer header via meta tag
- Open redirect to bypass origin checks
- Null origin (`null` origin via sandboxed iframe)

## Payloads
```html
<meta name="referrer" content="no-referrer">
<iframe sandbox="allow-forms" src="https://app.com/action"></iframe>
```
