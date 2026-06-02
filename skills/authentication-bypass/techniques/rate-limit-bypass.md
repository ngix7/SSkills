# Rate Limiting Bypass

## Summary
Bypass rate limiting on authentication and API endpoints.

## Detection

### Header Manipulation
```
X-Forwarded-For: 127.0.0.1
X-Real-IP: 127.0.0.1
X-Originating-IP: 127.0.0.1
X-Remote-IP: 127.0.0.1
Client-IP: 127.0.0.1
```

### Race Condition
- Fire multiple requests simultaneously
- Race window between rate limit checks

## Remediation
- Rate limit by authenticated user, not IP
- Use atomic counters
