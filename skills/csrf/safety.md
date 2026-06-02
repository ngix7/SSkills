# Safety Gates: Cross-Site Request Forgery

## Hard Gates

- ⛔ **No automated exploitation** without explicit manual confirmation
- ⛔ **No denial of service** — avoid time-based payloads with >5s delays
- ⛔ **No data destruction** — read-only payloads only
- ⛔ **No exfiltration of real user data** without authorization
- ⛔ **Stop at first evidence of WAF/IPS blocking** — do not bypass

## Required Verification

- [ ] Target is authorized for testing
- [ ] Scope includes this attack class
- [ ] Test environment is isolated (no production impact)
- [ ] Destructive techniques are explicitly approved

## Manual-Only Boundaries

- Exploitation for impact demonstration
- Chaining with other vulnerabilities
- Persistent payload deployment (stored XSS, etc.)
