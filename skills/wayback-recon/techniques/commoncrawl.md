# CommonCrawl — Index Search

## Summary
Query the CommonCrawl index for URLs. CommonCrawl is a massive web crawl dataset, larger than Wayback in some periods.

## API Endpoint

```bash
# Basic search
curl -s "https://index.commoncrawl.org/CC-MAIN-2024-10-index?url=*.target.com&output=json" \
  | jq -r '.url' \
  | sort -u > commoncrawl_urls.txt
```

### Available Indexes
```bash
# List available crawl indexes
curl -s "https://index.commoncrawl.org/" | jq -r '.[]' | sort
# Pick the most recent: CC-MAIN-YYYY-NN
```

### Parameters
```bash
# With filters
curl -s "https://index.commoncrawl.org/CC-MAIN-2024-10-index" \
  --data-urlencode "url=*.target.com" \
  --data-urlencode "output=json" \
  --data-urlencode "filter=status:200" \
  --data-urlencode "limit=10000" \
  | jq -r '.url' | sort -u
```

## Automated Script
```bash
#!/bin/bash
DOMAIN="target.com"
for INDEX in $(curl -s "https://index.commoncrawl.org/" | jq -r '.[]' | tail -5); do
  echo "[*] Fetching $INDEX..."
  curl -s "https://index.commoncrawl.org/$INDEX-index?url=*.$DOMAIN&output=json" \
    | jq -r '.url // empty' >> all_cc_urls.txt
  sleep 1
done
sort -u all_cc_urls.txt -o all_cc_urls.txt
wc -l all_cc_urls.txt
```

## Notes
- CommonCrawl data is static files, no rate limits
- Multiple indexes cover different time periods
- Combine with Wayback results for maximum coverage
