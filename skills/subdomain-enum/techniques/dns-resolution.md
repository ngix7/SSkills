# DNS Resolution & Validation

## Summary
Validate discovered subdomains: resolve IPs, filter wildcards, check HTTP status.

## Wildcard Detection

```bash
# Critical first step — check if wildcard DNS exists
dig @1.1.1.1 "nonexistent-12345.target.com" +short

# If it returns an IP, wildcard is present
# All subsequent results need special handling:
# - puredns handles this automatically
# - dnsx can filter with -wildcard
```

## Resolution

```bash
# Using dnsx
cat all_subs_found.txt | dnsx -a -resp -o resolved_subs.txt

# Extract A records only
dnsx -l all_subs_found.txt -a -resp-only -silent > ips.txt

# Also get CNAME records
dnsx -l all_subs_found.txt -cname -resp-only -silent > cnames.txt
```

## HTTP Probing

```bash
# Check which resolved subdomains serve HTTP
httpx -l resolved_subs.txt -status-code -title -content-length \
  -tech-detect -o live_hosts.txt

# Filter by status code
httpx -l resolved_subs.txt -mc 200,403,401,500 -o interesting.txt

# Screenshot
httpx -l resolved_subs.txt -screenshot -srd screenshots/
```

## Deduplication

```bash
# Remove duplicates
sort -u subs.txt -o subs.txt

# Remove base domain
grep -vE '^target\.com$' subs.txt > subs_filtered.txt

# Remove wildcard-caught noise (puredns handles this)
# Manual: compare IPs — if all unknown subdomains resolve to same IP, wildcard
```

## Automated Pipeline

```bash
#!/bin/bash
DOMAIN="target.com"

# 1. Gather
subfinder -d "$DOMAIN" -all > passive.txt
puredns bruteforce wordlist.txt "$DOMAIN" -r resolvers.txt > brute_subs.txt

# 2. Combine
cat passive.txt brute_subs.txt | sort -u > all_subs.txt

# 3. Resolve
dnsx -l all_subs.txt -a -resp -o resolved.txt

# 4. HTTP probe
httpx -l resolved.txt -status-code -title -tech-detect -o live.txt

echo "Total found: $(wc -l < all_subs.txt)"
echo "Resolved: $(wc -l < resolved.txt)"
echo "Live HTTP: $(wc -l < live.txt)"
```

## Notes
- Always resolve and validate — many archived subdomains are dead
- Filter wildcards EARLY (they pollute results)
- httpx probes send real HTTP requests — only with authorization
- CDN IPs (Cloudflare, Akamai) mean you can't trust the IP alone
