
## What you'll get

### Candidate side (members)
- **First-login modal** (`ResumeDropIntroModal`): full-screen overlay shown once after a member signs up, with the "Get discovered" copy and two CTAs. Dismissal is tracked so it doesn't re-show.
- **Org selection component** (`OrgSelector`): "All orgs" vs "Cherry-pick" radio; cherry-pick reveals a searchable, category-filtered, paginated list of verified orgs from the `organizations` table. (Table seeded empty; admins add orgs.) Saves to `member_resume_drop`.
- **Dashboard card** on `/dashboard` showing: discoverable status, # orgs that can see them, unlocks this month, intros received, "Edit who can see me", "Opt out" buttons, and an expandable "How does this work if I get hired?" explainer.
- **Opt-out confirmation modal**.
- **In-app notification** ("[Company] unlocked your profile") via a `notifications` table + a small bell/list on the dashboard.

### Employer side
- **`/employers/resume-drop`** product page with hero, How It Works, pricing table (Free / Starter $30 / Pro $100 / À la carte), placement-fee table, benefits, feature grid, traction, FAQ accordion, final CTA, sample profile cards.
- **`/employers/sample-profiles`** page rendering three anonymized but realistic candidate cards (blurred photo, redacted name, role tags, languages, location, "Member (unlockable)" badge).
- **Request-access form** that writes to existing `employer_applications` (extended with a `source` field) and triggers an internal email notification.
- Link from `/employers` → `/employers/resume-drop`.

### Admin
- **`/admin/organizations`** simple CRUD page to add/edit/verify orgs (name, category, logo URL, verification_status). Admin-only via existing `has_role` RBAC.

### Data model (new tables, all with RLS + GRANTs)
- `organizations` — id, name, slug, category (enum: government / ngo / think_tank / multilateral / company / foundation), logo_url, verification_status, timestamps. Public SELECT for verified rows; admin-only writes.
- `member_resume_drop` — user_id PK, status (`opted_in` / `opted_out`), visibility (`all` / `selected`), seen_intro_at, timestamps. Member-scoped RLS.
- `member_resume_drop_orgs` — (user_id, org_id) join table for cherry-pick. Member-scoped RLS.
- `resume_unlocks` — id, member_id, employer_user_id, org_id, credits_used, unlocked_at. Member can read own; employer can read own; admin all.
- `employer_intros` — id, unlock_id, member_id, employer_user_id, message, status, created_at. Same scoping.
- `notifications` — id, user_id, kind, title, body, link, read_at, created_at. Owner-scoped.
- `placement_fee_config` — single-row config table: alacarte/starter/pro fees + credits-back. Public SELECT, admin write. (Lets you change fees without code.)

Stats on the dashboard card pull from `resume_unlocks` and `employer_intros` filtered to the current user.

### Server functions (`createServerFn`, all auth-gated via `requireSupabaseAuth`)
- `getResumeDropStatus` — returns opt-in state, visibility, selected org ids, stats.
- `optInToResumeDrop({ visibility, orgIds })`, `optOutOfResumeDrop()`, `updateResumeDropOrgs({ visibility, orgIds })`.
- `listOrganizations({ search, category, cursor })` — paginated.
- `listMyNotifications`, `markNotificationRead`.
- Admin: `adminUpsertOrganization`, `adminDeleteOrganization`, `adminUpdatePlacementFees` — gated with `has_role(_,'admin')`.
- Public: `requestEmployerAccess({ ... })` writes to `employer_applications` (source=`resume_drop`).

### Voice & visuals
Copy follows BRAND.md (no "AI/sell your profile/algorithm"; uses "discoverable", "unlock", "verified organizations", "placement fee"). Uses existing Navy + Gilt tokens, Fraunces for headings, Inter for body. No purple/indigo gradients.

## Out of scope (this build)
- Actual Stripe credit-purchase / subscription billing for employers, automated email delivery of intros, and the placement-fee invoicing flow — the UI, tables, and configuration are in place; payment wiring follows the same pattern we already use for Compass/Envoy and can be added after the schema is approved.
- A live "2,500+ members" counter — shown as a real count from the DB, will read 0 until members opt in.

## Technical notes

- Files added under `src/routes/_authenticated/` for member/admin pages; `src/routes/employers.resume-drop.tsx` + `src/routes/employers.sample-profiles.tsx` for public pages.
- Components under `src/components/resume-drop/`.
- Server fns under `src/lib/resume-drop.functions.ts` and `src/lib/organizations.functions.ts`.
- All new public-schema tables follow the required `CREATE → GRANT → RLS → POLICY` order.
- Sample profile photos use CSS blur on a placeholder gradient (no fake faces, no stock photos misrepresenting real people).
- The intro modal "seen" state is stored on `member_resume_drop` (`seen_intro_at`), not localStorage, so it persists across devices.
