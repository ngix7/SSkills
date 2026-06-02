# Technique: Cookie session-id sem HttpOnly e SameSite

**ID:** TAX-002  
**Severity:** Medium  
**Confidence:** Confirmed  

## Summary

O cookie `session-id` é definido sem as flags `HttpOnly` e `SameSite`, tornando-o acessível via JavaScript e vulnerável a ataques CSRF em navegadores que não implementam Lax-by-default.

## Evidence

```
set-cookie: session-id=147-8340870-4953953;
  Domain=.audible.com;
  Path=/;
  Secure;                          ← OK
  Expires=Tue, 01 Jan 2036 ...
                                  ← Ausente: HttpOnly
                                  ← Ausente: SameSite
```

O mesmo padrão se aplica a:
- `session-id` — todas as páginas
- `session-id-time` — todas as páginas

## Impact

- **Sem HttpOnly:** Atacante com XSS pode ler `document.cookie` e extrair o `session-id`, sequestrando sessões não autenticadas ou rastreando usuários
- **Sem SameSite:** O cookie é enviado em requisições cross-origin (GET via `<img>`, `<script>`, POST via form), potencialmente permitindo ataques CSRF se o servidor não validar origem

## Recommendation

```http
set-cookie: session-id=...; Secure; HttpOnly; SameSite=Lax; Path=/; Domain=.audible.com
```

- Adicionar `HttpOnly` para prevenir acesso via JavaScript
- Adicionar `SameSite=Lax` para proteger contra CSRF básico
- `session-id-time` deve seguir o mesmo padrão

## References

- [OWASP Session Management Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Mozilla: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
