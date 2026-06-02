# Wayback Recon Router

## Signal Classes
- `endpoint-discovered` — New URL/path found
- `parameter-found` — Parameter name/value extracted
- `historical-vulnerability` — Old vulnerable endpoint or leaked data
- `js-file` — JavaScript source URL discovered
- `hidden-path` — Path not linked from current site

## Triage Rules

### First pass: Collect everything
Run all archive sources in parallel. Don't filter yet.

### Second pass: Filter
Remove noise:
- Static assets (.png, .jpg, .css, .ico, .woff, .svg) — unless versioned
- Duplicate paths with different query strings
- Third-party CDN URLs

### Third pass: Prioritize
| Signal | Priority | Why |
|--------|----------|-----|
| `/?param=` | High | Parameter injection points |
| `/api/`, `/v1/`, `/graphql` | High | API endpoints |
| `/admin`, `/debug`, `/test` | High | Hidden admin panels |
| `*.js` | Medium | Extract endpoints from JS |
| `*.json`, `*.xml` | Medium | Config/data exposure |
| Old endpoints (2018-2022) | Medium | Removed but might be alive |
| Already-known paths | Low | Skip duplicates |

## Technique Selection

| Goal | Technique |
|------|-----------|
| Quick URL harvest | wayback-machine + gau |
| Deep parameter discovery | parameter-analysis |
| API endpoint discovery | js-analysis |
| Find hidden subdomains | subdomain-enum |
| Find removed/vulnerable paths | diff-analysis |
| Screenshot/page context | urlscan |
