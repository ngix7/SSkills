# UUID/ID Enumeration

## Summary
Enumerate sequential or predictable identifiers to access unauthorized resources.

## Detection
- UUIDv1: timestamp-based, predictable if creation time is known
- Auto-increment integers: trivially enumerable
- Base64-encoded IDs: decode to reveal internal IDs

## Payloads

```
/api/user/1
/api/user/2
/api/user/3
...

/api/order/MjM0   # base64(234)
```

## Remediation
- Use cryptographically random IDs (UUIDv4)
- Implement proper access control checks
