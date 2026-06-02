# Wayback Machine (archive.org) — CDX API

## Summary
Query the Wayback Machine CDX API for all URLs archived under a domain.

## Basic Usage

### cURL (no tools needed)
```bash
# Get all URLs for a domain
curl -s "https://web.archive.org/cdx/search/cdx?url=*.target.com&output=json&fl=original,statuscode,timestamp&limit=10000" \
  | jq -r '.[] | select(.[0] != "original") | .[0]' \
  | tee wayback_urls.txt
```

### Parameters
| Parameter | Description |
|-----------|-------------|
| `url=*.target.com` | Wildcard for all subdomains |
| `output=json` | JSON format (default is text) |
| `fl=original,statuscode,timestamp` | Fields to return |
| `limit=10000` | Max results (default ~1500) |
| `from=2020` | Start year |
| `to=2024` | End year |
| `gzip=true` | Compressed response |

### Using waybackurls (Go tool)
```bash
# Install: go install github.com/tomnomnom/waybackurls@latest

# Basic
echo "target.com" | waybackurls > urls.txt

# With subdomains
echo "target.com" | waybackurls -no-subs > urls.txt          # Only target.com
echo "target.com" | waybackurls > urls.txt                    # target.com + *.target.com

# Filter by status code
echo "target.com" | waybackurls | grep -E '^https?://' > urls.txt
```

## Filtering Results

```bash
# Extract unique paths
cat urls.txt | unfurl paths | sort -u > paths.txt

# Extract unique parameters
cat urls.txt | unfurl keys | sort -u > params.txt

# Extract JS files
cat urls.txt | grep -E '\.js(?:$|\?)' > js_files.txt

# Extract API endpoints
cat urls.txt | grep -iE '/api/|/v1/|/v2/|/graphql|/rest/' > api_endpoints.txt

# Extract URLs with parameters
cat urls.txt | grep '?' > parametrized_urls.txt

# Oldest first (by timestamp if you have it)
cat urls.txt | sort -t '/' -k 3 > urls_by_time.txt
```

## Identify Removed Endpoints
```bash
# Get URLs, then check which are 404 now -> were removed
# Useful for finding deprecated API versions
httpx -l urls.txt -mc 200,403,401 -o alive.txt
comm -23 <(sort urls.txt) <(sort alive.txt) > removed.txt
```

## Notes
- Rate limit: ~2 requests/second
- Large domains may have millions of URLs — use `limit` or `from`/`to` filters
- The CDX API is free and requires no authentication
