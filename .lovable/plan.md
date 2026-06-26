## Decisions locked in
- **Compass stays $20/mo.** I'll use $20 everywhere the prompt says $35 — the rest of the messaging stays as you wrote it.
- **Ship in one pass.** All 10 deliverables this turn.
- **Rename routes with redirects:** `/services` → `/pricing`, `/coaches` → `/for-coaches`, `/employers` → `/for-employers`. Old URLs redirect via thin route files so existing links/SEO don't break.
- **Create employer Stripe tiers:** Starter $30/mo, Professional $100/mo, à la carte unlock $18 one-time. Free tier = no Stripe product.

## What I'll build

### 1. Navigation (`src/components/site-layout.tsx`)
Header: Logo · **For Candidates ▾** (Compass, Envoy, Coach Directory, Resume Drop, Free Assessment, Sign In) · **For Universities ▾** (Program, Demo) · **For Employers ▾** (Browse, Pricing, Demo) · **For Coaches ▾** (Apply, Directory) · About · Contact.
Mobile: accordion sections mirroring the dropdowns.
Footer: 5 columns (Candidates / Universities / Employers / Coaches / Company) + social row.

### 2. Homepage (`src/routes/index.tsx`)
- New hero: "Discover the opportunities. Prepare the materials. Get hired. Fast." + subhead + 3 CTAs (Start with Compass · See Envoy + Coaching · For universities).
- **Three paths** section: Compass / Envoy / Universities cards (prompt copy, $20 not $35).
- **Built for international careers** section: Clarity / Preparation / Access cards.
- **Social proof** with the new numbers (X placements left as `—` for you to fill, won't fabricate).
- Pre-footer university callout.

### 3. Pricing page (`src/routes/pricing.tsx` — new, replaces /services)
Three-tab layout (Individuals / Universities / Employers):
- **Individuals:** keep existing Compass vs Envoy comparison, annual toggle, FAQ.
- **Universities:** pull in the universities-page pricing block.
- **Employers:** Free / Starter $30 / Pro $100 / $18 à la carte, with placement fee note.
Old `/services` becomes a 1-line redirect → `/pricing`.

### 4. `/for-coaches` (new, replaces /coaches/index)
Existing content + clearer "Coaches earn a share of bookings. Apply to join." + visible link into the coach directory. `/coaches` → redirect.

### 5. `/for-employers` (new, replaces /employers)
Existing content + Resume Drop section + tier clarification (Free=browse public, Starter/Pro=unlock Member Pool) + placement-fee block. `/employers` → redirect.

### 6. `/about`
Add audiences paragraph + "talent infrastructure layer" line. Light touch — preserve existing story.

### 7. Stripe employer tiers
Create products: `employer_starter` ($30/mo), `employer_professional` ($100/mo), `employer_unlock_credit` ($18 one-time, quantity 1–100). Wire into the Employers tab.

### 8. Email templates (`src/lib/email-templates/`)
Four React Email templates + registry entries:
- `compass-welcome` — post-signup
- `compass-upsell-30day` — low engagement nudge to Envoy
- `university-cohort-monthly` — director report
- `employer-first-unlock` — post-unlock guidance
No sender wiring this turn (those triggers depend on data we haven't built); templates ship registered and previewable.

### 9. Messaging guide (`MESSAGING.md`)
Internal doc: old → new phrasing table, tier vocabulary, audience tone rules.

### 10. Global terminology pass
Targeted ripgrep + replace across routes/components for:
- "membership" (in candidate context) → "Compass" or "Compass or Envoy"
- "platform" / "advisory practice" → "international career platform"
- "$35" (residual) → "$20"
- "Start a Membership" → "Start with Compass"
Skip auto-generated files, types, migrations, and email-infra code.

## What I'm NOT doing
- Not changing `/membership` checkout flow — it already points to Compass/Envoy.
- Not wiring email triggers (templates registered, send call sites later when each event source exists).
- Not fabricating a placement count for social proof — leaving an editable placeholder.
- Not touching authenticated dashboards' copy beyond what's already correct.

## Verification
- `tsgo` typecheck after writes.
- Spot-check homepage, /pricing tabs, /for-coaches, /for-employers, /universities in preview.
- Confirm old URLs redirect.

Estimated: ~25–30 file writes. One pass, no follow-up questions.