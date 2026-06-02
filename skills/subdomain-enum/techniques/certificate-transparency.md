# Certificate Transparency — crt.sh, CertSpotter, Google CT

## Summary
Query Certificate Transparency logs for subdomains. Every TLS certificate issued for your target is publicly logged.

## crt.sh

```bash
# Basic — JSON output
curl -s "https://crt.sh/?q=%25.target.com&output=json" \
  | jq -r '.[].name_value' \
  | sort -u > crtsh_subs.txt

# Wildcard certs expand to include the base
curl -s "https://crt.sh/?q=target.com&output=json" \
  | jq -r '.[].name_value' \
  | sed 's/\*\.//' \
  | sort -u

# Identity tracking — subdomains are often re-used across identities
curl -s "https://crt.sh/?q=%25.target.com&output=json" \
  | jq -r '.[].common_name' \
  | sort -u
```

## CertSpotter

```bash
# SSLMate CertSpotter API
curl -s "https://api.certspotter.com/v1/issuances\?domain=target.com\&include_subdomains=true\&expand=dns_names" \
  | jq -r '.[].dns_names[]' \
  | sed 's/\*\.//' \
  | sort -u
```

## Google CT

```bash
# Google's Certificate Transparency API
curl -s "https://certificate.transparency.googleapis.com/v1/query?domain=target.com" \
  | jq -r '.[].dns_names[] // empty' \
  | sort -u
```

## Censys

```bash
# Censys v2 API (requires free API key)
curl -s -u "$CENSYS_API_ID:$CENSYS_SECRET" \
  "https://search.censys.io/api/v2/hosts/search?q=services.tls.certificates.leaf_data.subject.common_name:*.target.com" \
  | jq -r '.result.hits[]?.name' \
  | sort -u
```

## Aggregated

```bash
# Combine all CT sources
cat crtsh_subs.txt certspotter_subs.txt google_ct_certs.txt \
  | sort -u > ct_all_subs.txt

# Filter out wildcard lines and base domain
grep -vE '^\*|^target\.com$' ct_all_subs.txt > ct_filtered.txt
```

## Notes
- CT logs are the single best passive source for subdomains
- They catch subdomains that were never publicly linked
- Including historical certs (expired) often reveals old/decommissioned subdomains
- Rate limit: crt.sh is free, ~1 req/s
