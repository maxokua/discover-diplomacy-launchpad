# Add `IHEARTMAX` — 100% off, single-use

## What you'll get
A one-time-use promo code `IHEARTMAX` redeemable by exactly **one customer** on either Compass or Resume Review checkout. Once someone uses it, no one else can.

## Steps

1. **Create the coupon + promotion code in Stripe** (one-time setup via a small script through the Lovable Stripe gateway):
   - Coupon: `percent_off: 100`, `duration: forever` (so if that user redeems Compass, all future monthly renewals are also $0).
   - Promotion code: `code: "IHEARTMAX"`, `max_redemptions: 1`.

2. **Enable promo entry on checkout** in `src/lib/payments.functions.ts`:
   - Add `allow_promotion_codes: true` to `createSubscriptionCheckout` (Compass) and `createResumeReviewCheckout`.
   - This adds an "Add promotion code" link inside the embedded Stripe form.

3. **Verify in preview** with Playwright: open `/membership/checkout?tier=compass`, enter `IHEARTMAX`, confirm total → $0.00.

## Notes
- `max_redemptions: 1` is per promotion code, not per customer — the first person to redeem it wins.
- Applies to whichever product that one user checks out first (Compass or Resume Review).
- `managed_payments: { enabled: true }` is compatible with `allow_promotion_codes` — no conflict.
- Case-insensitive on redemption by default.
