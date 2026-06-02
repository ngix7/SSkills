# Subdomain Enumeration via Archives

## Summary
Discover subdomains using passive DNS and URL data from archives.

## From Wayback/CDX

```bash
# Extract subdomains from Wayback URLs
echo "target.com" | waybackurls | unfurl domain | sort -u | grep -E '\.target\.com$'

# Or from raw CDX
curl -s "https://web.archive.org/cdx/search/cdx?url=*.target.com&output=json&fl=original" \
  | jq -r '.[] | select(.[0] != "original") | .[0]' \
  | awk -F/ '{print $3}' \
  | sort -u
```

## From GAU

```bash
echo "target.com" | gau --subs | unfurl domain | sort -u > gau_subs.txt
```

## From AlienVault OTX (Passive DNS)

```bash
curl -s "https://otx.alienvault.com/api/v1/indicators/domain/target.com/passive_dns" \
  | jq -r '.passive_dns[]?.hostname' \
  | sort -u \
  | grep -E '\.target\.com$' > otx_subs.txt
```

## From Certificate Transparency (CT Logs)

```bash
# crt.sh
curl -s "https://crt.sh/?q=%25.target.com&output=json" \
  | jq -r '.[].name_value' \
  | sort -u > crtsh_subs.txt

# CertSpotter
curl -s "https://api.certspotter.com/v1/issuances\?domain=target.com\&include_subdomains=true\&expand=dns_names" \
  | jq -r '.[].dns_names[]' \
  | sort -u
```

## Combine All Sources

```bash
# Merge everything into one unique list
cat gau_subs.txt otx_subs.txt crtsh_subs.txt wayback_subs.txt \
  | sort -u > all_subs.txt

# Count
wc -l all_subs.txt
```

## Notes
- Archive-based subdomain enumeration is fully passive
- Archives often find subdomains that DNS brute-force misses
- Old subdomains may still resolve even if the service is removed
- Combine with CT logs (crt.sh) for maximum coverage
