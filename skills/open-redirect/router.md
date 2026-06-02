# Open Redirect Router

## Signal Classes
- `redirect-detected` — Parameter reflects or appears to trigger a redirect
- `redirect-confirmed` — Redirect successfully triggered to attacker-controlled URL
- `redirect-chainable` — Redirect can be chained to higher-impact vulnerability

## Triage Rules

### Detection Phase
1. Identify parameters commonly associated with redirects (`url`, `redirect`, `next`, `return`, `rurl`, `goto`, `target`, `path`, `dest`, `callback`)
2. Probe with `http://example.com` and watch for 301/302 responses or Location headers
3. Check for JavaScript-based redirects (`window.location`, `window.open`)
4. Verify the redirect domain is user-controllable

### Rejection Rules
- Redirect only to same origin (hardcoded prefix) — patrial bypass may still exist
- 404/500 on invalid redirect param — not redirect, likely routing
- Refresh meta tag with fixed URL — not user-controllable
- Redirect only via POST with CSRF token — not exploitable

## Technique Selection

| Scenario | Technique |
|----------|-----------|
| Unknown param set | detection |
| Known redirect params | detection |
| Domain validation present | url-bypass |
| Path validation present | url-bypass |
| Framework-specific redirect | parameter-injection |
| SSRF or OAuth scope | chaining |

