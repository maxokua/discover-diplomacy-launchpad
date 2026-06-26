import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star, Compass as CompassIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRICING } from "@/lib/brand";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Choose your path | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Two membership tiers for global-affairs job hunters. Compass at $20/mo gives you the tools, intel, and community. Envoy at $150/mo adds a mentor, unlimited coaching, and priority access.",
      },
      { property: "og:title", content: "Choose your path | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Compass gives you the tools. Envoy gives you the mentor. Two paths to your next international-affairs role.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/services" },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: [
            {
              "@type": "Service",
              position: 1,
              name: "Compass",
              description:
                "Self-directed plan: resume & LinkedIn review, application drafting, weekly opportunities, Resume Drop opt-in, member community, and job board alerts.",
              offers: {
                "@type": "Offer",
                price: "20",
                priceCurrency: "USD",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: "20",
                  priceCurrency: "USD",
                  unitText: "MONTH",
                },
              },
            },
            {
              "@type": "Service",
              position: 2,
              name: "Envoy",
              description:
                "Everything in Compass plus unlimited 1:1 coaching, priority matching, mock interviews, monthly cohorts, and priority Resume Drop visibility.",
              offers: {
                "@type": "Offer",
                price: "150",
                priceCurrency: "USD",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: "150",
                  priceCurrency: "USD",
                  unitText: "MONTH",
                },
              },
            },
            {
              "@type": "Service",
              position: 3,
              name: "Expert Resume Review",
              description:
                "One-time line-by-line resume review tailored to your target role, returned in 3–5 days.",
              offers: { "@type": "Offer", price: "25", priceCurrency: "USD" },
            },
          ],
        }),
      },
    ],
  }),
  component: ServicesPage,
});

const COMPASS_FEATURES = [
  "Resume & LinkedIn review",
  "Application drafting & tailoring",
  "Industry & company research briefs",
  "Weekly opportunity digest (50+ global roles)",
  "Resume Drop opt-in (employers discover you)",
  "Members-only community",
  "Job board with smart alerts by sector, region, role",
  "Coach profile directory (research & sample sessions)",
  "Unlimited questions via email",
];

const ENVOY_FEATURES = [
  "Everything in Compass, plus:",
  "Unlimited 1:1 coaching with vetted coaches",
  "Priority coach matching — we source your mentor",
  "Mock interviews & tailored interview prep",
  "Priority in Resume Drop (boosted to employers)",
  "Monthly group workshops & cohorts with senior coaches",
  "Exclusive hiring intel — see who's actively hiring",
  "Dedicated support — faster, higher-priority replies",
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "I'm not sure which tier is right for me.",
    a: "Compass if you're self-directed and want the tools, intel, and community to run your own search. Envoy if you want a mentor walking you through strategy, applications, and interviews. Most members start with Compass and upgrade to Envoy once they want hands-on guidance — you can switch anytime.",
  },
  {
    q: "Can I switch between tiers?",
    a: "Yes. Upgrade or downgrade anytime from your dashboard. If you upgrade mid-cycle, we prorate the difference.",
  },
  {
    q: "What if I want to try coaching before committing to Envoy?",
    a: "Book a single 30-minute intro session with a coach for $25 — available to Compass members. See if the chemistry's there, then decide whether Envoy makes sense.",
  },
  {
    q: "Can I get a discount if I prepay annually?",
    a: "Yes. Annual billing saves you ~20% on either tier — flip the toggle above to see annual pricing. Month-to-month is also available with no commitment.",
  },
  {
    q: "Do you offer need-based pricing?",
    a: "If $20 or $150 a month is out of reach right now, email hello@discoverdiplomacy.org and we'll work something out. No forms, no proof of income — just tell us where you are.",
  },
];

function ServicesPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const isAnnual = billing === "annual";

  const compassPrice = isAnnual ? PRICING.compass.annualLabel : PRICING.compass.priceLabel;
  const compassCadence = isAnnual ? PRICING.compass.annualCadence : PRICING.compass.cadence;
  const envoyPrice = isAnnual ? PRICING.envoy.annualLabel : PRICING.envoy.priceLabel;
  const envoyCadence = isAnnual ? PRICING.envoy.annualCadence : PRICING.envoy.cadence;

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">Membership</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Choose your path.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              One tier for self-directed job hunters. One for those who want hands-on coaching.
              <span className="block mt-2 font-display italic text-navy-deep">
                Compass gives you the tools. Envoy gives you the mentor.
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#plans"
                className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
              >
                Start with Compass
              </a>
              <a
                href="#envoy"
                className="inline-flex items-center border border-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-navy-deep hover:text-paper"
              >
                See Envoy
              </a>
            </div>

            {/* Billing toggle */}
            <div className="mt-10 inline-flex items-center gap-1 border border-border bg-paper p-1">
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
          </Reveal>
        </div>
      </section>

      {/* PLANS — side-by-side cards */}
      <section id="plans" className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          {/* Compass */}
          <Reveal>
            <div className="flex h-full flex-col border border-border bg-paper p-8 lg:p-10">
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
                Tools, templates, intel, and community. Build your own path to your next role.
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
                  to="/waitlist"
                  search={{ interest: isAnnual ? "compass-annual" : "compass" }}
                  className="inline-flex w-full items-center justify-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Start with Compass
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  Cancel anytime. Month-to-month.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Envoy */}
          <Reveal delay={120}>
            <div
              id="envoy"
              className="relative flex h-full flex-col border-2 border-emerald bg-paper p-8 lg:p-10"
            >
              <div className="absolute -top-3 left-8 inline-flex items-center gap-2 rounded-full bg-emerald px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
                <Star className="h-3 w-3" /> For serious job seekers
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
                <Sparkles className="h-3 w-3" /> Mentor included
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
                Everything in Compass, plus a mentor.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Unlimited coaching, priority matching, strategic guidance. Get hired faster with
                expert help at every step.
              </p>
              <ul className="mt-6 space-y-3">
                {ENVOY_FEATURES.map((i, idx) => (
                  <li
                    key={i}
                    className={`flex gap-3 text-sm ${
                      idx === 0
                        ? "font-medium text-navy-deep"
                        : "text-navy-deep/85"
                    }`}
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        idx === 0 ? "text-emerald" : "text-emerald"
                      }`}
                    />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2">
                <Link
                  to="/waitlist"
                  search={{ interest: isAnnual ? "envoy-annual" : "envoy" }}
                  className="inline-flex w-full items-center justify-center bg-emerald px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-emerald/90"
                >
                  Start Envoy
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  Cancel anytime. See why it's worth it.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16 lg:px-10">
          <Reveal>
            <p className="text-center text-sm text-muted-foreground">
              Curious but not ready?{" "}
              <Link to="/auth" className="font-medium text-navy-deep underline-offset-4 hover:underline">
                Create a free account
              </Link>{" "}
              and browse coach profiles before you commit.
            </p>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS — placeholder */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">What members say</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Two tiers. Two stories.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <Reveal>
              <figure className="flex h-full flex-col border border-border bg-stone p-8">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-deep">
                  Compass member
                </div>
                <blockquote className="mt-4 flex-1 font-display text-xl leading-snug text-navy-deep">
                  "The weekly digest and community kept me on track. I sent better applications,
                  faster — and landed my role in six weeks."
                </blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">
                  Early-career analyst · Washington, DC
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={120}>
              <figure className="flex h-full flex-col border-2 border-emerald bg-stone p-8">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                  Envoy member
                </div>
                <blockquote className="mt-4 flex-1 font-display text-xl leading-snug text-navy-deep">
                  "My coach walked me through every interview, helped me negotiate my offer, and
                  made sure I didn't underprice myself. Worth every penny."
                </blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">
                  Multilateral program officer · Geneva
                </figcaption>
              </figure>
            </Reveal>
          </div>
          <p className="mt-6 text-xs italic text-muted-foreground">
            Representative member experiences. Real names and photos shared with consent as we
            collect them.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
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

      {/* NOT SURE YET — assessment CTA */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
          <Reveal>
            <div className="eyebrow">Not sure yet?</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Take the free career assessment.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Answer a handful of questions about your goals, stage, and blockers. We'll send back
              a personalized 90-day plan and a tier recommendation — Compass or Envoy — with the
              reasoning.
            </p>
            <Link
              to="/assessment"
              className="mt-8 inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Start the free assessment
            </Link>
          </Reveal>
        </div>
      </section>

      {/* RESUME REVIEW — standalone */}
      <section id="resume-review" className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              One-time service · $25
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Expert Resume Review
            </h2>
            <p className="mt-5 text-muted-foreground">
              A coach reviews your resume line by line for ATS keywords, structure, and impact —
              tailored to the role you're targeting. You get a marked-up version, a clean revised
              draft, and notes within 3–5 days.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Standalone purchase. Available to anyone, plan or no plan.
            </p>
            <Link
              to="/waitlist"
              search={{ interest: "resume-review" }}
              className="mt-8 inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Join the waitlist
            </Link>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              How it works
            </div>
            <ol className="mt-5 space-y-5">
              {[
                ["01", "Submit", "Sign in, upload your resume, and tell us the role you're targeting."],
                ["02", "Pay $25", "Secure checkout. One-time charge, no subscription."],
                ["03", "Expert review", "A coach with direct hiring-side experience rewrites it line by line."],
                ["04", "Returned in 3–5 days", "Marked-up version, a clean revised draft, and notes."],
              ].map(([n, t, d]) => (
                <li
                  key={n}
                  className="grid grid-cols-[auto,1fr] gap-5 border-b border-border pb-5 last:border-0"
                >
                  <div className="font-display text-lg italic text-emerald">{n}.</div>
                  <div>
                    <div className="font-display text-base text-navy-deep">{t}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-navy-deep text-paper">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-10 lg:py-28">
          <Reveal>
            <h2 className="font-display text-3xl lg:text-5xl">
              Pick the path that fits where you are.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-paper/70">
              Both paths work. Choose the one that matches how you want to run your search.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/waitlist"
                search={{ interest: "compass" }}
                className="inline-flex items-center bg-paper px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-paper/90"
              >
                Start with Compass · $20/mo
              </Link>
              <Link
                to="/waitlist"
                search={{ interest: "envoy" }}
                className="inline-flex items-center bg-emerald px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-emerald/90"
              >
                Start Envoy · $150/mo
              </Link>
              <Link
                to="/assessment"
                className="inline-flex items-center border border-paper/40 px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-paper/10"
              >
                Take the free assessment
              </Link>
            </div>
            <p className="mt-8 text-xs text-paper/50">
              Need-based pricing available. Email{" "}
              <a href="mailto:hello@discoverdiplomacy.org" className="underline">
                hello@discoverdiplomacy.org
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
