# Parameter Discovery & Analysis

## Summary
Extract and analyze URL parameters from historical URLs to find injection points.

## Extract Parameters from URLs

```bash
# Using unfurl (go install github.com/tomnomnom/unfurl@latest)
cat all_urls.txt | unfurl keys | sort -u > all_params.txt

# Using qsreplace (go install github.com/tomnomnom/qsreplace@latest)
cat all_urls.txt | qsreplace > normalized_urls.txt

# Get URLs with a specific parameter
cat all_urls.txt | grep '?.*id=' > id_param_urls.txt
cat all_urls.txt | grep '?.*redirect=' > redirect_param_urls.txt
cat all_urls.txt | grep '?.*url=' > url_param_urls.txt
cat all_urls.txt | grep '?.*file=' > file_param_urls.txt
cat all_urls.txt | grep '?.*token=' > token_param_urls.txt
```

## Interesting Parameters to Hunt

```bash
# Create targeted lists for specific attack classes
grep -P '[\?&](url|redirect|return|next|target|dest|destination)=' all_urls.txt > open_redirect_candidates.txt
grep -P '[\?&](id|uid|pid|order|account|user|profile)=' all_urls.txt > idor_candidates.txt
grep -P '[\?&](q|s|search|query|keyword|term)=' all_urls.txt > sqli_xss_candidates.txt
grep -P '[\?&](file|page|path|dir|doc|folder|include|require)=' all_urls.txt > lfi_candidates.txt
grep -P '[\?&](api_key|apikey|token|secret|pass|password)=' all_urls.txt > secret_leak_candidates.txt
```

## Analyze Parameter Values

```bash
# See what values were used for specific params
cat all_urls.txt | unfurl format %q | tr '&' '\n' | grep '^id=' | sort -u | head -20

# Check for base64/encoded values in parameters
grep -P '[\?&]\w+=([A-Za-z0-9+/]{20,}={0,2})' all_urls.txt > base64_param_candidates.txt

# Check for UUID patterns
grep -P '[\?&]\w+=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' all_urls.txt > uuid_param_urls.txt
```

## Parameter Frequency Analysis
```bash
# Find most common parameter names (helps find patterns)
cat all_urls.txt | unfurl keys | sort | uniq -c | sort -rn | head -30
```

## Notes
- Old URLs may have parameters from testing, debug, or deprecated features
- Parameters that appear in archives but not in the current app are high-value targets
- Parameter values in archives might contain secrets that were never changed
