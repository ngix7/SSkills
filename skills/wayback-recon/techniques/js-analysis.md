# JavaScript Endpoint Extraction

## Summary
Extract API endpoints, internal paths, and secrets from JS files discovered via archive URLs.

## Collect JS Files

```bash
# From GAU/Wayback output
cat all_urls.txt | grep -E '\.js(?:$|\?)' | sort -u > js_files.txt

# Also check source maps
cat all_urls.txt | grep -E '\.js\.map' | sort -u > js_map_files.txt
```

## Extract Endpoints from JS

### Using grep
```bash
# Extract API-like paths from JS files
while read url; do
  curl -s "$url" | grep -oP '["'\''](?:https?://[^"'\'']*target\.com[^"'\'']*|/[a-zA-Z0-9_/.-]*(?:api|rest|graphql|v[0-9])[^"'\'']*)["'\'']' \
    | tr -d '"' | sort -u >> js_endpoints.txt
done < js_files.txt

# Common patterns to look for
PATTERNS=(
  '/api/'
  '/rest/'
  '/graphql'
  '/admin'
  '/internal'
  '/debug'
  '/webhook'
  '/callback'
  'rpc'
  'trpc'
  '.php'
  '.aspx'
  '/wp-'
)
for pattern in "${PATTERNS[@]}"; do
  grep -i "$pattern" js_endpoints.txt >> api_endpoints_found.txt
done
```

### Extract Route Patterns
```bash
# Find Angular/React route definitions
while read url; do
  curl -s "$url" | grep -oP '(?:path|route|router):\s*["'\'']([^"'\'']+)["'\'']' \
    | cut -d: -f2 | tr -d ' "\' 
done < js_files.txt | sort -u
```

## Extract Secrets and API Keys

```bash
# Common secret patterns
while read url; do
  curl -s "$url" | grep -oiP '(?:api[_-]?key|apikey|secret|token|password|passwd)[=:]["'\'']?[A-Za-z0-9_\-]{10,}["'\'']?' \
    >> js_secrets.txt
done < js_files.txt

# Firebase URLs
grep -oP 'https://[^"'\'']+\.firebaseio\.com' js_endpoints.txt

# AWS endpoints
grep -oP '\.execute-api\.[a-z-]+\.amazonaws\.com' js_endpoints.txt
```

## Extract with Tools
```bash
# Use linkfinder (Python)
# pip install linkfinder
python -m linkfinder -i "$JS_FILE" -o cli

# Use jsubfinder (Go)
# go install github.com/hiddengearz/jsubfinder@latest
cat js_files.txt | jsubfinder
```

## Notes
- JS files from archives may reference endpoints that no longer exist
- But those endpoints might be accessible via older API versions
- Source maps (.js.map) often reveal the full uncompressed source
- Old JS files may contain development/debug endpoints
