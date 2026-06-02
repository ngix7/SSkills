# DNS Zone Transfer (AXFR)

## Summary
Attempt to request a full copy of the target's DNS zone. Rarely works but when it does, it reveals everything in one shot.

## Basic

```bash
# Find nameservers first
dig +short ns target.com

# Try AXFR against each nameserver
dig axfr @ns1.target.com target.com
dig axfr @ns2.target.com target.com

# Using dnsx
dnsx -l nameservers.txt -axfr -retry 0 2>/dev/null
```

## Automated

```bash
#!/bin/bash
DOMAIN="target.com"
NAMESERVERS=$(dig +short ns "$DOMAIN")

for NS in $NAMESERVERS; do
  echo "[*] Trying AXFR on $NS..."
  RESULT=$(dig axfr "@$NS" "$DOMAIN" 2>&1)

  if echo "$RESULT" | grep -q "Transfer failed\|refused\|timed out"; then
    echo "  [-] $NS: AXFR rejected (expected)"
  elif echo "$RESULT" | grep -q "AXFR"; then
    echo "  [+] $NS: AXFR SUCCESS!"
    echo "$RESULT" | grep -E 'IN\s+(A|AAAA|CNAME|MX|NS|TXT)' | tee -a axfr_records.txt
  fi
done
```

## Quick Check

```bash
# One-liner: try AXFR on all nameservers
dig +short ns target.com | xargs -P10 -I{} sh -c 'echo "Checking {}"; dig axfr @{} target.com +short' | grep -v '^$'
```

## What to Extract

```bash
# From a successful zone transfer:
# A records (IPs)
grep "IN\s\+A" axfr_records.txt | awk '{print $1}' | sort -u > subdomains.txt
# CNAME records (aliases)
grep "IN\s\+CNAME" axfr_records.txt | awk '{print $1,$5}' > cnames.txt
# MX records (mail servers)
grep "IN\s\+MX" axfr_records.txt > mx_records.txt
# TXT records (SPF, DKIM, etc.)
grep "IN\s\+TXT" axfr_records.txt > txt_records.txt
```

## Notes
- Works in < 1% of targets (DNS misconfiguration)
- When it works, it's the most complete source possible
- **Can trigger IDS/IPS** — some orgs monitor for AXFR attempts
- Only attempt with explicit authorization
- Test with `dnsrecon` as well: `dnsrecon -d target.com -t axfr`
