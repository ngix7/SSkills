# Business Logic Vulnerabilities Router

## Signal Classes
- `logic-workflow-bypass` — Multi-step process order can be manipulated
- `logic-auth-skip` — Authentication or 2FA step can be bypassed
- `logic-price-tamper` — Price, quantity, or currency values can be manipulated
- `logic-rate-bypass` — Rate limiting can be circumvented

## Triage Rules

### Workflow Analysis
1. Map the intended workflow (steps A → B → C)
2. Try accessing step C directly without completing A or B
3. Try replaying step B after completing the workflow
4. Try parallel requests to out-of-order steps

### Authentication/2FA
1. Identify where in the flow 2FA is enforced
2. Try direct URL access to post-2FA pages
3. Try manipulating boolean parameters (is_verified, requires_2fa)
4. Check if 2FA status is session-wide or per-action

### Rejection Rules
- Expected behaviour (e.g. price stored server-side) — not a bug
- Parameter has no effect on processing — not exploitable
- Rate limit enforced server-side with no bypass — not vulnerable

## Technique Selection

| Scenario | Technique |
|----------|-----------|
| Multi-step checkout/onboarding | workflow-bypass |
| 2FA enabled on login | 2fa-skip |
| Price/cart manipulation | price-manipulation |
| Rate-limited endpoint | rate-limit-logic |

