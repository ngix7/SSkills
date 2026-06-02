# Search Engine Dorking

## Summary
Use search engines to find subdomains indexed in their results.

## Google Dorks

```bash
# Basic
site:*.target.com

# Exclude main domain
site:*.target.com -site:www.target.com

# Specific file types (might reveal internal hosts)
site:*.target.com filetype:pdf
site:*.target.com filetype:xlsx
site:*.target.com filetype:log
site:*.target.com intitle:"index of"

# With specific technologies
site:*.target.com inurl:wp-admin
site:*.target.com inurl:jenkins
site:*.target.com inurl:grafana
site:*.target.com inurl:phpMyAdmin

# Error messages that leak internal hostnames
site:*.target.com "SQL Server" "error"
site:*.target.com "Warning" "include("
```

## Bing

```bash
# Bing has different crawling patterns
domain:target.com
site:target.com -site:www.target.com
```

## Shodan

```bash
# Shodan query for subdomains
hostname:target.com
ssl.cert.subject.cn:target.com
org:"Target Org Name"
```

## Wayback Machine (as Search)

```bash
# The Wayback CDX is effectively a search engine
curl -s "https://web.archive.org/cdx/search/cdx?url=target.com/*&output=json&fl=original&limit=100000" \
  | jq -r '.[] | select(.[0] != "original") | .[0]' \
  | awk -F/ '{print $3}' \
  | sort -u
```

## Notes
- Search engines only index public content
- Google dorks can be automated but are slow
- Rate limits apply (Google blocks automated queries)
- Wayback data is often the most valuable "search engine" source
- Manual search is sometimes better than automated (you spot patterns)
