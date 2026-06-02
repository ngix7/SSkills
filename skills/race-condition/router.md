# Race Conditions Router

## Signal Classes
- `race-detected` — Evidence of a race window or timing sensitivity
- `race-confirmed` — Exploitable race condition verified
- `race-limits-bypassed` — Rate-limit or one-time constraint bypassed

## Triage Rules

1. Identify stateful endpoints (gift card redemption, coupon application, transfers, votes)
2. Check for shared mutable state without atomic operations
3. Test with concurrent requests using Turbo Intruder or custom scripts
4. Verify with a minimum of 5-20 concurrent requests per race window
5. Distinguish between server-side race and client-side timing issues

## Technique Selection

| Signal | Technique |
|--------|-----------|
| General race window detected | detection |
| Turbo Intruder required for single-packet attack | turbo-intruder |
| Rate-limit or one-time use bypass | limit-overrun |
| File operation or state transition race | time-based-races |
| Authentication or session race | race-in-auth |

## Rejection Rules

- Requests processed sequentially despite concurrent send → Reject
- No shared state between concurrent requests → Reject
- Timing difference > 100ms suggests serial processing → Reject or low confidence
- Database-level locking prevents race → Reject
