# REST API Fuzzing

## Summary
Fuzz REST API endpoints for security issues.

## Techniques
- HTTP method override: `X-HTTP-Method-Override: PUT`
- Content-Type manipulation
- Parameter pollution
- Unauthenticated endpoint discovery

## Testing
```
# Method fuzzing
GET /api/admin/users → 403
POST /api/admin/users → 405
PUT /api/admin/users → 200 (created!)
PATCH /api/admin/users → ?
DELETE /api/admin/users → ?
OPTIONS /api/admin/users → ?
```
