# 2FA/MFA Bypass

## Summary
Bypass two-factor authentication protections.

## Detection

### Backup Code Abuse
- Backup codes often have no rate limiting
- Numeric-only short codes can be brute-forced

### Race Condition
- Submit 2FA verification request while another session completes it

### OAuth Skip
- Some apps don't require 2FA for OAuth logins

## Techniques
- Check if 2FA can be disabled via API
- Test if 2FA is enforced on all endpoints
- Rate limit bypass with header manipulation
