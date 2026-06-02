# Technique: CSP Report-Only com unsafe-inline e unsafe-eval

**ID:** TAX-001  
**Severity:** Medium  
**Confidence:** Confirmed  

## Summary

O header `Content-Security-Policy` está configurado como `report-only` e permite `'unsafe-inline'` e `'unsafe-eval'` para scripts, o que anula a proteção contra XSS.

## Evidence

```
content-security-policy-report-only:
  default-src https://*.amazon.com https://*.media-amazon.com ...;
  script-src https://*.amazon.com https://*.media-amazon.com ...
    'unsafe-inline' 'unsafe-eval';
  style-src https://*.amazon.com ... 'unsafe-inline';
  report-uri /1/batch/2/OE/...
```

## Impact

- `unsafe-inline` em scripts permite execução de qualquer script inline, mesmo sem nonce — XSS direto
- `unsafe-eval` permite `eval()`, `setTimeout(string)`, `new Function()` — execução de código arbitrário
- Modo `report-only` significa que mesmo uma CSP bem configurada não bloquearia nada — apenas reportaria violações

## Recommendation

1. Mudar de `report-only` para `enforce` (remover `-report-only`)
2. Remover `'unsafe-inline'` e `'unsafe-eval'` de `script-src`
3. Implementar nonce-based CSP para scripts inline
4. Usar `strict-dynamic` para permitir scripts de confiança

```http
Content-Security-Policy: default-src 'self';
  script-src 'nonce-{random}' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  report-uri /1/batch/2/OE/...
```

## References

- [MDN CSP: script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
