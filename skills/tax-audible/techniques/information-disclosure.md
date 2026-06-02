# Technique: Information Disclosure — Security.txt, Sitemap ausentes

**ID:** TAX-006  
**Severity:** Low  
**Confidence:** Confirmed  

## Summary

O portal não expõe `robots.txt`, `sitemap.xml`, ou `.well-known/security.txt`. Isso não é uma vulnerabilidade, mas dificulta a comunicação de achados de segurança por pesquisadores.

## Evidence

```
GET /robots.txt → 200 (sem conteúdo)
GET /sitemap.xml → 404
GET /.well-known/security.txt → 404
```

## Impact

- Baixo: sem exposição direta de informações sensíveis
- Pesquisadores de segurança não têm um canal claro para reportar vulnerabilidades

## Recommendation

1. Criar `/.well-known/security.txt` com política de disclosure
2. Remover ou preencher `robots.txt` adequadamente
3. Considerar adicionar `sitemap.xml` para crawlers legítimos

## Paths Descobertos

| Path | Descrição |
|------|-----------|
| `/` | Home page (Audible Tax Portal) |
| `/horizonte/login` | OAuth login redirect |
| `/accountManager` | OAuth login redirect |
| `/faq` | FAQ page (vazia) |

## References

- [RFC 8615 - Well-Known URIs](https://tools.ietf.org/html/rfc8615)
- [securitytxt.org](https://securitytxt.org/)
