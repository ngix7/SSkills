# Wayback & Historical URL Recon

Passive reconnaissance using internet archives to discover endpoints, parameters, JS files, and hidden attack surfaces without sending a single request to the target.

## Why Wayback Recon?

Archives store every URL the target ever exposed — old endpoints, debug paths, leaked API keys in parameters, JS files with endpoints, and historical vulnerabilities. All passive, all free.

## Techniques

| Technique | Source | What you get |
|-----------|--------|-------------|
| [Wayback Machine](techniques/wayback-machine.md) | archive.org CDX API | URLs across all time with timestamps |
| [CommonCrawl](techniques/commoncrawl.md) | CommonCrawl index | URLs from web crawls |
| [AlienVault OTX](techniques/alienvault-otx.md) | AlienVault OTX | Passive DNS, URL pulses, correlations |
| [URLScan.io](techniques/urlscan.md) | URLScan.io | Screenshots, DOM, requests of live pages |
| [GAU](techniques/gau.md) | All sources aggregated | One-shot fetch from all archives |
| [Parameter Analysis](techniques/parameter-analysis.md) | Extracted URLs | Parameters, their names and values |
| [JS Analysis](techniques/js-analysis.md) | Extracted JS URLs | Endpoints, API keys, internal paths |
| [Historical Diff](techniques/diff-analysis.md) | Wayback CDX | Changes over time, removed endpoints |
| [Subdomain Enum](techniques/subdomain-enum.md) | All sources | Subdomains from TLS certs, DNS, URLs |

## Tooling

```bash
# Install key tools
go install github.com/tomnomnom/waybackurls@latest
go install github.com/lc/gau/v2/cmd/gau@latest
go install github.com/tomnomnom/unfurl@latest
go install github.com/tomnomnom/qsreplace@latest
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
```

## Pipeline

```
Domain → Wayback URLs → Filter → Unique params → Alive check → Manual review
                              ↓
                         JS files → Extract endpoints
                              ↓
                         Hidden paths → Discovered!
```

## Safety

| Technique | Active? | Safe? |
|-----------|---------|-------|
| Wayback CDX | No | ✅ Fully passive |
| CommonCrawl | No | ✅ Fully passive |
| AlienVault OTX | No | ✅ Fully passive |
| URLScan.io | No | ✅ Uses cached data |
| GAU | No | ✅ Fully passive |
| httpx (alive check) | **Yes** | ⚠️ Sends HTTP requests |

See [safety.md](safety.md).
