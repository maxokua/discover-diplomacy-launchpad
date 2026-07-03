import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { getPlacementFees, requestEmployerAccess } from "@/lib/resume-drop.functions";

export const Route = createFileRoute("/employers/resume-drop")({
  head: () => ({
    meta: [
      { title: "Member Resume Drop — Vetted International Talent | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Pre-vetted international talent. Unlock profiles with credits, save shortlists, and we'll warm-intro you. Free, Starter ($30/mo), Professional ($100/mo), and à la carte options.",
      },
      { property: "og:title", content: "Member Resume Drop | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "A curated pool of serious early-career professionals in international affairs. Unlock profiles with credits. We make the intro.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/employers/resume-drop" },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/employers/resume-drop" }],
  }),
  component: ResumeDropPage,
});

type Fees = Awaited<ReturnType<typeof getPlacementFees>>["fees"];

function ResumeDropPage() {
  const [fees, setFees] = useState<Fees | null>(null);

  useEffect(() => {
    getPlacementFees().then((r) => setFees(r.fees));
  }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:px-10 lg:py-28">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="eyebrow">Member Resume Drop</div>
              <h1 className="mt-5 font-display text-4xl text-navy-deep lg:text-6xl">
                Pre-vetted international talent. No sourcing. No spam.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Access a curated pool of serious early-career professionals in international
                affairs, diplomacy, global business, and development. Unlock profiles with credits,
                save shortlists, and we'll warm-intro you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#request-access"
                  className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Start free
                </a>
                <a
                  href="#request-access"
                  className="border border-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
                >
                  Request demo
                </a>
                <Link
                  to="/employers/sample-profiles"
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep underline-offset-4 hover:underline"
                >
                  See sample profiles →
                </Link>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <SampleStackPreview />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border bg-stone/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="eyebrow">How it works</div>
          <h2 className="mt-3 font-display text-3xl text-navy-deep lg:text-4xl">
            Three steps to your next hire.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step
              n="01"
              title="Browse vetted talent"
              body="Search and filter the Member Pool by sector, region, language, target role, and experience level. See anonymized stats on each profile. Browse free on the Free tier."
            />
            <Step
              n="02"
              title="Unlock profiles with credits"
              body="Buy credits ($18/profile, or discounted bundles). Unlock a profile to see their full resume, materials, and contact info. We send you an automated introduction to minimize friction."
            />
            <Step
              n="03"
              title="Hire and close"
              body="Pre-vetted, prepared candidates = faster interviews, higher conversion. When you hire, you earn credits back and support the platform."
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Pricing</div>
          <h2 className="mt-3 font-display text-3xl text-navy-deep lg:text-4xl">
            Plans for organizations of any size.
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            <PricingCard
              name="Free"
              price="$0/mo"
              features={[
                "Browse public pool",
                "Anonymized stats only",
                "No profile unlocks",
                "Shortlist public candidates",
              ]}
              ctaLabel="Start free"
              ctaHref="#request-access"
            />
            <PricingCard
              name="Starter"
              price="$30/mo"
              popular
              features={[
                "10 credits / month",
                "Unlock Member Pool profiles",
                "Save private shortlists",
                "Automated warm intros",
              ]}
              ctaLabel="Choose Starter"
              ctaHref="#request-access"
            />
            <PricingCard
              name="Professional"
              price="$100/mo"
              features={[
                "50 credits / month",
                "Unlimited shortlists",
                "Monthly market intel",
                "Lowest placement fee",
              ]}
              ctaLabel="Choose Professional"
              ctaHref="#request-access"
            />
            <PricingCard
              name="À la carte"
              price="$18/credit"
              features={[
                "Pay as you go",
                "20 credits = $300 (save 17%)",
                "No subscription",
                "Credits never expire",
              ]}
              ctaLabel="Buy credits"
              ctaHref="#request-access"
            />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Credits roll over month to month. Unused credits never expire. Upgrade or downgrade
            anytime. Buying in bulk? 20 credits = $300 (save 17%). Contact us for larger volume
            deals or annual discounts.
          </p>
        </div>
      </section>


      {/* WHY MEMBER POOL */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Why the Member Pool works</div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Benefit
              title="Vetted, serious candidates"
              body="Members invest in their preparation and materials. Every candidate in this pool has been guided through the discovery, application, and interview process — they know what they want and how to pursue it."
            />
            <Benefit
              title="Faster than traditional recruiting"
              body="No sourcing, no multi-month searches. Candidates are actively or genuinely open. Warm intros mean no cold outreach. Interviews close in weeks, not quarters."
            />
            <Benefit
              title="Higher-quality pipeline"
              body="Members have curated their materials specifically for international roles. You get pre-screened profiles, not generalists applying everywhere. Better signal, lower noise."
            />
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="border-b border-border bg-stone/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="eyebrow">What's included</div>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              "Browse vetted candidates in the Member Pool (and growing)",
              "Filter by sector, region, language, graduation year, target roles",
              "See each candidate's stated goals, materials, and background",
              "Save candidates to private shortlists (all paid tiers)",
              "Automated warm intros (we connect you, manage the handoff)",
              "Candidate notifications minimize ghosting",
              "Monthly market intel on hiring trends (Professional tier)",
              "Bulk credit discounts for high-volume recruiting",
              "Credits back when you hire (reinvest or bank them)",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 border border-border bg-paper p-4 text-sm text-navy-deep"
              >
                <span className="text-emerald">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TRACTION */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="eyebrow">Trusted by international organizations</div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Stat label="Sectors covered" value="6" />
            <Stat label="Regions" value="5" />
            <Stat label="Languages represented" value="20+" />
            <Stat label="Verification required" value="100%" />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Logos and testimonials added as employers join. All employers are verified before they
            see candidate profiles.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border bg-stone/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Questions</div>
          <div className="mt-6 grid gap-3">
            <Faq
              q="What if a candidate goes silent after an intro?"
              a="Candidates are pre-screened for seriousness, but introductions are warm, not guaranteed. If a candidate doesn't respond, you keep your credit and can reach another profile."
            />
            <Faq
              q="Can we contact candidates directly or go around DD?"
              a="All intros are automated through our platform to protect candidate privacy and ensure accountability. You communicate through DD's system."
            />
            <Faq
              q="What counts as a 'hire'?"
              a="Any offer accepted by a candidate you unlocked through the platform."
            />
            <Faq
              q="Can we buy credits and not use them?"
              a="Yes. Credits roll over month to month and never expire. Buy what you need, use them when you're recruiting."
            />
          </div>
        </div>
      </section>

      {/* CTA + FORM */}
      <section id="request-access" className="bg-navy-deep text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              Ready to hire
            </div>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl">
              Ready to access vetted international talent?
            </h2>
            <p className="mt-4 text-sm text-paper/80">
              Start free, upgrade when you're ready to unlock profiles. All employers are verified
              before access to protect candidate privacy. We accept organizations in government,
              NGOs, foundations, multilaterals, think tanks, and companies.
            </p>
          </div>
          <RequestAccessForm />
        </div>
      </section>
    </SiteLayout>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border border-border bg-paper p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
        {n}
      </div>
      <h3 className="mt-3 font-display text-xl text-navy-deep">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  ctaLabel,
  ctaHref,
  popular,
}: {
  name: string;
  price: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col border p-6 " +
        (popular ? "border-emerald bg-emerald/5" : "border-border bg-paper")
      }
    >
      {popular && (
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald">
          Popular
        </div>
      )}
      <div className="font-display text-xl text-navy-deep">{name}</div>
      <div className="mt-2 font-display text-3xl text-navy-deep">{price}</div>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-navy-deep/90">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-emerald">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className="mt-6 inline-flex justify-center bg-navy-deep px-4 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
      >
        {ctaLabel}
      </a>
    </div>
  );
}

