# Discover Diplomacy — Brand & Voice Reference

> Living document. Every page, post, email, and screen on this product references it.
> If copy or design contradicts what's here, the page is wrong — not this file.

---

## 1. What we are

Discover Diplomacy is the **talent infrastructure layer for internationally-focused careers**.

A three-sided marketplace for globally-minded students and early-career professionals
pursuing diplomacy, international policy, multilateral institutions, international
development, human rights, and international business:

- **Candidates** discover opportunities, prepare their materials, and book vetted coaches.
- **Coaches** earn by mentoring serious, motivated clients.
- **Employers** access a vetted, ready-to-move talent pool.

We are **tech-enabled**: anything that can be automated (resume reviews, document
tailoring, opportunity curation, application drafting) runs on expert-designed
systems — fast, consistent, affordable. **Humans** (our vetted coaches) are reserved
for judgment, strategy, and real mentorship.

**Owned assets:** a curated opportunity directory (125,000+ views, 25,000+ reached)
and a weekly digest of ~50 global opportunities.

---

## 2. One-liner

> **Discover the opportunities. Prepare the materials. Open the doors. Get hired.**

## 3. Positioning statement

> For globally-minded students and early-career professionals who find international
> careers fragmented and gated by who-you-know, **Discover Diplomacy** is the platform
> that turns ambition into offers — combining a curated opportunity directory, instant
> expert-designed application help, vetted insider coaches, and direct access to
> employers. Unlike generic job boards (no vetting, no guidance) or expensive boutique
> consultants (slow, exclusive), we make insider-grade preparation fast, affordable,
> and available to everyone serious about the field.

## 4. The three messaging pillars

Organize every page, every campaign, every product surface around these.

1. **Clarity** — figure out what you actually want to do in a vast field.
2. **Preparation** — instant, expert-designed help to make your materials competitive
   (resume, narrative, applications), plus vetted coaches when you need a human.
3. **Access** — get surfaced to employers and connected to insiders; the doors that
   are normally network-gated.

## 5. The Trust Wall (sacred principle)

> **Paid time is sold. Earned trust is not.**

- Sold: coaching hours, resume review, expertise, document help.
- Not sold, ever: vouches, referrals, recommendations, intros.

Never write copy that implies a referral or recommendation can be purchased. Never
imply paying us "gets you in" anywhere. We sell preparation and access to a venue;
the candidate earns the rest.

## 6. Differentiators (weave these in)

- Owned, curated opportunity directory (real proof we live in this field).
- Vetting is the moat — for coaches, employers, and the directory itself.
- Speed and affordability via automation built on expert-designed systems.
- A real insider coach network — diplomats, multilateral staff, NGO leaders.
- Built specifically for international careers. Not a generic job board.

---

## 7. Audiences

| Audience | Mindset | Tone toward them |
|---|---|---|
| **Candidates** (primary) | Ambitious, anxious about a confusing field, budget-conscious. | Encouraging + authoritative. |
| **Coaches** | Accomplished insiders who want flexible, mission-driven, well-paid mentoring of serious clients. | Respectful, peer-to-peer, mission-led. |
| **Employers** | Want pre-vetted, ready early-career international talent without the sourcing grind. | Confident, concise, business-first. |

---

## 8. Voice

**Voice = Authoritative, warm, precise, insider-but-accessible.**
A brilliant mentor who's walked the halls of power and explains things plainly.
Confident, never arrogant. Encouraging, never fluffy.

### Principles

- Plain and direct. Short sentences. Cut filler.
- Specific over generic. Name real things (Foreign Service, multilaterals,
  fellowships, NGOs) — not "opportunities."
- Honest about how it works. We're fast because we're tech-enabled by expert-designed
  systems — say so. Do **not** claim a human expert performs automated steps.
  Reserve "expert / coach / human" language for actual human coaching.
- Aspirational but grounded. End with "the offer in hand," not vague inspiration.
- Respect the user's intelligence and their budget. Never condescend.

