# Safety Gates: Subdomain Enumeration

## Hard Gates

- ⛔ **No AXFR (zone transfer)** without explicit authorization — triggers alarms
- ⛔ **No reverse DNS on IP ranges you don't own** without authorization
- ⛔ **No targeted DNS flooding** — use `-rate-limit` flags
- ⛔ **No scanning of subdomains outside scope**

## Passive vs Active

| Technique | Passive? | Risk |
|-----------|----------|------|
| Certificate Transparency | ✅ Yes | None |
| Passive DNS | ✅ Yes | None |
| Search Engines | ✅ Yes | None |
| TLS Scanning (certs.sh) | ✅ Yes | None |
| DNS Brute Force | ❌ No | Logged by DNS servers |
| Zone Transfer | ❌ No | Triggers IDS alarms |
| Reverse DNS | ❌ No | Rate-limit sensitive |
| DNS Resolution | ❌ No | Logged by DNS servers |

## Rate Limits
```bash
# Use these flags to avoid DNS rate limiting
subfinder -d target.com -t 50 -timeout 5
amass enum -d target.com -max-dns-queries 1000
dnsx -t 100 -rl 50
```

## Authorization
Getting DNS queries in the target's logs. Only perform active enumeration when you have explicit authorization.
