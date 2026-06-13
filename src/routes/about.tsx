import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import institution from "@/assets/institution.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Discover Diplomacy was founded in 2024 by four DC students who couldn't find a roadmap into international affairs. So they built one.",
      },
      { property: "og:title", content: "About — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Founded in 2024 by four students who lived the broken path into international affairs.",
      },
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
            <div className="eyebrow">About the Practice</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Built by people who lived the broken path in.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
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
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="eyebrow">Origin</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Founded in 2024 by four students who couldn't find the door.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                We were four undergraduates in Washington, DC trying to break into international
                relations. Capitol Hill was a few blocks away. Foggy Bottom was a Metro ride. The
                think tanks ran panels we could walk into. By every conventional measure, we were
                already inside.
              </p>
              <p>
                And yet none of it added up to a path. Career services pointed us at job boards.
                The job boards required experience we couldn't get without already having it. Every
                briefing told us to "network." Every networking event told us to "be strategic."
                Nobody told us what that actually meant.
              </p>
              <p>
                So we built our own playbook — the hard way. Cold emails sent in batches of fifty.
                Coffee chats that turned into mentors. Application cycles we started over from
                scratch after the third rejection. We compared notes late at night about which
                fellowships were worth the time and which were a tax on the unconnected. Slowly,
                things started to land — on the Hill, at State, at multilaterals, in
                international business.
              </p>
              <blockquote className="border-l-2 border-emerald pl-5 font-display text-xl text-navy-deep">
                "We don't pretend the path is fair. We just refuse to let it stay a mystery."
              </blockquote>
              <p>
                Discover Diplomacy exists because we wished it had. Our practice draws on direct,
                lived experience — what worked, what wasted months, and what nobody tells you until
                you're already in the room.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">What We Believe</div>
            <h2 className="mt-5 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
              A small set of commitments that govern every engagement.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "i", t: "Confidentiality", d: "Every engagement is held in confidence. What you share with us doesn't leave the room." },
              { n: "ii", t: "Candor", d: "We tell clients what they need to hear, not what they want to hear. That's the whole product." },
              { n: "iii", t: "Discipline", d: "Every engagement follows a structured process. We don't improvise on people's careers." },
              { n: "iv", t: "Accountability", d: "We track outcomes. The work either lands roles, opens doors, and sharpens decisions — or we change what we're doing." },
            ].map((p, i) => (
              <Reveal key={p.n} delay={i * 80}>
                <div className="h-full bg-paper p-8">
                  <div className="font-display text-2xl italic text-emerald">{p.n}.</div>
                  <h3 className="mt-4 font-display text-lg text-navy-deep">{p.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <div className="eyebrow">Leadership</div>
              <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
                Four founders.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                We work as a team. Every client benefits from the collective experience of all four
                founders and our growing roster of expert coaches.
              </p>
            </Reveal>
            <div className="grid gap-10 lg:col-span-8 lg:grid-cols-2">
              {[
                { r: "Strategy & Outreach", bio: "International relations graduate with experience across Capitol Hill and multilateral institutions." },
                { r: "Research & Advisory", bio: "Former intern at the U.S. Department of State with a focus on East Asian foreign policy." },
                { r: "Partnerships & Operations", bio: "Background in nonprofit management and youth-led policy organizations in Washington, DC." },
                { r: "Communications & Brand", bio: "Experience in strategic communications for international development and global affairs startups." },
              ].map((m, i) => (
                <Reveal key={m.r} delay={i * 60}>
                  <div className="border-t border-border pt-6">
                    <div className="font-display text-lg text-navy-deep">Founder</div>
                    <div className="text-xs uppercase tracking-wider text-emerald">{m.r}</div>
                    <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
