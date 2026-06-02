# Open Redirect Detection

## Summary
Identify parameters that control redirect destinations and determine if they are user-controllable.

## Parameter Discovery

Common parameter names across frameworks:
- `url`, `redirect`, `next`, `return` — common in OAuth, payment flows
- `redirect_uri`, `redirect_url`, `return_url` — OAuth and SSO
- `rurl`, `goto`, `target`, `path`, `dest`, `callback` — various frameworks
- `OutboundRedirect`, `redirectTo`, `Redirect` — enterprise apps
- `u`, `r`, `p`, `n` — short-form parameters (minified JS)

## Automated Scanning

```bash
# Crawl for redirect-like parameters using wayback or grep
grep -oP '[?&](redirect|url|next|return|goto|target|dest|callback)=' urls.txt | sort -u

# Use curl to probe each param with a known external URL
curl -sv "https://target.com/login?redirect=http://attacker.com/" 2>&1 | grep -i "location:"

# Follow redirects and check final destination
curl -Lsv "https://target.com/logout?goto=http://attacker.com/" 2>&1
```

## Response Analysis

| HTTP Status | Meaning |
|-------------|---------|
| `301` / `302` / `307` / `308` | Server-side redirect — check Location header |
| `200` with `window.location` | Client-side JavaScript redirect |
| `200` with `<meta http-equiv="refresh">` | Meta refresh redirect |
| `200` with form auto-submit | POST redirect via JS |

## Client-Side Detection

```javascript
// Look for these patterns in JS bundles
window.location =
window.location.href =
window.open(
document.location =
location.replace(
window.navigate(
```

## Bash Probe Script

```bash
#!/bin/bash
# Quick redirect probe across common parameters
TARGET="https://target.com"
COLLAB="http://attacker.com/redir-test"
PARAMS=("url" "redirect" "next" "goto" "return" "redirect_uri" "dest")
for p in "${PARAMS[@]}"; do
  STATUS=$(curl -so /dev/null -w "%{http_code}" "$TARGET/login?$p=$COLLAB")
  LOC=$(curl -sI "$TARGET/login?$p=$COLLAB" | grep -i "^location:")
  echo "[$STATUS] $p -> $LOC"
done
```

