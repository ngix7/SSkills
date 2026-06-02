# Subdomain Enumeration Router

## Signal Classes
- `subdomain-discovered` — New subdomain found from any source
- `resolve` — Subdomain resolves to an IP
- `no-resolve` — Subdomain does not resolve (still worth noting)
- `wildcard-detected` — Wildcard DNS entry detected

## Triage Rules

### Before enumeration:
1. Confirm the base domain
2. Check for wildcard DNS (critical!)
3. Establish scope boundaries

### During enumeration:
Run passive sources FIRST, then active.
If passive returns > 100 subs, active brute-force may be unnecessary.

## Technique Selection

| Goal | Technique |
|------|-----------|
| Quick passive harvest | certificate-transparency + passive-dns |
| Maximum coverage | Subfinder / Amass (all sources) |
| Find hidden/old subs | search-engines + tls-scanning |
| Rare: internal hosts | zone-transfer + reverse-dns |
| Validate findings | dns-resolution |

## Wildcard Detection
```bash
# Test for wildcard
dig @1.1.1.1 "randomstringthatnooneuses.target.com" +short
# If it returns an IP → wildcard DNS is active
# All future results need wildcard filtering
```
