# SSkill: tax.audible.com Security Assessment

**Slug:** `tax-audible`
**Version:** 1.0.0
**Author:** SSkills pipeline

## Summary

Security assessment of the Audible Tax Portal (`tax.audible.com`), an Amazon-owned tax information portal for publishers, hosted on Amazon CloudFront with Amazon OpenID Connect authentication.

## Findings

| ID | Severity | Finding |
|----|----------|---------|
| TAX-001 | **Medium** | CSP report-only com `unsafe-inline` e `unsafe-eval` |
| TAX-002 | **Medium** | Cookie `session-id` sem HttpOnly e SameSite |
| TAX-003 | Low | Amazon OAuth redirect chain (OK, sem open redirect) |
| TAX-004 | Informational | X-Frame-Options: SAMEORIGIN |
| TAX-005 | Informational | CloudFront security headers ausentes |
| TAX-006 | Low | security.txt / robots.txt ausentes |

## Risk Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |
| Informational | 2 |

## Key Recommendations

1. **CSP:** Mudar de `report-only` para `enforce`, remover `unsafe-inline`/`unsafe-eval`, implementar nonce
2. **Cookies:** Adicionar `HttpOnly` e `SameSite=Lax` no `session-id`
3. **CloudFront:** Adicionar `Referrer-Policy` e `Permissions-Policy` via CloudFront Functions
4. **Disclosure:** Criar `/.well-known/security.txt`

## Repository Layout

```
tax-audible/
  README.md           ← This file
  skill.json          ← Skill metadata
  safety.md           ← Safety gates
  router.md           ← Routing logic
  sources.json        ← Evidence sources
  output-schema.json  ← Output format
  techniques/
    csp-report-only-unsafe-inline-eval.md
    missing-cookie-flags.md
    amazon-oauth-open-redirect.md
    x-frame-options-sameorigin.md
    cloudfront-misconfig.md
    information-disclosure.md
```
