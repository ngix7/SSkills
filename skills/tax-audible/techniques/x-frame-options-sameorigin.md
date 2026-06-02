# Technique: X-Frame-Options SAMEORIGIN — Clickjacking Assessment

**ID:** TAX-004  
**Severity:** Informational  
**Confidence:** Confirmed  

## Summary

`X-Frame-Options: SAMEORIGIN` permite que a página seja embutida em iframes do mesmo domínio (`.audible.com`). Não há vulnerabilidade imediata, mas a proteção é menos robusta que `DENY`.

## Evidence

```
x-frame-options: SAMEORIGIN
```

## Impact

- Baixo: páginas só podem ser embutidas dentro de `*.audible.com`
- Se existir XSS em qualquer subdomínio `.audible.com`, um atacante pode iframar o tax portal
- Em domínios com muitos subdomínios (audible.com), a superfície de ataque é maior

## Recommendation

- Mudar para `DENY` se o tax portal não precisar ser embutido em iframes
- Se precisar de embedding legítimo, usar `Content-Security-Policy: frame-ancestors 'none'` como camada extra

## References

- [MDN X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [OWASP Clickjacking](https://owasp.org/www-community/attacks/Clickjacking)
