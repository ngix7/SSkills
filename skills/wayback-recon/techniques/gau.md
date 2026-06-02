# GAU — Get All URLs (Aggregated)

## Summary
GAU fetches URLs from Wayback, CommonCrawl, AlienVault OTX, and URLScan in a single command.

## Installation
```bash
go install github.com/lc/gau/v2/cmd/gau@latest
```

## Basic Usage

```bash
# Get all URLs for a domain (all sources)
echo "target.com" | gau > all_urls.txt

# With subdomains
echo "target.com" | gau --subs > all_urls_with_subs.txt

# Filter by status code (Wayback only has this)
echo "target.com" | gau --status-codes 200,301

# Limit per source
echo "target.com" | gau --max-urls 5000
```

### Example Pipeline
```bash
DOMAIN="target.com"

echo "$DOMAIN" | gau --subs --max-urls 50000 | tee raw_urls.txt

# Filter interesting extensions
grep -vE '\.(png|jpg|jpeg|gif|css|ico|woff|woff2|ttf|eot)$' raw_urls.txt > filtered_urls.txt

# Extract JS files for analysis
grep -E '\.js(?:$|\?)' filtered_urls.txt > js_urls.txt

# Extract URLs with parameters
grep '=' filtered_urls.txt > param_urls.txt

# Extract API endpoints
grep -iE '/api/|/rest/|/graphql|/v[0-9]/' filtered_urls.txt > api_urls.txt

wc -l *.txt
```

### With Other Tools
```bash
# Combine GAU with waybackurls for max coverage
echo "target.com" | gau --subs > gau_urls.txt
echo "target.com" | waybackurls > wb_urls.txt
cat gau_urls.txt wb_urls.txt | sort -u > all_urls.txt
```

## Notes
- GAU aggregates: Wayback, CommonCrawl, AlienVault OTX, URLScan
- Fastest way to get a broad URL set
- Default max is unlimited per source (use --max-urls to cap)
- Completely passive
