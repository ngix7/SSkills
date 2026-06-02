# Technique: CloudFront Edge Configuration Review

**ID:** TAX-005  
**Severity:** Informational  
**Confidence:** Possible  

## Summary

O portal está atrás do Amazon CloudFront, mas faltam headers de segurança que poderiam ser adicionados no edge (CloudFront Functions / Lambda@Edge).

## Evidence

| Header | Presente | Recomendado |
|--------|----------|-------------|
| `Strict-Transport-Security` | ✅ `max-age=47474747; preload` | ✅ OK |
| `X-Content-Type-Options` | ✅ `nosniff` | ✅ OK |
| `X-Frame-Options` | ✅ `SAMEORIGIN` | ✅ OK |
| `X-XSS-Protection` | ✅ `1; mode=block` | ⚠️ Deprecated |
| `Referrer-Policy` | ❌ Ausente | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | ❌ Ausente | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | ⚠️ `report-only` | Deve ser enforced |
| `Cross-Origin-Embedder-Policy` | ❌ Ausente | `require-corp` |
| `Cross-Origin-Opener-Policy` | ❌ Ausente | `same-origin` |
| `Cross-Origin-Resource-Policy` | ❌ Ausente | `same-origin` |

## CloudFront Details

- Distribution: `d3rsjikjuws1dl.cloudfront.net`
- CNAME: `tax.audible.com`
- Cache: `Miss from cloudfront` (todas as requisições)
- Edge POP: `ORD56-P2` (Chicago)
- Backend: `tp.791be3b49-frontier.audible.com` (ALB/EC2)

## Impact

- Baixo: nenhuma vulnerabilidade de segurança explorável diretamente
- Missing headers podem ser adicionados via CloudFront Functions sem custo de latência
- CloudFront WAF não foi detectado (confirmar)

## Recommendation

Adicionar no CloudFront Responses (via CloudFront Function):
```http
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

## References

- [CloudFront Security Headers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/response-headers-policies.html)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
