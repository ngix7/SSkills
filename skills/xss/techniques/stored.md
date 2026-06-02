# Stored XSS

## Summary
Payload persisted on the server and executed for other users.

## Detection
1. Submit payload via forms, profile fields, comments
2. Access the stored content from another session
3. Verify execution

## Impact
- Higher severity than reflected XSS (persistent)
- Can affect all users of the application
