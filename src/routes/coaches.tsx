import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/coaches")({
  head: () => ({
    meta: [
      { title: "Coach with Discover Diplomacy" },
      {
        name: "description",
        content:
          "Apply to coach with Discover Diplomacy. Market-leading pay per client, flexible scheduling, mission-driven work.",
      },
      { property: "og:title", content: "Coach with Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Apply to coach. Market-leading pay per client, flexible scheduling, mission-driven work.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/coaches" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/coaches" },
    ],
  }),
  component: CoachesPage,
});

function CoachesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">Coach With Us</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Help the next generation break into international affairs, and get paid at the top of the market.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Discover Diplomacy pays coaches a market-leading rate per client. If you've built a
              career in foreign policy, international business, or multilateral institutions, we
              want to hear from you.
            </p>
            <div className="mt-10">
              <Link
                to="/coaches/apply"
                className="inline-block bg-navy-deep px-8 py-4 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
              >
                Apply here
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">Why Coach With Us</div>
          </Reveal>
          <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Top-of-market pay", d: "We pay coaches a market-leading rate per client. No platform fees skimmed off the top." },
              { t: "Flexible", d: "Coach as many or as few clients as your schedule allows. Fully remote." },
              { t: "Motivated clients", d: "Our clients self-select, they're serious, prepared, and globally minded." },
              { t: "Mission-driven", d: "Open the field for people who couldn't otherwise navigate it on their own." },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 60}>
                <div className="h-full bg-paper p-8">
                  <h3 className="font-display text-lg text-navy-deep">{v.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy-deep">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-10 lg:py-40">
          <Reveal>
            <div className="eyebrow text-emerald">Coach With Us</div>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight text-paper lg:text-6xl lg:leading-tight">
              Ready to shape the next generation of foreign policy leaders?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-paper/70">
              We are always looking for experienced professionals who want to give back. If you have walked the halls of power and want to help others do the same, we want to hear from you.
            </p>
            <div className="mt-12">
              <Link
                to="/coaches/apply"
                className="inline-block bg-emerald px-16 py-6 font-display text-2xl text-navy-deep transition-transform hover:scale-105 lg:px-20 lg:py-7 lg:text-3xl"
              >
                Apply here
              </Link>
            </div>
            <p className="mt-6 text-sm text-paper/40">
              No fees to join. We review every application personally.
            </p>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
