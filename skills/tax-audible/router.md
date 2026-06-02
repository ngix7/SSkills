# Router — tax.audible.com Audit

## Entry Conditions

Trigger this specialist when:
- Target hostname matches `tax.audible.com`
- Target uses Amazon CloudFront CDN
- Target uses Amazon OpenID Connect for auth
- CSP header is `report-only` with `unsafe-inline`/`unsafe-eval`

## Routing Logic

```
Evidence Type → Technique Card(s)
─────────────────────────────────
CSP report-only with unsafe-inline/eval
  → csp-report-only-unsafe-inline-eval.md

Cookies without HttpOnly or SameSite
  → missing-cookie-flags.md

X-Frame-Options: SAMEORIGIN
  → x-frame-options-sameorigin.md

OAuth redirect to amazon.com
  → amazon-oauth-open-redirect.md

No robots.txt / sitemap / security.txt
  → information-disclosure.md

CloudFront edge (no WAF indicators)
  → cloudfront-misconfig.md
```
