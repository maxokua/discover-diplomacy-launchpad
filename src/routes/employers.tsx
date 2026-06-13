import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/employers")({
  head: () => ({
    meta: [
      { title: "For Employers | Access Candidate Resumes | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Hiring in international affairs, policy, or global business? Browse vetted resumes from Discover Diplomacy clients, students and early-career professionals serious about the field.",
      },
      { property: "og:title", content: "For Employers | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Access vetted candidate resumes from clients pursuing roles in diplomacy, policy, multilaterals, and international business.",
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
              Access vetted candidates ready to work in international affairs.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Our clients are students and early-career professionals serious enough about the
              field to invest in their own preparation. Their resumes have been reviewed, tailored,
              and rewritten by experts. Browse the ones that fit your role.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper hover:bg-navy"
              >
                Request employer access <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:employers@discoverdiplomacy.com"
                className="text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
              >
                employers@discoverdiplomacy.com
              </a>
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
              and the target roles they're actually pursuing.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <ul className="space-y-3">
              {[
                "Searchable directory of active candidates and their resumes",
                "Filter by target sector, region, language, and graduation year",
                "Resumes already tailored and ATS-optimized by our coaches",
                "Direct contact through Discover Diplomacy, no bidding, no spam",
                "Members opt in to be visible to employers, every candidate consents",
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

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="eyebrow">How it works</div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
                Three steps to your shortlist.
              </h2>
            </div>
            <ol className="lg:col-span-7 space-y-6">
              {[
                ["01", "Request access", "Tell us about your organization and the roles you're filling. We verify employers before granting access."],
                ["02", "Browse the directory", "Search and filter candidate resumes by sector, region, language, and timing."],
                ["03", "Reach out through us", "Flag the candidates you'd like to connect with. We make the warm introduction."],
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
                to="/contact"
                className="bg-paper px-5 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-paper/90"
              >
                Request employer access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
