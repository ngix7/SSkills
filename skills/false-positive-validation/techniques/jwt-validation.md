# JWT Attack False Positive Validation

## Common False Positives

### 1. Token Accepted But Not Honored
The server accepts `alg: none` token but still uses the REAL session.
```bash
# 1. Get real token as user A
# 2. Forge alg:none token as admin
# 3. Test with forged token:
curl -s "https://target.com/api/Users" \
  -H "Authorization: Bearer $FORGED_ADMIN_JWT"
# 4. ALSO test without ANY token:
curl -s "https://target.com/api/Users"
# If both return same data → endpoint is public, JWT not validated
# → FALSE POSITIVE for JWT bypass
```

**Real JWT bypass:** Auth-required endpoints that DENY without token but ACCEPT with forged token.

### 2. Expired Token Still Works
A JWT that's "expired" but accepted. Check if:
- The endpoint never validates tokens (public endpoint)
- Token validation is client-side only

### 3. Algorithm Confusion But No Impact
Server accepts `HS256` but verification fails — returns 401. The endpoint just doesn't crash.

**Must show:** The forged token GRANTS ACCESS that the real token doesn't.

## Confirmation Criteria

| Signal | Confident? |
|--------|------------|
| Public endpoint without auth → same result |  Not JWT bypass |
| `alg: none` on protected endpoint → access granted |  Confirmed |
| `HS256` with public key → access granted |  Confirmed |
| `alg: none` → different response than no-auth |  Strong |

## Validation Flow

```bash
# Step 1: Find an auth-protected endpoint
curl -s "https://target.com/api/Users"
# Returns 401

# Step 2: Use real token
curl -s "https://target.com/api/Users" \
  -H "Authorization: Bearer $REAL_TOKEN"
# Returns 200 with limited data (your user only)

# Step 3: Use forged admin token
curl -s "https://target.com/api/Users" \
  -H "Authorization: Bearer $FORGED_ADMIN_JWT"
# Returns 200 with ALL users → JWT BYPASS CONFIRMED
```
