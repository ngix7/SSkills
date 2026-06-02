# Horizontal Privilege Escalation

## Summary
Access another user's resources at the same privilege level.

## Detection
- Change user/account identifiers in requests
- Test all resource endpoints
- Check WebSocket messages for user IDs

## Remediation
- Verify resource ownership on every request
