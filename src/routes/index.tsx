import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Compass, Target } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import institution from "@/assets/institution.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Diplomacy — Career Advisory for International Affairs & Global Business" },
      {
        name: "description",
        content:
          "Discover Diplomacy advises students and early-career professionals pursuing careers in diplomacy, international policy, multilateral institutions, and international business.",
      },
      { property: "og:title", content: "Discover Diplomacy — Career Advisory for International Affairs & Global Business" },
      {
        property: "og:description",
        content:
          "Helping the next generation discover what they want to do in international affairs and global business — and how to land those roles.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Practice />
      <Engagement />
      <Partners />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative border-b border-border bg-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-28">
        <div className="lg:col-span-7">
          <Reveal as="div" className="eyebrow">
            Career Advisory · International Affairs & Global Business
          </Reveal>
          <Reveal as="h1" delay={80} className="mt-6 font-display text-4xl leading-[1.1] text-navy-deep sm:text-5xl lg:text-[64px]">
            Discover what you want to do in the field — and how to land it.
          </Reveal>
          <Reveal as="p" delay={160} className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Discover Diplomacy advises students and early-career professionals pursuing
            roles in diplomacy, international policy, multilateral institutions, and
            international business. Our work begins with clarity about what you actually
            want, and ends with the offer in hand.
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Request a Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
            >
              How we work
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <Reveal as="aside" delay={200} y={36} className="lg:col-span-5">
          <figure className="overflow-hidden border border-border">
            <img
              src={institution}
              alt="Classical institutional architecture at dusk"
              width={1920}
              height={1280}
              className="h-[420px] w-full object-cover lg:h-[520px]"
            />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

function Placements() {
  const items = [
    "U.S. Senate",
    "U.S. Department of State",
    "DGA Group",
    "The Asia Group",
  ];
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <Reveal className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Recent Placements
          </div>
          <ul className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-medium text-navy-deep/85">
            {items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

const services = [
  {
    no: "01",
    icon: Compass,
    title: "Career Orientation",
    headline: "Figure out what you actually want to do.",
    desc: "The field is vast — foreign service, multilaterals, think tanks, international development, government affairs, global business. We help you cut through the noise and identify the roles, sectors, and trajectories that genuinely fit your interests, skills, and life.",
    bullets: [
      "Structured exploration of the field across diplomacy, policy, and international business",
      "Self-assessment of strengths, values, and constraints",
      "Sector and role mapping with realistic entry pathways",
      "A written advisory memorandum outlining your direction",
    ],
  },
  {
    no: "02",
    icon: Target,
    title: "Placement Execution",
    headline: "Land the role.",
    desc: "Once direction is clear, we run a disciplined campaign to get you hired. Resume and narrative, network architecture, application strategy, interview preparation, and offer negotiation — the full arc from positioning to acceptance.",
    bullets: [
      "Resume, CV, and LinkedIn repositioning for the target sector",
      "Network mapping and outreach strategy",
      "Application drafting, review, and timing",
      "Mock interviews, including FSOT, Oral Assessment, and panel formats",
      "Offer evaluation and negotiation",
    ],
  },
];

function Practice() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal as="header" className="lg:col-span-4">
            <div className="eyebrow">What We Do</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
              Career orientation. Then placement.
            </h2>
            <p className="mt-5 text-muted-foreground">
              We work with each client on two questions: what to do in the field,
              and how to land it. Everything else is in service of those two answers.
            </p>
          </Reveal>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-border border-y border-border">
              {services.map((s, idx) => (
                <li key={s.no}>
                  <Reveal delay={idx * 100}>
                    <div className="grid gap-8 py-10 md:grid-cols-[64px_1fr] md:items-start md:px-2">
                      <div>
                        <div className="font-display text-2xl text-emerald">{s.no}</div>
                        <s.icon className="mt-4 h-6 w-6 text-navy-deep/60" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {s.title}
                        </div>
                        <h3 className="mt-2 font-display text-2xl text-navy-deep">
                          {s.headline}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {s.desc}
                        </p>
                        <ul className="mt-5 space-y-2 text-sm text-navy-deep/85">
                          {s.bullets.map((b) => (
                            <li key={b} className="flex gap-3 border-l border-emerald/40 pl-3">
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
            <Reveal delay={120} className="mt-8">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
              >
                See the full engagement process <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

const phases = [
  { n: "I", t: "Intake", d: "A confidential 45-minute conversation to understand objectives, constraints, and competitive position." },
  { n: "II", t: "Diagnostic", d: "Structured review of academic record, professional experience, language and regional credentials." },
  { n: "III", t: "Strategy", d: "A written advisory memorandum outlining your direction in the field, target roles, and timeline." },
  { n: "IV", t: "Execution", d: "Weekly 1:1 sessions, document review, network strategy, and interview preparation through offer." },
];

function Engagement() {
  return (
    <section className="border-b border-border bg-navy-deep text-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal as="header" className="lg:col-span-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              Engagement Model
            </div>
            <h2 className="mt-5 font-display text-3xl text-paper lg:text-4xl">
              A four-phase advisory process.
            </h2>
            <p className="mt-5 max-w-md text-paper/70">
              Every engagement follows the same disciplined arc, from intake through outcome.
              No templated coursework, no group cohorts.
            </p>
          </Reveal>
          <div className="grid gap-px bg-paper/10 lg:col-span-7 lg:grid-cols-2">
            {phases.map((p, i) => (
              <Reveal key={p.n} delay={i * 80} className="bg-navy-deep p-8">
                <div className="font-display text-3xl text-emerald">{p.n}</div>
                <h3 className="mt-4 font-display text-xl text-paper">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{p.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="eyebrow">Backed By</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
              In partnership with leading institutions.
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Discover Diplomacy is supported by partners who share our commitment to
              developing the next generation of international affairs professionals.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-2">
          {[
            {
              n: "Young Professionals in Foreign Policy",
              d: "A leading global network of emerging foreign policy leaders.",
            },
            {
              n: "American University",
              d: "Home to the School of International Service and a longtime hub for international affairs talent.",
            },
          ].map((p, i) => (
            <Reveal key={p.n} delay={i * 100} className="bg-paper p-8">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald">
                Partner
              </div>
              <div className="mt-3 font-display text-xl text-navy-deep">{p.n}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="grid gap-10 border-y border-border py-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="eyebrow">Begin an Engagement</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-5xl">
              Schedule a confidential consultation.
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              We take on a limited number of new clients each quarter. To inquire about
              representation, please submit a brief outline of your background and goals.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-7 py-4 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Request a Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
