# Web Cache Poisoning & Deception Router

## Signal Classes
- `cache-unkeyed-input` — Header, cookie, or parameter not included in cache key
- `cache-poisoned` — Cache poisoned with attacker-controlled content
- `cache-deception` — Sensitive page stored in the cache through path manipulation

## Triage Rules

1. Identify caching layers (CDN, reverse proxy, browser cache)
2. Determine cache key composition from response headers (`X-Cache`, `Age`, `CF-Cache-Status`)
3. Test unkeyed inputs by adding arbitrary headers and observing cache behaviour
4. Validate that the unkeyed input is reflected in the cached response
5. Assess impact: reflected XSS, stored XSS via cache, sensitive data exposure

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Unkeyed input discovered | unkeyed-inputs |
| Cache storing restricted/sensitive pages | cache-deception |
| Unkeyed input reflected in response | poison-to-rfp |
| Stored content cached and served to others | poison-to-stored |

## Rejection Rules

- Input is keyed (changing it produces a different cache entry) → Reject
- Unkeyed input not reflected or affecting response → Informational only
- Cache only for unauthenticated users and no sensitive content → Reject
- Path-based cache exclusion already in place → Reject
