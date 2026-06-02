# IDOR False Positive Validation

## Common False Positives

### 1. "Accessible" But Data is Public
```bash
GET /api/user/1 → returns profile
GET /api/user/2 → returns profile
GET /api/user/9999 → returns profile
```
If ALL users return the same field set, maybe profiles are intentionally public (like a social network).

**Confirm:** Check if the app INTENTIONALLY shows this data in UI (search, listings, etc.).

### 2. 200 OK with Empty/Minimal Data
```bash
GET /api/orders/1 → {"id":1,"total":29.99}
GET /api/orders/2 → {"id":2,"total":49.99}
GET /api/orders/99999 → {"id":99999}  (no total!)
```
The 99999 response has less data — might be default behavior for "not found" returning a template.

**Confirm:** Compare responses. If different data fields appear, the object is real and IDOR is confirmed.

### 3. UUID/ID Format Suggests Predictability
```bash
GET /api/user/uuidv4 → returns user
# UUIDv4 is NOT predictable → cannot enumerate
# Only report if IDs are sequential (1, 2, 3) or timestamp-based
```

### 4. GraphQL IDOR (Field Restriction)
```graphql
{ user(id: 2) { name email } }
# Returns name + email
{ user(id: 2) { ssn } }
# Returns null for ssn
```
If sensitive fields are properly gated, the IDOR might only affect non-sensitive data.

## Confirmation Criteria

| Signal | Confident? |
|--------|------------|
| Sequential IDs, can enumerate all resources | ✅ Strong |
| Access another user's private data (orders, messages, CCs) | ✅ Confirmed |
| Different users see different field values | ✅ Confirmed |
| Admin-only data accessible as regular user | ✅ Confirmed |
| Non-sequential UUID, cannot brute force | ❌ Low |
| Public-facing profile data | ❌ Not IDOR |

## Validation Flow

```bash
# Step 1: Access your own resource
curl -s "https://target.com/api/order/100" \
  -H "Authorization: Bearer $MY_TOKEN"
# Returns your order data

# Step 2: Try other IDs
curl -s "https://target.com/api/order/101" \
  -H "Authorization: Bearer $MY_TOKEN"
# If returns another user's order → IDOR CONFIRMED

# Step 3: Verify by matching order to user
# Check if order 101 belongs to a different user
```
