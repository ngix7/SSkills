# CORS Misconfiguration Router

## Signal Classes
- `cors-reflected` — Origin header value is reflected in ACA-Origin
- `cors-wildcard` — ACA-Origin set to `*`
- `cors-credentialed` — Access-Control-Allow-Credentials set to true
- `cors-exploitable` — Confirmed exploitable from attacker origin

## Triage Rules

### Detection Phase
1. Send request with a custom Origin header (e.g. `Origin: https://evil.com`)
2. Inspect response for `Access-Control-Allow-Origin` header
3. Check for `Access-Control-Allow-Credentials: true`
4. Verify the response reflects the attacker origin or uses wildcard

### Rejection Rules
- ACA-Origin header absent — no CORS misconfiguration
- ACA-Origin is a specific whitelisted domain — check regex bypass
- Preflight fails (no ACA-Origin in OPTIONS response) — not exploitable
- No sensitive data exposed via CORS — low impact

## Technique Selection

| Scenario | Technique |
|----------|-----------|
| ACA-Origin reflects Origin | origin-reflection |
| ACA-Origin is * | wildcard-credentials |
| ACA-Origin is * with credentials=true | wildcard-credentials |
| OPTIONS preflight blocked | preflight-bypass |
| Sensitive data accessible | impact |

## Testing Order

1. Start with origin-reflection — send Origin: https://evil.com
2. If ACA-Origin = https://evil.com, it is reflected
3. Try null origin: Origin: null
4. Try regex bypass: Origin: https://target.com.evil.com
5. If wildcard found, check credentials header
6. Build POC HTML and test from browser

