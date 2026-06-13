import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Two services: a $25 expert resume review and our most popular $50/month Career Membership, month-to-month, with resume tailoring, LinkedIn review, research, outreach, interview prep, and a global opportunities Substack with 50 opportunities weekly.",
      },
      { property: "og:title", content: "Services | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "$25 resume review or $50/month Career Membership, month-to-month, no annual lock-in.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/services" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/services" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: [
            { "@type": "Service", position: 1, name: "Career Membership", description: "Month-to-month membership with resume tailoring, LinkedIn review, research, outreach, interview prep, and a weekly Substack of 50 global opportunities.", offers: { "@type": "Offer", price: "50", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "50", priceCurrency: "USD", unitText: "MONTH" } } },
            { "@type": "Service", position: 2, name: "Expert Resume Review", description: "One-time expert review of your resume for international affairs and global business roles.", offers: { "@type": "Offer", price: "25", priceCurrency: "USD" } },
          ],
        }),
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">Services</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Services built for people who are serious about this field.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              We help globally minded students and early professionals figure out what they
              actually want to do in international affairs, and give them the tools to land it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Service 01, Career Membership (most popular) */}
      <section id="membership" className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
              Service 01 · Most popular · $50/mo
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Career Membership
            </h2>
            <p className="mt-5 text-muted-foreground">
              Our most popular service. Month-to-month, no annual plans, because we're not about
              locking you in, we're about helping you. Cancel the day it stops being useful.
            </p>
            <Link
              to="/membership"
              className="mt-8 inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Join the membership · $50/mo
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              Add a 30-min call with the CEO for $25. Otherwise, members get the CEO's email and
              can ask as many questions as they'd like.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              What's included
            </div>
            <ul className="mt-5 space-y-3">
              {[
                "Upload your documents to your profile so we can see everything",
                "Tell us 5 target jobs, we tailor your resume specifically for each",
                "Full LinkedIn profile review",
                "Industry and company research",
                "Outreach assistance, direct help to build your network",
                "Interview prep tailored to your target roles",
                "Help drafting and tailoring each application",
                "Substack with 50 opportunities weekly from every region of the world",
                "Direct email access to the CEO",
              ].map((i) => (
                <li key={i} className="flex gap-3 text-sm text-navy-deep/85">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Service 02, Resume Review */}
      <section id="resume-review" className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              Service 02 · $25
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Expert Resume Review
            </h2>
            <p className="mt-5 text-muted-foreground">
              A line-by-line review by an expert who knows what hiring managers and applicant
              tracking systems are actually looking for. Tailored to the role you're targeting,
              with the essential keywords your resume needs to get a second look.
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
                ["02", "Pay $25", "Secure checkout. You'll only be charged for the review itself."],
                ["03", "Expert review", "A coach with direct hiring-side experience rewrites your resume line by line for ATS keywords, structure, and impact."],
                ["04", "Returned in 3–5 days", "You get the marked-up version, a clean revised draft, and notes on what to keep doing."],
              ].map(([n, t, d]) => (
                <li key={n} className="grid grid-cols-[auto,1fr] gap-5 border-b border-border pb-5 last:border-0">
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

      <section className="bg-navy-deep text-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                Two ways to get started
              </div>
              <h2 className="mt-4 font-display text-2xl text-paper lg:text-3xl">
                Try the $25 review, or jump straight into the $50/mo membership.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link to="/membership" className="bg-paper px-5 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-paper/90">
                Start membership · $50/mo
              </Link>
              <Link to="/resume-review" className="border border-paper/40 px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-paper/10">
                $25 resume review
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

