# Subdomain Enumeration

Discover subdomains of a target domain using passive and active techniques. Subdomain enumeration reveals the full attack surface beyond the main application.

## Principles

1. **No single source is complete** — combine all techniques
2. **Passive first** (no direct contact), then active with authorization
3. **Validate findings** — not all subdomains resolve or are in scope
4. **Wildcards lie** — a wildcard DNS entry makes everything "resolve"

## Techniques

| Technique | Type | Speed | Coverage |
|-----------|------|-------|----------|
| [DNS Brute Force](techniques/dns-brute-force.md) | Active | Fast | Good with good wordlist |
| [Certificate Transparency](techniques/certificate-transparency.md) | Passive | Fast | Excellent |
| [Passive DNS](techniques/passive-dns.md) | Passive | Fast | Good |
| [Zone Transfer](techniques/zone-transfer.md) | Active | Instant | Rare (blocked 99%) |
| [Reverse DNS](techniques/reverse-dns.md) | Active | Medium | Depends on IP range |
| [TLS Scanning](techniques/tls-scanning.md) | Passive | Slow | Excellent |
| [Search Engines](techniques/search-engines.md) | Passive | Slow | Supplementary |
| [DNS Resolution](techniques/dns-resolution.md) | Validation | Fast | Validates all findings |

## Tooling

```bash
# Key tools
go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install github.com/owasp-amass/amass/v4/...@master
go install github.com/projectdiscovery/dnsx/cmd/dnsx@latest
go install github.com/tomnomnom/httpx/cmd/httpx@latest
go install github.com/projectdiscovery/chaos-client/cmd/chaos@latest
go install github.com/d3mondev/puredns/v2@latest
```

## Pipeline

```
Domain
  ├─ Passive: CT logs, Passive DNS, TLS scans, Search engines → subs.txt
  ├─ Active: DNS brute-force, Reverse DNS → more_subs.txt
  └─ Validation: resolve, filter wildcards, check alive → final_subs.txt
                                              ↓
                                        httpx → live_hosts.txt
```

## Output

See [output-schema.json](output-schema.json) for structured findings.
