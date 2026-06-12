import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import institution from "@/assets/institution.jpg";
import boardroom from "@/assets/boardroom.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Diplomacy — Career Advisory for International Affairs" },
      {
        name: "description",
        content:
          "Discover Diplomacy is a career advisory practice for students and early-career professionals pursuing roles in diplomacy, international policy, and multilateral institutions.",
      },
      { property: "og:title", content: "Discover Diplomacy — Career Advisory for International Affairs" },
      {
        property: "og:description",
        content:
          "Strategic, one-on-one career advising for the next generation of diplomats, policy professionals, and global leaders.",
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
      <Credentials />
      <Practice />
      <Engagement />
      <Outcomes />
      <Insights />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative border-b border-border bg-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-28">
        <div className="lg:col-span-7">
          <div className="eyebrow">Established 2018 · Washington · Geneva</div>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] text-navy-deep sm:text-5xl lg:text-[64px]">
            Strategic career advisory for the next generation of international professionals.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Discover Diplomacy advises students and early-career professionals pursuing
            roles in foreign service, multilateral institutions, international development,
            and global policy. Disciplined, confidential, and outcome-oriented.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
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
              View advisory services
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <figure className="overflow-hidden border border-border">
            <img
              src={institution}
              alt="Classical institutional architecture at dusk"
              width={1920}
              height={1280}
              className="h-[420px] w-full object-cover lg:h-[520px]"
            />
            <figcaption className="border-t border-border bg-stone px-5 py-4 text-xs text-muted-foreground">
              Advising clients placed at the U.S. Department of State, United Nations, OECD,
              World Bank, and leading international NGOs.
            </figcaption>
          </figure>
        </aside>
      </div>
    </section>
  );
}

function Credentials() {
  const items = [
    "U.S. Department of State",
    "United Nations",
    "World Bank Group",
    "OECD",
    "European Commission",
    "USAID",
  ];
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Clients have advanced to roles at
          </div>
          <ul className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-medium text-navy-deep/80">
            {items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const services = [
  {
    no: "01",
    title: "Graduate Admissions Advisory",
    desc: "Strategic positioning for top-tier international affairs programs — SAIS, SIPA, Fletcher, Sciences Po, Oxford, LSE — including school selection, narrative development, and application review.",
    href: "/services",
  },
  {
    no: "02",
    title: "Fellowships & Scholarships",
    desc: "Comprehensive support for Rhodes, Marshall, Fulbright, Schwarzman, Truman, and Pickering candidates, from preliminary positioning through final interview preparation.",
    href: "/services",
  },
  {
    no: "03",
    title: "Foreign Service & Multilateral Careers",
    desc: "Preparation for the Foreign Service Officer Test and Oral Assessment, plus targeted strategy for UN, World Bank, and European institution hiring processes.",
    href: "/services",
  },
  {
    no: "04",
    title: "Early-Career Transitions",
    desc: "Confidential advisory for professionals moving into international policy, development, or diplomacy — including positioning, network development, and offer negotiation.",
    href: "/services",
  },
];

function Practice() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <header className="lg:col-span-4">
            <div className="eyebrow">Practice Areas</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
              Four advisory practices, one discipline.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Engagements are structured, evidence-based, and tailored to each client's
              trajectory. We do not operate as a coaching membership or course platform.
            </p>
          </header>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-border border-y border-border">
              {services.map((s) => (
                <li key={s.no}>
                  <Link
                    to={s.href}
                    className="group grid gap-6 py-8 transition-colors hover:bg-stone/50 md:grid-cols-[64px_1fr_24px] md:items-start md:px-2"
                  >
                    <div className="font-display text-2xl text-emerald">{s.no}</div>
                    <div>
                      <h3 className="font-display text-xl text-navy-deep">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {s.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="hidden h-5 w-5 text-muted-foreground transition-colors group-hover:text-navy-deep md:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const phases = [
  {
    n: "I",
    t: "Intake",
    d: "A confidential 45-minute conversation to understand objectives, constraints, and competitive position.",
  },
  {
    n: "II",
    t: "Diagnostic",
    d: "Structured review of academic record, professional experience, language and regional credentials.",
  },
  {
    n: "III",
    t: "Strategy",
    d: "A written advisory memorandum outlining target programs or roles, timeline, and required positioning.",
  },
  {
    n: "IV",
    t: "Execution",
    d: "Weekly 1:1 sessions, document review, and mock interview preparation through application or offer.",
  },
];

function Engagement() {
  return (
    <section className="border-b border-border bg-navy-deep text-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <header className="lg:col-span-5">
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
          </header>
          <div className="grid gap-px bg-paper/10 lg:col-span-7 lg:grid-cols-2">
            {phases.map((p) => (
              <div key={p.n} className="bg-navy-deep p-8">
                <div className="font-display text-3xl text-emerald">{p.n}</div>
                <h3 className="mt-4 font-display text-xl text-paper">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Outcomes() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:px-10 lg:py-28">
        <div className="lg:col-span-5">
          <img
            src={boardroom}
            alt="Conference room with city skyline"
            loading="lazy"
            width={1600}
            height={1200}
            className="border border-border object-cover"
          />
        </div>
        <div className="lg:col-span-7">
          <div className="eyebrow">Selected Outcomes</div>
          <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
            Measured against the outcomes that matter.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-10 border-t border-border pt-10">
            {[
              { k: "94%", v: "Acceptance rate at first- or second-choice graduate program (2021–2024 cohorts)" },
              { k: "31", v: "Fellowships secured, including Rhodes, Marshall, Fulbright, and Schwarzman" },
              { k: "$2.1M", v: "Aggregate scholarship and fellowship funding awarded to clients" },
              { k: "40+", v: "Countries represented across the client base since founding" },
            ].map((o) => (
              <div key={o.v}>
                <div className="font-display text-4xl text-navy-deep">{o.k}</div>
                <div className="mt-2 text-sm text-muted-foreground">{o.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const insights = [
  {
    cat: "Foreign Service",
    t: "Preparing for the FSOT: a structured six-month plan",
    d: "What we tell every client about pacing, study materials, and the personal narrative section.",
  },
  {
    cat: "Graduate Admissions",
    t: "Why your statement of purpose isn't working",
    d: "The three most common failures we see in international affairs applications — and how to correct them.",
  },
  {
    cat: "Multilateral Careers",
    t: "Inside the UN Young Professionals Programme",
    d: "A candid look at the timeline, competitive dynamics, and post-placement realities.",
  },
];

function Insights() {
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow">Insights</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
              Recent writing from the practice.
            </h2>
          </div>
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
          >
            All insights
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-3">
          {insights.map((i) => (
            <article key={i.t} className="flex flex-col bg-paper p-8">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald">
                {i.cat}
              </div>
              <h3 className="mt-4 font-display text-xl leading-snug text-navy-deep">
                {i.t}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{i.d}</p>
              <Link
                to="/insights"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-navy-deep"
              >
                Read brief <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </article>
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
        <div className="grid gap-10 border-y border-border py-16 lg:grid-cols-12 lg:items-end">
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
        </div>
      </div>
    </section>
  );
}
