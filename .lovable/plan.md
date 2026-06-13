# Plan

## 1. About page edits (`src/routes/about.tsx`)
- Remove the **Selectivity** principle (drop from the five-commitments grid, leaving four).
- Expand the "Origin" story into a richer narrative: four DC students staring down a closed-off field with no roadmap, hitting dead ends with generic career services, piecing together their own playbook from cold emails, coffee chats, and late-night application sessions — then deciding to build the resource they wished had existed. Add a short pull-quote and a "What we believe" sub-section to give the page weight without inventing credentials.

## 2. Services page rewrite (`src/routes/services.tsx`)
Replace the four fabricated practices with our two real services:

1. **Career Orientation** — 1:1 coaching to figure out what you actually want to do in the field and build a personalized roadmap to get there. Priced as a coaching engagement (starting price TBD — placeholder "Inquire for pricing" with a Book button).
2. **Expert Resume Review — $25** — line-by-line review by an expert, tailored to pass ATS with the essential keywords to get extra attention. Clear "Get started — $25" CTA that launches Stripe Checkout.

Remove the fake program lists, pricing tiers, and "four practices" framing. Simple two-card layout + a "How it works" strip for the resume review (upload resume + role target → expert review → returned within X days).

## 3. New Coaches page (`src/routes/coaches.tsx`)
Public marketing + application page. Sections:
- Hero: "Coach with Discover Diplomacy" — market-leading pay per client coached.
- Why coach with us (3-4 value props: flexible, mission-driven, top-of-market rates, work with motivated globally minded clients).
- Application form: Full name, email, LinkedIn, current role/affiliation, areas of expertise (multi-select: Foreign Service, multilateral, think tanks, Hill, intl development, grad admissions, etc.), years of experience, short essay ("Why do you want to coach?"), **resume upload (PDF/DOC, stored in Lovable Cloud storage)**.
- Submissions stored in a `coach_applications` table; resume file in a private `coach-resumes` storage bucket.
- Add **Coaches** link to the site header/footer nav.

## 4. Insights page (`src/routes/insights.tsx`)
Strip all fake posts. Replace with a clean "Insights — coming soon" placeholder section that keeps the page on-brand (eyebrow, headline, short copy, and the existing newsletter signup form so visitors can opt in to be notified). Keep the route + head metadata.

## 5. Client authentication + dashboard
Enable **Lovable Cloud** and wire up:
- `/auth` page — email/password + Google sign-in (tabs for Sign in / Sign up).
- `profiles` table (id → auth.users, full_name, email) with auto-create trigger on signup.
- `/_authenticated/dashboard` route — simple dashboard showing:
  - Welcome + profile info
  - "My Orders" list (resume reviews + their status: pending payment / in review / completed)
  - Button to start a new resume review
- "Sign in" / "Dashboard" link in the site header (swaps based on auth state); "Sign out" button.

## 6. Stripe + $25 resume review checkout
- Run `recommend_payment_provider` → enable Stripe via `enable_stripe_payments` (digital service, fits Stripe).
- Create one product: "Expert Resume Review" — $25.
- Tables:
  - `resume_reviews` (id, user_id, status enum: `pending_payment | paid | in_review | completed`, target_role, notes, resume_path, reviewed_resume_path, stripe_session_id, created_at).
- Flow:
  1. Logged-in client clicks **Start Resume Review** → form (upload resume to private `resumes` bucket, enter target role + notes) → row inserted with `pending_payment`.
  2. Server function creates a Stripe Checkout Session → redirect to Stripe.
  3. Stripe webhook (public route under `/api/public/stripe-webhook`) verifies signature → marks order `paid`.
  4. Order appears in dashboard with status; admins (later) deliver `reviewed_resume_path`.
- Unauthenticated visitors who click "Start Resume Review" are routed to `/auth` first.

## 7. Nav + footer updates (`src/components/site-layout.tsx`)
- Add `Coaches` to primary nav.
- Add `Sign in` (or `Dashboard` + `Sign out`) to top utility bar based on auth state.
- Update footer "Engage" column to include "Become a coach".

## Technical notes
- Backend: enable Lovable Cloud (Supabase under the hood), use `createServerFn` with `requireSupabaseAuth` for all client-facing server logic; Stripe webhook lives at `src/routes/api/public/stripe-webhook.ts` with HMAC signature verification.
- Storage: two private buckets — `resumes` (client uploads) and `coach-resumes` (applicant uploads). RLS scoped to `auth.uid()` for `resumes`; `coach-resumes` writes allowed for anon (open application form) with read restricted to service role.
- RLS: `profiles` and `resume_reviews` scoped to `auth.uid()`; `coach_applications` allows insert from anon, select restricted to admin role (set up `user_roles` + `has_role` per the standard pattern).
- Auth UX: `/auth` is a public route; `/dashboard` lives under `_authenticated/`.
- Insights stays a real route but content-free for now.
