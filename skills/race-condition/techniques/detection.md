# Race Condition Detection

## Summary
Identify endpoints that process concurrent requests on shared mutable state without adequate locking or atomicity.

## Detection

### Step 1: Identify Candidate Endpoints
Focus on state-changing operations that should be idempotent or single-use:
- Gift card or voucher redemption
- Coupon or discount code application
- Fund transfers or balance deductions
- Product stock decrements
- Voting or rating submissions
- Account registration or email changes
- File uploads with rename operations

### Step 2: Send Concurrent Requests
Use curl in parallel or a purpose-built tool:

```bash
# Parallel curl using xargs
seq 1 20 | xargs -P 20 -I {} curl -s -X POST "https://target.com/api/redeem" \
  -H "Cookie: session=abc123" \
  -d "coupon=SAVE50" -w "Request {}: %{http_code}\n"
```

```python
# Python asyncio example
import asyncio
import aiohttp

async def race(session, url, data):
    async with session.post(url, data=data) as resp:
        return await resp.text()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [race(session, "https://target.com/api/redeem", "coupon=SAVE50") for _ in range(20)]
        results = await asyncio.gather(*tasks)
        successes = [r for r in results if '"success":true' in r]
        print(f"Successful redemptions: {len(successes)} / 20")

asyncio.run(main())
```

### Step 3: Analyse Responses
- If the same resource (coupon, gift card) is accepted more than once, a race condition exists
- Look for HTTP 200 responses where 4xx is expected after first use
- Check for duplicate database entries or inconsistent state

## Remediation
- Use database-level locks (SELECT FOR UPDATE, pessimistic locking)
- Implement atomic operations (compare-and-swap, version stamps)
- Use unique constraints at the database level
- Apply idempotency keys to prevent duplicate processing
