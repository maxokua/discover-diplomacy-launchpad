import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Parallax } from "@/components/scroll-effects";
import institution from "@/assets/institution.jpg";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Discover Diplomacy was founded in 2024 by four DC students who couldn't find a roadmap into international affairs. So they built one.",
      },
      { property: "og:title", content: "About | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Founded in 2024 by four students who lived the broken path into international affairs.",
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
                So we built our own playbook, the hard way. Cold emails sent in batches of fifty.
                Coffee chats that turned into mentors. Application cycles we started over from
                scratch after the third rejection. We compared notes late at night about which
                fellowships were worth the time and which were a tax on the unconnected. Slowly,
                things started to land, on the Hill, at State, at multilaterals, in
                international business.
              </p>
              <p>
                Discover Diplomacy exists because we wished it had. Our practice draws on direct,
                lived experience, what worked, what wasted months, and what nobody tells you until
                you're already in the room.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

    </SiteLayout>
  );
}