function FeeRow({ plan, credits, fee }: { plan: string; credits: number; fee: number }) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium">{plan}</td>
      <td className="px-4 py-3">{credits}</td>
      <td className="px-4 py-3">${(fee / 100).toLocaleString()}</td>
    </tr>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border bg-stone/40 p-6">
      <h3 className="font-display text-xl text-navy-deep">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-stone/40 p-5">
      <div className="font-display text-3xl text-navy-deep">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-border bg-paper p-5">
      <summary className="cursor-pointer list-none text-sm font-medium text-navy-deep">
        <span className="mr-2 text-emerald group-open:hidden">+</span>
        <span className="mr-2 hidden text-emerald group-open:inline">−</span>
        {q}
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">{a}</p>
    </details>
  );
}

function SampleStackPreview() {
  const samples = [
    {
      initials: "R.K.",
      headline: "MA, International Affairs · 2024",
      roles: ["Foreign Service Officer", "Policy Analyst"],
      langs: "EN · FR · AR",
      loc: "Washington, DC",
    },
    {
      initials: "M.O.",
      headline: "MPP, Global Development · 2023",
      roles: ["International Development", "Multilateral Programs"],
      langs: "EN · ES · PT",
      loc: "New York, NY",
    },
    {
      initials: "L.T.",
      headline: "BA, Asian Studies · 2023",
      roles: ["Asia-Pacific Policy", "Trade Analyst"],
      langs: "EN · ZH · JA",
      loc: "Seattle, WA",
    },
  ];
  return (
    <div className="space-y-3">
      {samples.map((s) => (
        <div key={s.initials} className="border border-border bg-stone/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep text-xs font-semibold text-paper">
              {s.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-navy-deep blur-[3px] select-none">
                Anonymous Candidate
              </div>
              <div className="text-xs text-muted-foreground">{s.headline}</div>
            </div>
            <span className="rounded-full border border-emerald/40 bg-emerald/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald">
              Member · unlockable
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {s.roles.map((r) => (
              <span key={r} className="bg-paper px-2 py-1 text-navy-deep">
                {r}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground">
            <span>{s.langs}</span>
            <span>{s.loc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const formSchema = z.object({
  contact_full_name: z.string().trim().min(2),
  contact_title: z.string().trim().min(1),
  contact_work_email: z.string().trim().email(),
  contact_phone: z.string().trim().max(60).optional().default(""),
  contact_linkedin: z.string().trim().min(10),
  organization_name: z.string().trim().min(2),
  organization_website: z.string().trim().min(4),
  organization_type: z.string().trim().min(1),
  hq_country: z.string().trim().min(1),
  hiring_roles: z.string().trim().min(10),
  hiring_timeline: z.string().trim().optional().default(""),
  why_us: z.string().trim().min(10),
  acknowledged_terms: z.literal(true),
});

function RequestAccessForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = formSchema.safeParse({
      ...raw,
      acknowledged_terms: raw.acknowledged_terms === "on" ? true : false,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fill in all required fields.");
      return;
    }
    setBusy(true);
    try {
      const res = await requestEmployerAccess({ data: parsed.data });
      if ("error" in res && res.error) throw new Error(res.error);
      setSent(true);
      toast.success("Thanks! We'll verify your organization within 24 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-emerald bg-paper p-8 text-navy-deep">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
          Received
        </div>
        <h3 className="mt-3 font-display text-2xl">Thanks. We'll be in touch.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll verify your organization and send you access within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 bg-paper p-6 text-navy-deep">
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="contact_full_name" label="Your name" required />
        <Field name="contact_title" label="Title" required />
        <Field name="contact_work_email" label="Work email" type="email" required />
        <Field name="contact_phone" label="Phone (optional)" />
        <Field
          name="contact_linkedin"
          label="LinkedIn profile URL"
          placeholder="https://linkedin.com/in/…"
          required
        />
        <Field name="organization_name" label="Organization" required />
        <Field name="organization_website" label="Org website" required />
        <Field
          name="organization_type"
          label="Type"
          placeholder="Government / NGO / Multilateral / …"
          required
        />
        <Field name="hq_country" label="HQ country" required />
        <Field
          name="hiring_timeline"
          label="Hiring timeline"
          placeholder="Now / 30 days / Q1 …"
        />
      </div>
      <Textarea
        name="hiring_roles"
        label="What roles are you hiring for?"
        rows={3}
        required
      />
      <Textarea name="why_us" label="Why Discover Diplomacy?" rows={3} required />
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="acknowledged_terms" className="mt-1" required />
        <span>
          I confirm I'm authorized to represent this organization and will use the platform to
          contact candidates only through Discover Diplomacy.
        </span>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Request access"}
      </button>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {label}
      <input
        {...props}
        className="mt-1 w-full border border-border bg-paper px-3 py-2 text-sm text-navy-deep normal-case tracking-normal focus:outline-none focus:ring-2 focus:ring-navy-deep"
      />
    </label>
  );
}

function Textarea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {label}
      <textarea
        {...props}
        className="mt-1 w-full border border-border bg-paper px-3 py-2 text-sm text-navy-deep normal-case tracking-normal focus:outline-none focus:ring-2 focus:ring-navy-deep"
      />
    </label>
  );
}
