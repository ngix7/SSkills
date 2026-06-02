# API Security False Positive Validation

## Common False Positives

### 1. 401/403 for Different Methods Is Normal
```bash
GET /api/admin → 403
POST /api/admin → 405
```
This is expected REST behavior. A vulnerability is only when a method should be denied but isn't.

### 2. Extra Fields Returned ≠ Mass Assignment
API returns `{"id":1,"name":"x","role":"admin","isActive":true}` but all these fields might be read-only.
**Mass assignment** is only when you can WRITE fields you shouldn't control.

### 3. GraphQL Introspection Disabled ≠ Secure
Disabling introspection is security-by-obscurity. Report, but don't treat it as a high-severity finding if no exploitable queries are found.

### 4. Rate Limiting "Bypass" by Header Spoofing
```bash
X-Forwarded-For: 127.0.0.1 → bypasses rate limit
```
Only report if this leads to a real impact (brute force, enumeration).

## Confirmation Criteria
| Signal | Confident? |
|--------|------------|
| Write to read-only field succeeds | ✅ Confirmed |
| Mass assignment elevates privileges | ✅ Confirmed |
| Auth bypass via method override | ✅ Confirmed |
| Rate limit bypass → account takeover | ✅ Confirmed |
| Extra fields in response only | ❌ Informational |
| 401 for unauthorized endpoint | ❌ Expected behavior |
