# Token Analysis

## Summary
Analyze anti-CSRF tokens for weaknesses.

## Detection
- Token missing entirely
- Static/predictable token
- Token validated only for certain methods
- Token tied to session but reused
- Token in GET parameter (leaked via Referer)

## Testing
```
# Check if CSRF token is validated
1. Capture valid request
2. Modify CSRF token
3. If accepted → vulnerable
```
