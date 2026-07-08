# Save payments setup to project memory

You're about to disconnect Stripe and reconnect a different account. When you do that, all products/prices in Stripe are gone and I'll be asked to set them up again. To avoid re-asking every question, I'll persist your decisions to project memory now so I can reapply them verbatim on reconnect.

## What I'll remember

**Active products (recreate in the new Stripe account):**
- Compass Membership — $20/mo recurring — `price_id: compass_monthly` — tax_code `txcd_10103001`
- Expert Resume Review — $25 one-time — `price_id: resume_review_onetime` — tax_code `txcd_10000000`

**Hidden / waitlist only (do NOT create in Stripe, keep checkout hidden):**
- Envoy ($150/mo)
- Employer credits (Starter $30/mo, Professional $100/mo, à la carte $18/credit)

**Post-purchase business logic:**
- Compass purchase → `subscriptions` row + `sync_user_service_tier` sets `profiles.service_tier='compass'` + HubSpot contact upsert (`dd_product=compass`, `dd_lifecycle=subscription_active`)
- Resume Review purchase → `resume_reviews.status='paid'` + email ping to `max@discoverdiplomacy.org` (template `resume-review-request`) + HubSpot upsert. Reviews are performed manually by Max — no automated review.
- Cancellation → keep access until `current_period_end` (already handled in `sync_user_service_tier`)
- Upgrades/downgrades → not implemented yet

**CRM:** HubSpot connector (`HUBSPOT_API_KEY`). Helper at `src/lib/crm/hubspot.server.ts` (`syncHubspotContact`). Fire-and-forget from webhook; never blocks checkout.

**Notify email:** `max@discoverdiplomacy.org` for new resume reviews.

## What you'll do

1. Disconnect the current Stripe account from the Payments dashboard (three-dots menu → Disconnect Stripe).
2. Reconnect the correct Stripe account.
3. Tell me you're done — I'll recreate the two products above and confirm the webhook + HubSpot wiring still works. No re-asking about prices, hidden tiers, cancellation, or the reviewer email.

## Technical details

- Memory files updated: `mem://index.md` (Core rules) and `mem://features/active-pricing.md` (full decision record).
- Code already in place and unchanged by the reconnect: checkout server functions, webhook handler, HubSpot sync helper, `resume-review-request` email template.
- Only Stripe-side objects (products, prices, webhook secret) need to be recreated after reconnect; the `enable_stripe_payments` flow handles the webhook automatically.

<presentation-actions>
<presentation-open-payments>Open payments dashboard</presentation-open-payments>
</presentation-actions>
