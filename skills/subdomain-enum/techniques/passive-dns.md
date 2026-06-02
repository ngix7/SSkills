# Passive DNS — AlienVault, SecurityTrails, RiskIQ

## Summary
Query passive DNS databases that cache historical DNS resolutions.

## AlienVault OTX

```bash
curl -s "https://otx.alienvault.com/api/v1/indicators/domain/target.com/passive_dns" \
  | jq -r '.passive_dns[]?.hostname' \
  | sort -u > otx_subs.txt

# Also check for URL correlations
curl -s "https://otx.alienvault.com/api/v1/indicators/domain/target.com/url_list?limit=500" \
  | jq -r '.url_list[]?.url' \
  | awk -F/ '{print $3}' \
  | sort -u
```

## SecurityTrails

```bash
# Requires free API key (limited requests)
curl -s "https://api.securitytrails.com/v1/domain/target.com/subdomains" \
  -H "APIKEY: $ST_API_KEY" \
  | jq -r '.subdomains[]' \
  | awk '{print $".target.com"}' \
  > st_subs.txt
```

## RiskIQ / PassiveTotal

```bash
# Requires API key
curl -s "https://api.passivetotal.org/v2/enrichment/subdomains" \
  -u "$PT_USER:$PT_KEY" \
  -d '{"query":"target.com"}' \
  | jq -r '.subdomains[]' \
  | awk '{print $".target.com"}' \
  > pt_subs.txt
```

## VirusTotal

```bash
# Requires free API key
curl -s "https://www.virustotal.com/api/v3/domains/target.com/subdomains" \
  -H "x-apikey: $VT_API_KEY" \
  | jq -r '.data[]?.id' \
  | sort -u
```

## Facebook ThreatExchange

```bash
# Rare but can find things
curl -s "https://graph.facebook.com/threat_exchange/v1" \
  -d "access_token=$FB_TOKEN" \
  -d "type=DOMAIN" \
  -d "text=target.com" \
  | jq -r '.data[]?.indicator.indicator'
```

## Notes
- Passive DNS never contacts the target
- Results come from caching DNS resolvers
- Some services require free API keys
- Combine all passive sources for max coverage
