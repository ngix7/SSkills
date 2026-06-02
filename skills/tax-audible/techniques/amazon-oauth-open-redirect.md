# Technique: Amazon OAuth OpenID Redirect Chain

**ID:** TAX-003  
**Severity:** Low  
**Confidence:** Confirmed  

## Summary

As rotas `/horizonte/login` e `/accountManager` redirecionam para o login OAuth da Amazon em `www.amazon.com/ap/signin`. O fluxo usa OpenID Connect com parâmetros configuráveis.

## Evidence

```
GET /horizonte/login → 302
Location: https://www.amazon.com/ap/signin?
  clientContext=142-6520121-2925156&
  openid.pape.max_auth_age=604800&
  openid.return_to=https%3A%2F%2Ftax.audible.com%2Fhorizonte%2Flogin&
  openid.assoc_handle=audible_tax_us_v2&
  openid.mode=checkid_setup&
  marketPlaceId=AF2M0KC94RCEA&
  language=en_US&
  pageId=tax_publisher_portal&
  openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0

GET /accountManager → 302
Location: https://www.amazon.com/ap/signin?...
  (mesmos parâmetros, clientContext diferente)
```

## Parâmetros OAuth Identificados

| Parâmetro | Valor |
|-----------|-------|
| `openid.assoc_handle` | `audible_tax_us_v2` |
| `marketPlaceId` | `AF2M0KC94RCEA` |
| `pageId` | `tax_publisher_portal` |
| `openid.return_to` | `https://tax.audible.com/{path}` |
| `openid.pape.max_auth_age` | `604800` (7 dias) |

## Impact

- Nenhum vulnerability direta identificada no fluxo OAuth
- `max_auth_age=604800` significa que a Amazon não re-autentica por 7 dias — sessão prolongada
- `openid.return_to` é fixo (mesmo domínio) — sem open redirect
- Marketplace ID exposto via header CSP report-uri

## Recommendation

1. Verificar se o `openid.return_to` valida o domínio corretamente (parece seguro)
2. Considerar reduzir `max_auth_age` para 1 hora
3. Auditoria no callback OAuth para evitar code injection

## References

- [Amazon OAuth 2.0 Guide](https://developer.amazon.com/docs/login-with-amazon/authorization-code-grant.html)
- [OpenID Connect Spec](https://openid.net/specs/openid-connect-core-1_0.html)
