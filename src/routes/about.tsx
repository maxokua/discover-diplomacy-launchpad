import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import institution from "@/assets/institution.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Discover Diplomacy is a boutique career advisory practice founded to serve the next generation of international affairs professionals.",
      },
      { property: "og:title", content: "About — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "A boutique career advisory practice for international affairs professionals.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="eyebrow">About the Practice</div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
            A career advisory practice built on judgment, not algorithms.
          </h1>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <div className="lg:col-span-5">
            <img
              src={institution}
              alt="Institutional architecture"
              loading="lazy"
              width={1920}
              height={1280}
              className="border border-border object-cover"
            />
            <div className="mt-4 text-xs text-muted-foreground">
              Federal Triangle, Washington, DC
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="eyebrow">Origin</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Founded by students who lived it.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Discover Diplomacy was established in 2024 by four students looking for jobs in
                international relations.
              </p>
              <p>
                Even though we were students in DC, it seemed like an impossible task with little
                to no resources out there on how to do it. That's why we're here.
              </p>
              <p>
                Our practice draws on direct, lived experiences as people who understand the
                process — because we went through it ourselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="eyebrow">Principles</div>
          <h2 className="mt-5 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
            Five commitments that govern every engagement.
          </h2>
          <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-5">
            {[
              {
                n: "i",
                t: "Confidentiality",
                d: "Every engagement is subject to a written confidentiality agreement.",
              },
              {
                n: "ii",
                t: "Selectivity",
                d: "We take on a limited number of clients each quarter to preserve quality.",
              },
              {
                n: "iii",
                t: "Candor",
                d: "We tell clients what they need to hear, not what they want to hear.",
              },
              {
                n: "iv",
                t: "Discipline",
                d: "Every engagement follows the same four-phase advisory process.",
              },
              {
                n: "v",
                t: "Accountability",
                d: "Outcomes are tracked, reported, and used to refine the practice.",
              },
            ].map((p) => (
              <div key={p.n} className="bg-paper p-8">
                <div className="font-display text-2xl italic text-emerald">{p.n}.</div>
                <h3 className="mt-4 font-display text-lg text-navy-deep">{p.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Leadership</div>
              <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
                Four founders.
              </h2>
            </div>
            <div className="grid gap-10 lg:col-span-8 lg:grid-cols-2">
              {[
                {
                  n: "Founder",
                  r: "Strategy & Outreach",
                  bio: "International relations graduate with experience across Capitol Hill and multilateral institutions.",
                },
                {
                  n: "Founder",
                  r: "Research & Advisory",
                  bio: "Former intern at the U.S. Department of State with a focus on East Asian foreign policy.",
                },
                {
                  n: "Founder",
                  r: "Partnerships & Operations",
                  bio: "Background in nonprofit management and youth-led policy organizations in Washington, DC.",
                },
                {
                  n: "Founder",
                  r: "Communications & Brand",
                  bio: "Experience in strategic communications for international development and global affairs startups.",
                },
              ].map((m) => (
                <div key={m.r} className="border-t border-border pt-6">
                  <div className="font-display text-lg text-navy-deep">{m.n}</div>
                  <div className="text-xs uppercase tracking-wider text-emerald">{m.r}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
