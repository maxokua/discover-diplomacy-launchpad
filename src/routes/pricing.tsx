import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  Star,
  Compass as CompassIcon,
  Sparkles,
  GraduationCap,
  Building2,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { WaitlistButton, useWaitlist, type WaitlistInterest } from "@/components/waitlist-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRICING } from "@/lib/brand";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Simple pricing for different paths. Compass ($20/mo) or Envoy ($150/mo) for individuals. $20/student/mo for universities. Free + paid tiers for employers.",
      },
      { property: "og:title", content: "Pricing | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Choose the tier that fits your situation. Individuals, universities, and employers.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/pricing" }],
  }),
  component: PricingPage,
});

type Tab = "individuals" | "universities" | "employers";

function PricingPage() {
  const [tab, setTab] = useState<Tab>("individuals");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("tab");
    if (p === "individuals" || p === "universities" || p === "employers") setTab(p);
  }, []);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <div className="eyebrow">Pricing</div>
            <h1 className="mt-4 max-w-3xl font-display text-4xl text-navy-deep lg:text-6xl">
              Simple pricing for different paths.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Choose the tier that fits your situation. Switch anytime.
            </p>
          </Reveal>

          <div className="mt-10 inline-flex flex-wrap items-center gap-1 border border-border bg-paper p-1">
            <TabButton active={tab === "individuals"} onClick={() => setTab("individuals")}>
              For Individuals
            </TabButton>
            <TabButton active={tab === "universities"} onClick={() => setTab("universities")}>
              For Universities
            </TabButton>
            <TabButton active={tab === "employers"} onClick={() => setTab("employers")}>
              For Employers
            </TabButton>
          </div>
        </div>
      </section>

      {tab === "individuals" && <IndividualsTab />}
      {tab === "universities" && <UniversitiesTab />}
      {tab === "employers" && <EmployersTab />}
    </SiteLayout>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-5 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors " +
        (active ? "bg-navy-deep text-paper" : "text-navy-deep hover:bg-stone")
      }
    >
      {children}
    </button>
  );
}

// ─── Individuals ────────────────────────────────────────────────────────────

const COMPASS_FEATURES = [
  "Weekly opportunity digest curated for your goals",
  "Full job board with smart alerts",
  "Instant AI resume score & feedback (unlimited)",
  "Resume Drop eligibility — get discovered by vetted employers",
  "Members-only community with priority Q&A",
];

const ENVOY_FEATURES = [
  "Everything in Compass, plus:",
  "2 one-on-one sessions/month with vetted coaches (use for coaching, mock interviews, or reviews; extra sessions at member rate)",
  "Priority Resume Drop placement & employer matching",
  "Monthly live group workshops",
  "Exclusive hiring intel briefings",
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "I'm not sure which tier is right for me.",
    a: "Compass if you're self-directed and want the tools, intel, and members-only community to run your own search. Envoy if you want vetted coaches walking you through strategy, applications, and interviews. Most members start with Compass and upgrade to Envoy once they want hands-on guidance — you can switch anytime.",
  },
  {
    q: "Can I switch between tiers?",
    a: "Yes. Upgrade or downgrade anytime from your dashboard. If you upgrade mid-cycle, we prorate the difference.",
  },
  {
    q: "Can I try coaching without Envoy?",
    a: "Yes — single sessions are available through the coach directory at standard rates. Envoy just makes it recurring and priced for people who want ongoing support.",
  },
  {
    q: "Can I get a discount if I prepay annually?",
    a: "Yes. Annual billing saves you ~20% on either tier — flip the toggle to see annual pricing.",
  },
  {
    q: "Do you offer need-based pricing?",
    a: "If $20 or $150 a month is out of reach right now, email hello@discoverdiplomacy.org and we'll work something out.",
  },
];

