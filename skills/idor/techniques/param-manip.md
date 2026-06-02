# Parameter Manipulation

## Summary
Modify parameters in requests to access unauthorized data.

## Detection
- Change `user_id` in POST body
- Add `is_admin=true` or `role=admin` to requests
- Modify `order_total` price parameters

## Payloads

```
GET /api/profile?id=123 → 200 OK
GET /api/profile?id=124 → 200 OK (another user's data)
```

## Remediation
- Server-side authorization on every request
- Never trust client-side parameters for access control
