import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Parallax } from "@/components/scroll-effects";
import { TRACTION, PILLARS, TRUST_WALL } from "@/lib/brand";
import institution from "@/assets/institution.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Discover Diplomacy is the platform for global careers — a directory of opportunities, instant application help, vetted coaches, and direct access to verified employers.",
      },
      { property: "og:title", content: "About | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Built for globally-minded students and early-career professionals. Tech-enabled preparation, vetted human coaches, real employer access.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/about" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/about" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">About the Platform</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Discover Diplomacy for global careers.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              International careers — diplomacy, multilaterals, global policy, international
              development, human rights, international business — are fragmented and gated by
              who-you-know. Discover Diplomacy is the platform that turns ambition into offers.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-navy-deep/85">
              Four audiences, one mission: get serious people into roles they love —
              candidates, universities, employers, and the coaches who mentor them.
            </p>
          </Reveal>

          <Reveal delay={140} className="mt-12 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Candidates", d: "Compass or Envoy — self-directed tools or unlimited coaching.", to: "/pricing" as const },
              { t: "Universities", d: "Bulk Compass at $20/student/mo for IR programs.", to: "/universities" as const },
              { t: "Employers", d: "Browse pre-screened candidates. Free + paid tiers.", to: "/employers" as const },
              { t: "Coaches", d: "Apply to coach. Earn at the top of the market.", to: "/coaches/apply" as const },
            ].map((a) => (
              <Link key={a.t} to={a.to} className="group bg-paper p-6 transition-colors hover:bg-stone">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">For {a.t}</div>
                <div className="mt-2 font-display text-lg text-navy-deep group-hover:underline">{a.d}</div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="overflow-hidden border border-border">
              <Parallax speed={-0.18}>
                <img
                  src={institution}
                  alt="Institutional architecture"
                  loading="lazy"
                  width={1920}
                  height={1280}
                  className="scale-110 object-cover"
                />
              </Parallax>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Federal Triangle, Washington, DC
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={120}>
            <div className="eyebrow">Why we exist</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Career services hand you a job board. We hand you the playbook.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Generic job boards don't vet anything. Boutique consultants are slow and
                exclusive. Career centers point at the same fellowships everyone already
                knows. None of that adds up to a path into the Foreign Service, the UN
                system, the major NGOs, or international business.
              </p>
              <p>
                We built the platform we wished existed when we were starting out: a curated
                directory of the real opportunities, instant expert-designed help on the
                materials, vetted insider coaches when you need a human, and a direct
                pipeline to employers actively hiring early-career global talent.
              </p>
              <p>
                Anything that can be automated runs on expert-designed systems — fast,
                consistent, affordable. Humans are reserved for judgment, strategy, and
                real mentorship from people who've actually worked in the field.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">How we think about it</div>
            <h2 className="mt-4 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
              Clarity. Preparation. Access.
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-px border border-border bg-border lg:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.key} delay={i * 100} className="bg-paper p-8">
                <div className="font-display text-3xl text-gilt">0{i + 1}</div>
                <h3 className="mt-4 font-display text-2xl text-navy-deep">{p.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.line}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-navy-deep text-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
                The Trust Wall
              </div>
              <h2 className="mt-5 font-display text-3xl text-paper lg:text-4xl">
                What we sell — and what we don't.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-paper/80 lg:col-span-7">
              {TRUST_WALL} We sell preparation and access to the venue. We never sell a vouch,
              a referral, or a recommendation. Coaches mentor; they don't slide a résumé in
              for anyone who pays. That line is the whole reason this works.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">Traction</div>
            <h2 className="mt-4 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
              Built on a real audience, not a deck.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
            {[
              { v: TRACTION.peopleReached, l: "People reached through the directory and digest" },
              { v: TRACTION.directoryViews, l: "Views on our curated opportunity directory" },
              { v: TRACTION.weeklyOpportunities, l: "Global opportunities curated every week" },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 80} className="bg-paper p-8">
                <div className="font-display text-4xl text-navy-deep lg:text-5xl">{s.v}</div>
                <div className="mt-3 text-sm text-muted-foreground">{s.l}</div>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Take the free assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/waitlist"
              className="inline-flex items-center gap-2 rounded-sm border border-navy-deep/30 px-6 py-3.5 text-sm font-medium text-navy-deep transition-colors hover:border-navy-deep hover:bg-navy-deep/5"
            >
              Get the weekly digest
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