function IndividualsTab() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const isAnnual = billing === "annual";

  const compassPrice = isAnnual ? PRICING.compass.annualLabel : PRICING.compass.priceLabel;
  const compassCadence = isAnnual ? PRICING.compass.annualCadence : PRICING.compass.cadence;
  const envoyPrice = isAnnual ? PRICING.envoy.annualLabel : PRICING.envoy.priceLabel;
  const envoyCadence = isAnnual ? PRICING.envoy.annualCadence : PRICING.envoy.cadence;

  return (
    <>
      <section id="plans" className="border-b border-border bg-stone">
        <div className="mx-auto max-w-6xl px-6 pt-12 lg:px-10">
          <div className="inline-flex items-center gap-1 border border-border bg-paper p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                !isAnnual ? "bg-navy-deep text-paper" : "text-navy-deep hover:bg-stone"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                isAnnual ? "bg-navy-deep text-paper" : "text-navy-deep hover:bg-stone"
              }`}
            >
              Annual
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] ${
                  isAnnual ? "bg-emerald text-navy-deep" : "bg-emerald/15 text-emerald"
                }`}
              >
                −20%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2 lg:px-10 lg:py-16">
          {/* Compass */}
          <Reveal>
            <div className="relative flex h-full flex-col border-2 border-navy-deep bg-paper p-8 lg:p-10">
              <div className="absolute -top-3 left-8 inline-flex items-center gap-2 rounded-full bg-navy-deep px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-paper">
                <Star className="h-3 w-3" /> Most popular
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-navy-deep/15 bg-navy-deep/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
                <CompassIcon className="h-3 w-3" /> Self-directed
              </div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Compass</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl text-navy-deep">{compassPrice}</span>
                <span className="text-sm text-muted-foreground">{compassCadence}</span>
              </div>
              <p className="mt-1 text-xs text-emerald min-h-[1rem]">
                {isAnnual
                  ? `${PRICING.compass.annualEquivalent} · ${PRICING.compass.annualSavings}/yr`
                  : ""}
              </p>
              <p className="mt-4 font-display text-base text-navy-deep">
                Everything you need. On your terms.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tools, intel, and the members-only community. Run your own search with the
                right infrastructure behind you.
              </p>
              <ul className="mt-6 space-y-3">
                {COMPASS_FEATURES.map((i) => (
                  <li key={i} className="flex gap-3 text-sm text-navy-deep/85">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy-deep" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2">
                <Link
                  to="/membership/checkout"
                  search={{ tier: "compass", cadence: isAnnual ? "annual" : "monthly" }}
                  className="inline-flex w-full items-center justify-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Start with Compass
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  Cancel anytime. Monthly or annual (save 20%).
                </p>
              </div>
            </div>
          </Reveal>

          {/* Envoy */}
          <Reveal delay={120}>
            <div className="relative flex h-full flex-col border border-border bg-paper p-8 lg:p-10">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
                <Sparkles className="h-3 w-3" /> Hands-on
              </div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Envoy</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl text-navy-deep">{envoyPrice}</span>
                <span className="text-sm text-muted-foreground">{envoyCadence}</span>
              </div>
              <p className="mt-1 text-xs text-emerald min-h-[1rem]">
                {isAnnual
                  ? `${PRICING.envoy.annualEquivalent} · ${PRICING.envoy.annualSavings}/yr`
                  : ""}
              </p>
              <p className="mt-4 font-display text-base text-navy-deep">
                Everything in Compass, plus:
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Recurring 1:1 time with vetted coaches, priority placement, and the intel briefings
                serious job seekers ask for.
              </p>
              <ul className="mt-6 space-y-3">
                {ENVOY_FEATURES.slice(1).map((i) => (
                  <li key={i} className="flex gap-3 text-sm text-navy-deep/85">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2">
                <Link
                  to="/membership/checkout"
                  search={{ tier: "envoy", cadence: isAnnual ? "annual" : "monthly" }}
                  className="inline-flex w-full items-center justify-center bg-emerald px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-emerald/90"
                >
                  Start Envoy
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  Cancel anytime. Monthly or annual (save 20%).
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
          <Reveal>
            <div className="eyebrow">Still choosing?</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Common questions.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Accordion type="single" collapsible className="mt-10 border-t border-border">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`q-${i}`} className="border-b border-border">
                  <AccordionTrigger className="py-5 text-left font-display text-base text-navy-deep hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ─── Universities ───────────────────────────────────────────────────────────

function UniversitiesTab() {
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
        <Reveal>
          <div className="text-center">
            <GraduationCap className="mx-auto h-7 w-7 text-emerald" />
            <h2 className="mt-3 font-display text-3xl text-navy-deep lg:text-4xl">
              Bulk Compass memberships for IR programs.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Give every international studies major a dedicated career platform — career coaching,
              job board, members-only community, and quarterly placement reporting.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 border-2 border-emerald bg-paper p-8 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                  Per student, per month
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-6xl text-navy-deep">$20</span>
                  <span className="text-base text-muted-foreground">/student/mo</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Minimum 50 students per cohort. Annual commitment, semester options available.
                </p>
                <div className="mt-8 border-t border-border pt-6 text-sm text-navy-deep/85">
                  <div className="font-display text-base text-navy-deep">Volume snapshot</div>
                  <ul className="mt-3 space-y-2">
                    <li>50 students — $1,000/mo · $12K/year</li>
                    <li>100 students — $2,000/mo · $24K/year</li>
                    <li>200 students — $4,000/mo · $48K/year</li>
                  </ul>
                </div>
              </div>
              <div>
                <div className="font-display text-base text-navy-deep">What's included</div>
                <ul className="mt-5 space-y-3 text-sm text-navy-deep/85">
                  {[
                    "Compass membership for every student",
                    "Coach directory access — students book 1:1 sessions",
                    "Weekly opportunity digest for early-career international roles",
                    "Custom onboarding for your cohort",
                    "Quarterly outcomes reporting",
                    "Program admin portal — track cohort engagement in real time",
                  ].map((i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    to="/universities"
                    className="inline-flex items-center justify-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                  >
                    Request a demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Employers ──────────────────────────────────────────────────────────────

function EmployersTab() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      body: "Browse public candidate profiles. Apply for verification.",
      features: [
        "Browse public candidate directory",
        "Verified-employer badge after vetting",
        "Email alerts for new public profiles",
      ],
      cta: { label: "Apply for access", to: "/employers/apply" },
      tone: "default" as const,
    },
    {
      name: "Starter",
      price: "$30",
      cadence: "/ month",
      body: "Browse the member pool, unlock 3 candidates per month.",
      features: [
        "Everything in Free",
        "Unlock 3 vetted candidates per month",
        "Member Pool browsing (Resume Drop)",
        "Direct contact through Discover Diplomacy",
      ],
      cta: { label: "Get Starter", to: "/employers/apply" },
      tone: "default" as const,
    },
    {
      name: "Professional",
      price: "$100",
      cadence: "/ month",
      body: "Unlock 12 candidates per month, advanced filters, priority support.",
      features: [
        "Everything in Starter",
        "Unlock 12 vetted candidates per month",
        "Advanced filters (sector, region, language, GY)",
        "Saved searches and alerts",
        "Priority support",
      ],
      cta: { label: "Get Professional", to: "/employers/apply" },
      tone: "feature" as const,
    },
    {
      name: "À la carte",
      price: "$18",
      cadence: "per unlock",
      body: "Pay per candidate. No subscription required for verified employers.",
      features: [
        "Pay only for the candidates you want",
        "Available to verified employers",
        "Credits never expire",
        "Stackable with Starter or Professional",
      ],
      cta: { label: "Buy credits", to: "/employers/apply" },
      tone: "default" as const,
    },
  ];

  return (
    <>
      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <div className="text-center">
              <Building2 className="mx-auto h-7 w-7 text-navy-deep" />
              <h2 className="mt-3 font-display text-3xl text-navy-deep lg:text-4xl">
                Unlock vetted international talent.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Free tier lets you browse public candidates. Starter and Professional unlock the
                Member Pool with monthly candidate credits.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div
                  className={
                    "flex h-full flex-col border bg-paper p-6 " +
                    (t.tone === "feature" ? "border-2 border-emerald" : "border-border")
                  }
                >
                  <h3 className="font-display text-2xl text-navy-deep">{t.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-3xl text-navy-deep">{t.price}</span>
                    <span className="text-xs text-muted-foreground">{t.cadence}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
                  <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                    {t.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-navy-deep/85">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={t.cta.to}
                    className={
                      "mt-6 inline-flex items-center justify-center px-4 py-2.5 text-xs font-medium uppercase tracking-wider " +
                      (t.tone === "feature"
                        ? "bg-emerald text-navy-deep hover:bg-emerald/90"
                        : "bg-navy-deep text-paper hover:bg-navy")
                    }
                  >
                    {t.cta.label}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
