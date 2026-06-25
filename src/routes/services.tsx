import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Plans & Services | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Two plans — Compass at $35/mo and Envoy at $150/mo — plus a one-time Expert Resume Review at $25. Month-to-month, cancel anytime.",
      },
      { property: "og:title", content: "Plans & Services | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Compass $35/mo for self-directed job hunters. Envoy $150/mo for hands-on coaching. Expert Resume Review $25 one-time.",
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
              name: "Compass Plan",
              description:
                "Self-directed plan with weekly opportunities, resource library, and monthly resume review.",
              offers: {
                "@type": "Offer",
                price: "35",
                priceCurrency: "USD",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: "35",
                  priceCurrency: "USD",
                  unitText: "MONTH",
                },
              },
            },
            {
              "@type": "Service",
              position: 2,
              name: "Envoy Plan",
              description:
                "Hands-on plan with 5 tailored resumes per month, LinkedIn rewrite, company research, coach access, monthly 1:1 call, and interview prep.",
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

const COMPASS = [
  "Access to Diplomat-level coaches",
  "Weekly newsletter of 50 global opportunities from every region",
  "Resource library: field-specific resume/CV templates (US federal, UN/multilateral, global private sector)",
  "Cover-letter examples and networking outreach scripts",
  "One async resume review per month, returned in 3–5 days",
  "Document upload and personal profile",
];

const ENVOY = [
  "Everything in Compass",
  "Access to all coach levels — Diplomat, Ambassador, and Presidential",
  "Resume tailored to up to 5 target roles per month",
  "Full LinkedIn profile rewrite plus ongoing optimization",
  "Company and role research on your target employers",
  "Help drafting and tailoring each application",
  "Direct async access to a coach, replies within ~48 hours",
  "One 30–45 minute 1:1 video call per month (via Calendly)",
  "Interview prep tailored to your target roles",
];

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">Plans & Services</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Two plans, one standalone service. Pick what fits where you are.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Month-to-month, no annual contracts. Cancel the day it stops being useful.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Plans grid */}
      <section id="plans" className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          {/* Compass */}
          <Reveal>
            <div className="flex h-full flex-col border border-border bg-paper p-8 lg:p-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Plan 01
              </div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Compass</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl text-navy-deep">$35</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                For students and early-career people getting oriented and job-hunting on their
                own.
              </p>
              <ul className="mt-6 space-y-3">
                {COMPASS.map((i) => (
                  <li key={i} className="flex gap-3 text-sm text-navy-deep/85">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/membership/checkout"
                  search={{ tier: "compass" }}
                  className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Start Compass · $35/mo
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">Cancel anytime.</p>
              </div>
            </div>
          </Reveal>

          {/* Envoy */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col border-2 border-emerald bg-paper p-8 lg:p-10">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
                <Star className="h-3 w-3" /> Most hands-on
              </div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Envoy</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl text-navy-deep">$150</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                For people actively applying who want hands-on help with every step.
              </p>
              <ul className="mt-6 space-y-3">
                {ENVOY.map((i) => (
                  <li key={i} className="flex gap-3 text-sm text-navy-deep/85">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/membership/checkout"
                  search={{ tier: "envoy" }}
                  className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Start Envoy · $150/mo
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">Cancel anytime.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Standalone resume review */}
      <section id="resume-review" className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              One-time service · $25
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Expert Resume Review
            </h2>
            <p className="mt-5 text-muted-foreground">
              A coach reviews your resume line by line for ATS keywords, structure, and impact,
              tailored to the role you're targeting. You get a marked-up version, a clean revised
              draft, and notes — within 3–5 days.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Standalone purchase. Available to anyone, whether or not you have a plan.
            </p>
            <Link
              to="/resume-review"
              className="mt-8 inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Get started · $25
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
                ["03", "Expert review", "A coach with direct hiring-side experience rewrites your resume line by line."],
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

      <section className="border-t border-border bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-10">
          <Reveal>
            <div className="eyebrow">Need-based pricing</div>
            <h2 className="mt-4 font-display text-2xl text-navy-deep lg:text-3xl">
              Are the prices too high?
            </h2>
            <p className="mt-4 text-muted-foreground">
              We want to help. If $25, $35, or $150 a month is out of reach right now, email us
              and we'll work something out with you. No forms, no proof of income, no
              awkwardness — just tell us where you are.
            </p>
            <a
              href="mailto:hello@discoverdiplomacy.com"
              className="mt-6 inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Email us
            </a>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
