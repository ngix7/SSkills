# Mass Assignment

## Summary
Modify object properties not intended to be user-controlled.

## Detection
- Add extra fields to JSON/XML payloads
- Check for `role`, `is_admin`, `permissions`, `balance`

## Payloads

```json
{"name":"test","email":"test@test.com","role":"admin"}
```

## Remediation
- Use DTOs/whitelists for mass assignment