### Do say

`expert-designed` · `instant` · `vetted` · `insider` · `the offer in hand` ·
`built for this field` · `no network required` · `Foreign Service` · `multilaterals` ·
`fellowships` · `the platform` · `our coach network`

### Don't say

`AI-powered` (as a gimmick) · `revolutionary` · `game-changing` · `unlock your
potential` · `synergy` · `leverage` · `empower` · any fake scarcity · anything
implying a referral or vouch can be purchased · "email the CEO" / "call with the
CEO" (we are a platform and a team).

### Sample rewrites

| Weak | Strong |
|---|---|
| "We empower you to unlock your global career potential." | "We help you figure out what you want in this field — and get the offer." |
| "Our AI reviews your resume." | "Get your resume rebuilt for the role in minutes, using the same playbook insiders use." |
| "Schedule a call with the CEO." | "Book a vetted coach who's worked in the field you're targeting." |

---

## 9. Visual system

**Mood:** institutional, modern, quietly premium. Diplomacy meets clean software.
Refined, not stuffy.

### Color tokens (Tailwind + CSS variables)

| Token | Hex | Role |
|---|---|---|
| `--navy` (Navy) | `#0E1E36` | Primary dark grounds, primary button |
| `--ink` (Ink) | `#15233D` | Headings |
| `--gilt` (Gilt Gold) | `#C8A24A` | Single accent — emphasis & CTA accents, sparingly |
| `--azure` (Azure) | `#2E6FB0` | Secondary, links |
| `--paper` (Paper) | `#FAFBFD` | Light backgrounds |
| `--slate` (Slate) | `#1F2838` | Body text |
| `--muted-ink` (Muted) | `#5C6675` | Secondary text |
| `--hairline` (Hairline) | `#DBE1EA` | Dividers |

**Rule of one:** never more than one strong gold accent per view.

### Typography

- **Display (headlines):** Fraunces (serif). Fallback: Source Serif 4, Georgia.
- **Body / UI:** Inter.
- Headlines in serif; everything else sans.

### Imagery

Use: institutional architecture at dusk, subtle maps/globes, real people in real
settings.
Avoid: cheesy stock handshakes, clip-art globes, flag bursts.

### Components

Generous whitespace. Hairline dividers. Restrained shadows.
Buttons — primary: solid navy. Secondary: ghost / outline.

---

## 10. Pricing (single source of truth)

All pricing displayed on the site MUST match `src/lib/brand.ts` (`PRICING`). Do not
hardcode prices elsewhere. Current plans:

- **Explorer — Free.** Account, Diplomat-coach booking, starter resources.
- **Compass — $20/mo.** Adds Diplomat + Ambassador coach access, the weekly digest,
  the full resource library, and one async resume review per month.
- **Envoy — $150/mo.** Adds all coach tiers (incl. Presidential), 2 complimentary
  Diplomat sessions/month, tailored resumes, LinkedIn rewrite, async coach access.
- **Expert Resume Review — $25, one-time.** Available to anyone.

---

## 11. Required CTAs to surface

These two CTAs should be reachable from every major page (home, services, employers,
coaches, about):

1. **Get the weekly digest** → `/waitlist?interest=digest`
2. **Take the free assessment** → `/assessment`

---

## 12. Traction (use, don't inflate)

- **25,000+ people reached** through the directory and digest.
- **125,000+ views** on the opportunity directory.
- **~50 global opportunities** curated every week.

Never invent testimonials, names, fake numbers, or fake credentials. Where social
proof is needed but unavailable, mark the slot clearly as a placeholder.

---

## 13. Where this lives

- This file: `BRAND.md` (canonical).
- Internal team page: `/brand-guide` (mirrors this content for non-engineers).
- Pricing & traction constants: `src/lib/brand.ts`.
- Color & type tokens: `src/styles.css` (`@theme`).
