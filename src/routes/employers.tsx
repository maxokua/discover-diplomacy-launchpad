import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck, Inbox } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/employers")({
  head: () => ({
    meta: [
      { title: "For Employers — Unlock Vetted International Talent | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Hiring in international affairs, policy, or global business? Browse pre-screened candidates. Free to browse public profiles. Starter and Professional unlock the Member Pool.",
      },
      { property: "og:title", content: "For Employers | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Browse pre-screened candidates pursuing roles in diplomacy, policy, multilaterals, and international business.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/employers" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/employers" },
    ],
  }),
  component: EmployersPage,
});

function EmployersPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">For Employers</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Unlock vetted international talent.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Browse pre-screened candidates serious enough about international affairs to invest
              in their own preparation. Free to browse public profiles. Starter and Professional
              unlock the Member Pool.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/employer/browse"
                className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper hover:bg-navy"
              >
                Browse Vetted Talent <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="/pricing?tab=employers"
                className="inline-flex items-center gap-2 rounded-sm border border-navy-deep/30 px-6 py-3 text-sm font-medium text-navy-deep hover:border-navy-deep hover:bg-navy-deep/5"
              >
                See Employer Pricing
              </a>
              <Link
                to="/employers/apply"
                className="text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
              >
                Apply for employer access →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="eyebrow">What you get</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              A curated talent pool, not a job board.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Every candidate has been through our coaching process. You see polished resumes
              and the target roles they're actively pursuing.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <ul className="space-y-3">
              {[
                "Searchable directory of active candidates and their resumes",
                "Filter by target sector, region, language, and graduation year",
                "Resumes already tailored and ATS-optimized by our coaches",
                "Direct contact through Discover Diplomacy — no bidding, no spam",
                "Members opt in to be visible to employers — every candidate consents",
              ].map((i) => (
                <li key={i} className="flex gap-3 text-sm text-navy-deep/90">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Resume Drop section */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <Inbox className="h-7 w-7 text-emerald" />
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              The Resume Drop (Member Pool)
            </h2>
            <p className="mt-5 text-muted-foreground">
              The Member Pool is our opt-in pipeline of paid members — Compass and Envoy
              candidates who've consented to be discovered by verified employers. Starter and
              Professional tiers unlock monthly candidate credits to reach them directly.
            </p>
            <Link
              to="/employers/resume-drop"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
            >
              Learn more about Resume Drop <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {[
                { t: "Free", d: "Browse public candidate profiles. Apply for verification." },
                { t: "Starter — $30/mo", d: "Unlock 3 Member Pool candidates per month." },
                { t: "Professional — $100/mo", d: "Unlock 12 candidates per month + advanced filters." },
                { t: "À la carte — $18 / unlock", d: "Pay per candidate. Credits never expire." },
              ].map((tier) => (
                <div key={tier.t} className="bg-paper p-6">
                  <div className="font-display text-base text-navy-deep">{tier.t}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              All tiers require employer verification. Placement fee applies when candidates are
              hired — see <Link to="/pricing" className="underline-offset-4 hover:underline">pricing</Link>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="eyebrow">How vetting works</div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
                We verify every employer. No exceptions.
              </h2>
              <p className="mt-5 text-sm text-muted-foreground">
                Most applications are decided within five business days. We reject roughly a
                third of applicants.
              </p>
            </div>
            <ol className="lg:col-span-7 space-y-6">
              {[
                ["01", "Submit the application", "Tell us about your organization, the hiring contact, the roles you're filling, and two professional references we can call."],
                ["02", "Identity & domain check", "We verify your work email against the organization's domain, confirm your role on LinkedIn, and cross-check the organization against public records."],
                ["03", "Reference call", "We speak with one of your references and, where relevant, a candidate or coach who has worked with your organization before."],
                ["04", "Access granted (or declined)", "Approved employers get a vetted-employer account and access to the directory. We tell declined applicants why, in writing."],
              ].map(([n, t, d]) => (
                <li key={n} className="grid grid-cols-[auto,1fr] gap-5 border-b border-border pb-6 last:border-0">
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
                Verified employers only
              </div>
              <h2 className="mt-4 font-display text-2xl text-paper lg:text-3xl">
                <ShieldCheck className="mr-2 inline h-6 w-6 align-text-bottom text-emerald" />
                Our candidates trust us with their materials. We extend the same standard to
                employers.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                to="/employers/apply"
                className="bg-paper px-5 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-paper/90"
              >
                Apply for employer access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
