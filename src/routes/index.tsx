import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, MapPin, Building2, Compass as CompassIcon, CheckCircle2, Target, DoorOpen } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { BRAND, TRACTION } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Diplomacy — The International Career Platform" },
      {
        name: "description",
        content:
          "Find your path in international affairs. A directory of opportunities, expert-designed preparation, and a free 3-minute career assessment.",
      },
      { property: "og:title", content: "Discover Diplomacy — The International Career Platform" },
      {
        property: "og:description",
        content:
          "Find your path in international affairs. Take the free 3-minute career assessment.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/" },
      { name: "twitter:title", content: "Discover Diplomacy" },
      { name: "twitter:description", content: "Find your path in international affairs. Take the free 3-minute career assessment." },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Discover Diplomacy",
          url: "https://discoverdiplomacy.org",
          description: BRAND.positioning,
          areaServed: "Worldwide",
          address: { "@type": "PostalAddress", addressLocality: "Washington", addressRegion: "DC", addressCountry: "US" },
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <ProductPreview />
      <Stats />
      <Founder />
      <SecondaryCTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-5xl px-6 pt-24 pb-28 text-center lg:px-10 lg:pt-32 lg:pb-36">
        <Reveal as="div" className="eyebrow">
          International Affairs · Global Business · Multilaterals
        </Reveal>
        <Reveal as="h1" delay={80} className="mt-8 font-display text-navy-deep">
          Find your path in international affairs.
        </Reveal>
        <Reveal as="p" delay={160} className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
          Discover Diplomacy helps globally-minded students and early-career professionals
          find the roles, preparation, and access that turn ambition into a career.
        </Reveal>
        <Reveal delay={240} className="mt-12">
          <Link
            to="/assessment"
            className="inline-flex items-center gap-3 rounded-lg bg-gilt px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-gilt/90"
          >
            Find your career path — free 3-minute assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* Real UI preview: composed from the actual directory + assessment components,
   in a browser chrome frame, no stock imagery. */
function ProductPreview() {
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">Inside the platform</div>
          <h2 className="mt-6 font-display text-navy-deep">
            A working directory and a real assessment — not a demo.
          </h2>
          <p className="mt-6 text-muted-foreground">
            Browse curated global opportunities, then take a short assessment
            that produces a specific plan for your background.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <BrowserFrame label="discoverdiplomacy.org/directory">
              <DirectoryMock />
            </BrowserFrame>
          </Reveal>
          <Reveal delay={100}>
            <BrowserFrame label="discoverdiplomacy.org/assessment">
              <AssessmentMock />
            </BrowserFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BrowserFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-paper">
      <div className="flex items-center gap-2 border-b border-border bg-stone px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
        <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
        <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
        <div className="ml-4 truncate text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function DirectoryMock() {
  const rows = [
    { org: "United Nations Development Programme", role: "Policy Analyst, Governance", loc: "New York, NY", tag: "Multilateral" },
    { org: "International Crisis Group", role: "Research Fellow, Sahel", loc: "Brussels, BE", tag: "Think Tank" },
    { org: "U.S. Department of State", role: "Foreign Affairs Officer", loc: "Washington, DC", tag: "Government" },
    { org: "Open Society Foundations", role: "Program Officer, MENA", loc: "London, UK", tag: "NGO" },
  ];
  return (
    <div>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-stone px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search 500+ global opportunities…</span>
      </div>
      <ul className="mt-6 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.role} className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate font-display text-[17px] text-navy-deep">{r.role}</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{r.org}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.loc}</span>
                </div>
              </div>
              <span className="shrink-0 rounded-lg border border-border px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {r.tag}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AssessmentMock() {
  const paths = [
    { icon: CompassIcon, title: "Path 1 · Multilateral Policy", body: "Target UNDP, World Bank YPP, and OECD associate roles within 12 months." },
    { icon: Target, title: "Path 2 · Foreign Service", body: "Sit the FSOT this cycle; strengthen consular and public-diplomacy narratives." },
    { icon: DoorOpen, title: "Path 3 · Think Tank Research", body: "Pitch two Sahel-focused briefs; apply for Crisis Group and Brookings fellowships." },
  ];
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-gilt" />Your results</span>
        <span>3 recommended paths</span>
      </div>
      <div className="mt-4 rounded-lg border border-border p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Personalized 90-day plan
        </div>
        <ul className="mt-4 space-y-4">
          {paths.map((p) => (
            <li key={p.title} className="flex gap-3">
              <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-navy-deep" />
              <div>
                <div className="font-display text-[15px] text-navy-deep">{p.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { v: TRACTION.directoryViews, l: "Directory views" },
    { v: TRACTION.peopleReached, l: "Professionals reached" },
    { v: TRACTION.weeklyOpportunities, l: "Opportunities curated weekly" },
    { v: "75+", l: "Countries reached" },
  ];
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">By the numbers</div>
          <h2 className="mt-6 font-display text-navy-deep">
            Trusted by internationally-minded professionals worldwide.
          </h2>
        </Reveal>
        <ul className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 60} className="text-center">
              <div className="font-display text-5xl text-navy-deep lg:text-6xl">{s.v}</div>
              <div className="mt-4 text-sm uppercase tracking-[0.14em] text-muted-foreground">{s.l}</div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-5xl px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <div
              aria-hidden
              className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border border-border bg-paper font-display text-6xl text-navy-deep lg:mx-0"
            >
              M
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="eyebrow">Why we built this</div>
            <p className="mt-6 font-display text-2xl leading-snug text-navy-deep lg:text-[28px]">
              "Talented people were losing the international careers they wanted
              because no one told them how the doors actually open."
            </p>
            <p className="mt-6 text-muted-foreground">
              Discover Diplomacy is the platform I wish I'd had — a real directory,
              honest preparation, and access to people who've walked the path.
            </p>
            <div className="mt-6 text-sm font-medium text-navy-deep">
              Max Brannon · Founder, Discover Diplomacy
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SecondaryCTA() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32">
        <Reveal>
          <h2 className="font-display text-navy-deep">
            Not sure where you fit? Start with the assessment.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Three minutes, no signup required. You'll get three concrete paths and a 90-day plan.
          </p>
          <div className="mt-10">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-3 rounded-lg bg-gilt px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-gilt/90"
            >
              Find your career path — free 3-minute assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
