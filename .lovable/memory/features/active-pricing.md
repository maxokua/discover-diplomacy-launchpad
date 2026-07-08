---
name: Active pricing & activated products
description: Which products are live in Stripe, their prices, and post-purchase business rules
type: feature
---
ACTIVE (live in Stripe, purchasable):
- Compass Membership — $20/mo (price_id: compass_monthly)
- Expert Resume Review — $25 one-time (price_id: resume_review_onetime)

HIDDEN / waitlist only (do NOT show checkout):
- Envoy ($150/mo)
- Employer credit plans (Starter, Professional, à la carte)

Post-purchase logic:
- Compass purchase → subscriptions row + sync_user_service_tier sets profiles.service_tier='compass' + HubSpot contact upsert (dd_product=compass, dd_lifecycle=subscription_active).
- Resume Review purchase → resume_reviews.status='paid' + email ping to max@discoverdiplomacy.org (template: resume-review-request) + HubSpot upsert (dd_product=resume_review). Reviews are performed manually by Max — no automated review.
- Cancellation: keep access until current_period_end (sync_user_service_tier treats canceled+future period_end as active).
- Upgrades/downgrades: not implemented yet.

CRM: HubSpot connector (HUBSPOT_API_KEY). Helper: src/lib/crm/hubspot.server.ts (syncHubspotContact). Fire-and-forget from webhook; never blocks checkout.
