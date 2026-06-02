# AlienVault OTX — Passive DNS & URL

## Summary
Query AlienVault Open Threat Exchange (OTX) for URLs, passive DNS, and correlations.

## API

```bash
# Get all URLs known for a domain
curl -s "https://otx.alienvault.com/api/v1/indicators/domain/target.com/url_list?limit=500" \
  | jq -r '.url_list[]?.url' 2>/dev/null \
  | sort -u > otx_urls.txt
```

### Passive DNS
```bash
# Get subdomains from passive DNS
curl -s "https://otx.alienvault.com/api/v1/indicators/domain/target.com/passive_dns" \
  | jq -r '.passive_dns[]?.hostname' \
  | sort -u > otx_subdomains.txt
```

### Pagination
```bash
# OTX paginates at 50 results per page
PAGE=1
while true; do
  RESULT=$(curl -s "https://otx.alienvault.com/api/v1/indicators/domain/target.com/url_list?limit=50&page=$PAGE")
  COUNT=$(echo "$RESULT" | jq -r '.url_list[]?.url' | wc -l)
  [ "$COUNT" -eq 0 ] && break
  echo "$RESULT" | jq -r '.url_list[]?.url' >> otx_urls.txt
  PAGE=$((PAGE + 1))
  sleep 1
done
sort -u otx_urls.txt -o otx_urls.txt
```

## Notes
- Free, no API key required for basic queries
- Rate limit: ~1 request/second
- Also provides malware/pulse correlations (good for historical compromise checks)
