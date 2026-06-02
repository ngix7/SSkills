# Reverse DNS — PTR Records

## Summary
Query PTR records for IP ranges to find hosts by their reverse DNS names.

## When to Use
- You know the target's IP ranges (from ASN lookup)
- The target has configured PTR records on their IPs
- Useful for discovering hosts that don't have forward DNS records

## Basic

```bash
# Reverse lookup a single IP
dig +short -x 192.168.1.1

# Batch reverse lookup
cat ip_list.txt | xargs -P50 -I{} sh -c 'echo "{}: $(dig +short -x {} 2>/dev/null)"'
```

## From ASN

```bash
# 1. Find ASN
whois -h whois.radb.net -- "-i origin AS1234" | grep "^route:" | awk '{print $2}' > ip_ranges.txt

# 2. Expand IP ranges (using mapcidr)
# go install github.com/projectdiscovery/mapcidr/cmd/mapcidr@latest
cat ip_ranges.txt | mapcidr -silent > all_ips.txt

# 3. Reverse DNS on all IPs
dnsx -ptr -l all_ips.txt -resp-only -o reverse_subs.txt
```

## Using dnsx

```bash
# PTR lookup on IP range
echo "203.0.113.0/24" | dnsx -ptr -resp-only -silent

# With output containing both IP and hostname
echo "203.0.113.0/24" | dnsx -ptr -o ptr_results.txt
```

## Filter Results

```bash
# Extract only hosts matching your target domain
grep -E '\.target\.com$' reverse_subs.txt | sort -u > target_ptr_subs.txt

# Also check subdomains of related orgs
grep -E '(target|acme|corp)' reverse_subs.txt > related_ptr_subs.txt
```

## Notes
- PTR records are optional — many hosts don't have them
- ISPs often set generic PTRs (dynamic-ip-192-168-1-1.example.net)
- Only useful when you know the target's IP ranges
- Completely passive (uses public DNS)
