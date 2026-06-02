# URLScan.io — Screenshot & Request Data

## Summary
Query URLScan.io for screenshots, DOM snapshots, and HTTP request data of live pages.

## API

```bash
# Search for a domain
curl -s "https://urlscan.io/api/v1/search/?q=domain:target.com&size=100" \
  | jq -r '.results[]?.page?.url' \
  | sort -u > urlscan_urls.txt
```

### Get Full Page Data
```bash
# For a specific scan UUID, get full request/response data
SCAN_UUID="..."
curl -s "https://urlscan.io/api/v1/result/$SCAN_UUID/" \
  | jq -r '.data.requests[]?.request?.url' \
  | sort -u
```

### Extract JavaScript URLs
```bash
curl -s "https://urlscan.io/api/v1/search/?q=domain:target.com&size=100" \
  | jq -r '.results[]?.task?.url' \
  | grep -E '\.js' \
  | sort -u
```

### Parameters
```bash
# Search with filters
curl -s "https://urlscan.io/api/v1/search/" \
  --data-urlencode "q=domain:target.com AND page.status:200" \
  --data-urlencode "size=10000" \
  | jq -r '.results[]?.page?.url' | sort -u
```

## Notes
- Free tier: 10 requests/minute without API key
- With free API key: 50 requests/minute
- URLScan also shows HTTP headers, cookies, DOM content
- Useful for finding live endpoints (not just historical)
