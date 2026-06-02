# Safety Gates: Wayback Recon

## Hard Gates

- ⛔ **No active scanning** during collection phase — use only archive APIs
- ⛔ **No rate limit abuse** — respect archive.org rate limits (2 req/s)
- ⛔ **No crawling** — only use pre-collected data
- ⛔ **No authentication** — archive data is public

## Alive Check Warning

When using `httpx` or `curl` to check if discovered URLs are alive:
- This sends real HTTP requests to the target
- The target may log these requests
- Only do this with authorization

## Data Handling

- Wayback data is public domain
- But if you discover PII or secrets in historical URLs:
  - ⛔ Do not exfiltrate
  - ⛔ Do not store in version control
  - Redact in reports

## Rate Limits

| Source | Limit |
|--------|-------|
| archive.org CDX | ~2 requests/second |
| CommonCrawl | No rate limit (static files) |
| AlienVault OTX | 1 request/second |
| URLScan.io | 10 requests/minute (no API key) |
