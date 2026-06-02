# CSRF False Positive Validation

## Common False Positives

### 1. Missing Token But No State Change
The endpoint is missing a CSRF token but only performs idempotent actions (GET, search, view).
**CSRF requires a state-changing action** (POST/PUT/DELETE that modifies data).

### 2. Token Not Validated But Action Is Protected
The server accepts requests without CSRF token, but:
- Action requires re-authentication
- Action requires confirmation email
- Action has rate limiting that prevents abuse

### 3. SameSite=Lax Blocking in Browser
The form works in curl but fails in browser due to SameSite.

## Confirmation Criteria
| Signal | Confident? |
|--------|------------|
| State-changing action without any token |  Confirmed |
| Predictable/reusable token |  Confirmed |
| Action modifies data on behalf of victim |  Confirmed |
| SameSite bypass confirmed in browser |  Strong |
| Only idempotent actions affected |  Informational |

## Validation Flow
```bash
# Step 1: Verify action is state-changing
curl -X POST "https://target.com/api/transfer" \
  -d 'amount=100&to=attacker'
# Check if transfer actually happened

# Step 2: Verify action works without Origin/Referer
curl -X POST "https://target.com/api/transfer" \
  -H "Origin: https://evil.com" \
  -d 'amount=100&to=attacker'

# Step 3: Verify token is not validated
# Take a valid request, modify the CSRF token
# If still accepted → confirmed
```
