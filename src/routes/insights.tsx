import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Briefings and analysis on graduate admissions, fellowships, the Foreign Service, and multilateral careers.",
      },
      { property: "og:title", content: "Insights — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Briefings and analysis on graduate admissions, fellowships, the Foreign Service, and multilateral careers.",
      },
    ],
  }),
  component: InsightsPage,
});

const POSTS = [
  {
    cat: "Foreign Service",
    date: "May 2026",
    t: "Preparing for the FSOT: a structured six-month plan",
    d: "Pacing, study materials, and the personal narrative section — what we tell every client.",
    read: "8 min read",
  },
  {
    cat: "Graduate Admissions",
    date: "April 2026",
    t: "Why your statement of purpose isn't working",
    d: "The three most common failures we see in international affairs applications, and how to correct them.",
    read: "6 min read",
  },
  {
    cat: "Multilateral Careers",
    date: "March 2026",
    t: "Inside the UN Young Professionals Programme",
    d: "A candid look at the timeline, competitive dynamics, and post-placement realities.",
    read: "11 min read",
  },
  {
    cat: "Fellowships",
    date: "February 2026",
    t: "Rhodes 2026: what changed and what didn't",
    d: "Notes from a former regional selection committee member on this year's class.",
    read: "7 min read",
  },
  {
    cat: "Early-Career",
    date: "January 2026",
    t: "Pivoting from consulting to international development",
    d: "What works, what doesn't, and what the typical eighteen-month transition actually looks like.",
    read: "9 min read",
  },
  {
    cat: "Graduate Admissions",
    date: "December 2025",
    t: "SAIS, SIPA, Fletcher: the comparative case",
    d: "An advisor's framework for choosing between three of the leading U.S. programs.",
    read: "10 min read",
  },
];

function InsightsPage() {
  const [featured, ...rest] = POSTS;
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="eyebrow">Insights</div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
            Briefings on the work of building an international career.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Written by the practice's senior advisors. Distributed quarterly to a
            subscriber list of students, professionals, and university career offices.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <article className="grid gap-10 border-y border-border py-12 lg:grid-cols-12">
            <div className="lg:col-span-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                Featured
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{featured.date}</div>
            </div>
            <div className="lg:col-span-10">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {featured.cat}
              </div>
              <h2 className="mt-3 font-display text-3xl text-navy-deep lg:text-5xl">
                {featured.t}
              </h2>
              <p className="mt-4 max-w-3xl text-base text-muted-foreground lg:text-lg">
                {featured.d}
              </p>
              <a
                href="#"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
              >
                Read the briefing <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="eyebrow">Archive</div>
          <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
            Recent briefings.
          </h2>
          <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <article key={p.t} className="flex flex-col bg-paper p-8">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em]">
                  <span className="text-emerald">{p.cat}</span>
                  <span className="text-muted-foreground">{p.date}</span>
                </div>
                <h3 className="mt-5 font-display text-xl leading-snug text-navy-deep">
                  {p.t}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{p.d}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>{p.read}</span>
                  <a href="#" className="font-medium text-navy-deep">
                    Read →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-deep text-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                Quarterly Briefing
              </div>
              <h2 className="mt-5 font-display text-3xl text-paper lg:text-4xl">
                Receive the briefing in your inbox.
              </h2>
              <p className="mt-4 max-w-xl text-paper/70">
                Four issues each year. No promotional content, no third-party sharing.
              </p>
            </div>
            <form
              className="lg:col-span-5"
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget as HTMLFormElement;
                f.reset();
                alert("Thank you. You will receive a confirmation by email.");
              }}
            >
              <div className="flex border border-paper/30 bg-paper/5">
                <input
                  required
                  type="email"
                  placeholder="name@institution.edu"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-paper px-5 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-paper/90"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
