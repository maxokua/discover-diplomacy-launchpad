import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/employers/sample-profiles")({
  head: () => ({
    meta: [
      { title: "Sample Profiles — Member Resume Drop | Discover Diplomacy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SampleProfilesPage,
});

const SAMPLES = [
  {
    initials: "R.K.",
    headline: "MA, International Affairs — 2024",
    snippet:
      "Two summers at a multilateral organization in Geneva. Research on UN reform and human rights monitoring. Fluent in French and Arabic; conversational Spanish.",
    roles: ["Foreign Service Officer", "Policy Analyst", "Human Rights Officer"],
    langs: ["English", "French", "Arabic"],
    loc: "Washington, DC",
    year: 2024,
  },
  {
    initials: "M.O.",
    headline: "MPP, Global Development — 2023",
    snippet:
      "Three years as a program associate at an international NGO. Field experience in West Africa and Latin America. Deep experience in M&E, grant writing, and Spanish-language donor relations.",
    roles: ["International Development", "Multilateral Programs", "Program Officer"],
    langs: ["English", "Spanish", "Portuguese"],
    loc: "New York, NY",
    year: 2023,
  },
  {
    initials: "L.T.",
    headline: "BA, Asian Studies — 2023",
    snippet:
      "Trade desk internships in Tokyo and Shanghai. Open to FSO, USTR, and private-sector trade analyst roles. Fluent Mandarin; advanced Japanese.",
    roles: ["Asia-Pacific Policy", "Trade Analyst", "Foreign Service Officer"],
    langs: ["English", "Mandarin", "Japanese"],
    loc: "Seattle, WA",
    year: 2023,
  },
];

function SampleProfilesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="eyebrow">Sample profiles</div>
          <h1 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">
            What a Member Pool profile looks like.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            These are anonymized samples of real candidate types in the Member Pool. Names and
            photos appear after you unlock with credits.
          </p>

          <div className="mt-10 grid gap-5">
            {SAMPLES.map((s) => (
              <article
                key={s.initials}
                className="border border-border bg-stone/40 p-6 lg:p-8"
              >
                <header className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-deep text-sm font-semibold text-paper">
                      {s.initials}
                    </div>
                    <div>
                      <div className="font-display text-xl text-navy-deep blur-[3px] select-none">
                        Anonymous Candidate
                      </div>
                      <div className="text-sm text-muted-foreground">{s.headline}</div>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald/40 bg-emerald/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald">
                    Member · unlockable
                  </span>
                </header>

                <p className="mt-5 text-sm text-navy-deep/90">{s.snippet}</p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Meta label="Target roles" items={s.roles} />
                  <Meta label="Languages" items={s.langs} />
                  <Meta label="Location · Grad year" items={[`${s.loc} · ${s.year}`]} />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/employers/resume-drop"
              className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Back to Resume Drop
            </Link>
            <Link
              to="/employers/resume-drop"
              hash="request-access"
              className="border border-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
            >
              Request access
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Meta({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {items.map((i) => (
          <span key={i} className="bg-paper px-2 py-1 text-xs text-navy-deep">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
