# Safety Gates — tax.audible.com

## Automated Enforcement

| Gate | Rule |
|------|------|
| No exploit delivery | ❌ No automated payloads, no malformed requests, no session forgery |
| Read-only | ✅ Passive analysis only: header inspection, DNS, path discovery |
| No credential testing | ❌ No password brute-force, no token enumeration |
| No cache poisoning | ❌ No CloudFront cache manipulation attempts |
| No SSRF | ❌ No out-of-band interaction probes |
| Rate limiting respect | ✅ Requests spaced >1s apart |

## Manual Review Required

- OAuth redirect chain integrity
- CSP report-only → enforce recommendation
- Cookie flag hardening (HttpOnly, SameSite)
- CloudFront WAF rule evaluation

## Evidence Handling

All evidence collected from public endpoints with no authentication. No PII, no session tokens, no customer data stored.
