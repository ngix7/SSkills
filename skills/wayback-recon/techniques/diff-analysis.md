# Historical Diff Analysis

## Summary
Compare archived versions of the same URL over time to discover removed endpoints, changed behavior, or leaked data.

## Using Wayback Machine Diff

```bash
# Get all timestamps for a specific URL
curl -s "https://web.archive.org/cdx/search/cdx?url=https://target.com/admin&output=json&fl=timestamp,statuscode" \
  | jq -r '.[] | @tsv'

# Get the content from two different timestamps and diff
curl -s "https://web.archive.org/web/20200101000000if_/https://target.com/admin" > admin_2020.html
curl -s "https://web.archive.org/web/20230101000000if_/https://target.com/admin" > admin_2023.html
diff admin_2020.html admin_2023.html > admin_diff.txt
```

## Find Removed Endpoints

```bash
# Get all URLs and check which are 404 now
echo "target.com" | gau > historical_urls.txt

# Check which are still alive
cat historical_urls.txt | while read url; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  echo "$code $url"
done | tee alive_check.txt

# Removed endpoints (were in archive, now 404)
grep "^404" alive_check.txt > removed_endpoints.txt

# Changed endpoints (different status now)
grep "^[23]" alive_check.txt > changed_endpoints.txt
```

## Detect Content Changes

```bash
# For a critical endpoint, compare old vs new content
# If old version had different functionality that's now removed
OLD=$(curl -s "https://web.archive.org/web/20200101000000/https://target.com/api/users" | md5sum)
NEW=$(curl -s "https://web.archive.org/web/20230101000000/https://target.com/api/users" | md5sum)

if [ "$OLD" != "$NEW" ]; then
  echo "Content changed between 2020 and 2023!"
fi
```

## Find Exposed Data in Old Versions

```bash
# Search for secrets in old versions of specific paths
for TIMESTAMP in 2019 2020 2021 2022; do
  curl -s "https://web.archive.org/web/${TIMESTAMP}0101000000/https://target.com/.env" \
    | grep -i 'API_KEY\|SECRET\|PASSWORD' \
    && echo "Found secrets in $TIMESTAMP snapshot!"
done
```

## Notes
- The `if_` suffix in Wayback URLs returns the raw content (no Wayback banner)
- Diffing is most useful for:
  - Admin panels that were exposed then hidden
  - API endpoints that changed their response format
  - Pages that used to display sensitive data
  - JS files that removed debug endpoints
