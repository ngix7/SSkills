# General Triage Methodology

## First: Understand What You're Looking At

Before labeling anything a vulnerability, answer:
1. **What is the expected behavior?** Read API docs, check normal responses
2. **What changed?** Compare with a baseline request
3. **Can you reproduce it?** Run the test 3 times
4. **Is it in scope?** This endpoint, method, parameter

## False Positive Filters (apply to ALL findings)

### 1. Self-Filtering
Does the application filter/encode its own output?
```bash
# Test with benign string first
curl "https://target.com/search?q=HELLO_WORLD_123"
# If "HELLO_WORLD_123" is reflected → test with XSS payload
# If NOT reflected → parameter might not be reflected at all
```

### 2. WAF/IDS Interference
Is a WAF returning a fake response?
```bash
# WAF indicators:
- HTTP 406 Not Acceptable
- HTTP 493 / 494
- Custom error page ("Request Blocked")
- Empty response with 200 OK
- Captcha challenge page

# Test without payload first → if same response, it's the WAF
```

### 3. Default Error Messages
Is the "vulnerability" just a default error page?
```bash
# Many frameworks return error pages even for safe input
# Test with completely benign string that looks suspicious:
curl "https://target.com/search?q=../.."  →  500 error?
curl "https://target.com/search?q=HELLO"  →  200 OK
# If both return 500, error is not related to payload
```

### 4. Charset / Encoding Issues
Is the "weird output" just encoding?
```bash
# Test with UTF-8 multibyte sequences
# If output is garbled in the same way → encoding issue, not injection
```

### 5. Timing Noise
Is the "time-based" delay just network latency?
```bash
# For time-based tests:
# 1. Run 3 times with benign payload → measure baseline
# 2. Run 3 times with time-based payload → compare
# 3. Only report if delay > baseline + 3x standard deviation
```

## Confirmation Checklist

- [ ] Reproduced at least 3 times
- [ ] Benign payload does NOT produce same result
- [ ] Different payloads produce different results (proving control)
- [ ] Result is distinguishable from WAF/error behavior
- [ ] Exploitation path is clear (even if not fully demonstrated)
- [ ] No simpler explanation for the behavior

## Rejection Criteria

Reject a finding if ANY of these apply:
-  Cannot reproduce consistently
-  Benign input produces same behavior
-  Behavior is documented as expected
-  Only affects request, not response (self-XSS without impact)
-  Requires impossible preconditions
