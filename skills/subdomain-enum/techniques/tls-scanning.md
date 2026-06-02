# TLS Certificate Scanning — Censys, Shodan, Project Sonar

## Summary
Query TLS certificate databases that scan the entire internet and store certificate details.

## Censys

```bash
# Censys v2 API (free tier available)
curl -s -u "$CENSYS_API_ID:$CENSYS_SECRET" \
  "https://search.censys.io/api/v2/certificates/search?q=parsed.names:target.com&per_page=100" \
  | jq -r '.result.hits[]?.parsed?.subject_dn?.split(",")[]?' \
  | grep -oP '[a-z0-9_.-]+\.target\.com' \
  | sort -u
```

## Project Sonar (Rapid7 FDNS)

```bash
# Download the latest Sonar FDNS dataset
# This is large (GBs) but the most comprehensive passive source
wget "https://opendata.rapid7.com/sonar.fdns_v2/" -O sonar_fdns.gz

# Extract target.com subdomains
zgrep -E '\.target\.com' sonar_fdns.gz \
  | awk -F',' '{print $2}' \
  | sort -u > sonar_subs.txt
```

## Shodan

```bash
# Requires Shodan API key
curl -s "https://api.shodan.io/shodan/host/search?key=$SHODAN_KEY\
  &query=ssl.cert.subject.CN:%25.target.com&limit=1000" \
  | jq -r '.matches[]?.ssl?.cert?.subject?.CN' \
  | sort -u
```

## Tools

```bash
# Use subfinder which queries Censys, Shodan, etc.
subfinder -d target.com -all \
  -s censys,shodan,chaos,sonar \
  -o subs_cert.txt
```

## Notes
- Censys and Shodan have free tiers with limited queries
- Project Sonar is the most comprehensive but requires downloading large datasets
- These sources find subdomains NOT linked from any website
- Historical certificates show old/decommissioned hosts
