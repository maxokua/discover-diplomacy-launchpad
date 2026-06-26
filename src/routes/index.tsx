import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Compass, Target, DoorOpen } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Parallax } from "@/components/scroll-effects";
import { MagneticLink } from "@/components/magnetic";
import { BRAND, PILLARS, TRACTION } from "@/lib/brand";
import institution from "@/assets/institution.jpg";
import ypfpLogo from "@/assets/ypfp-logo.jpg.asset.json";
import americanUniversityLogo from "@/assets/american-university-logo.png.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Diplomacy — Talent Infrastructure for Global Careers" },
      {
        name: "description",
        content:
          "Discover the opportunities. Prepare the materials. Open the doors. Get hired. A curated directory, instant expert-designed application help, vetted insider coaches, and direct access to employers — built for international careers.",
      },
      { property: "og:title", content: "Discover Diplomacy — Talent Infrastructure for Global Careers" },
      {
        property: "og:description",
        content:
          "Turn ambition into offers in diplomacy, multilaterals, global policy, and international business.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/" },
      { name: "twitter:title", content: "Discover Diplomacy — Talent Infrastructure for Global Careers" },
      { name: "twitter:description", content: "Curated opportunities, expert-designed prep, vetted coaches, and direct employer access." },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/" },
    ],
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
          serviceType: ["Opportunity directory", "Resume review", "Career coaching", "Interview preparation", "Employer access"],
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
      <Traction />
      <BackedBy />
      <Pillars />
      <Practice />
      <Engagement />
      <ForEmployers />
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
            Talent Infrastructure · International Affairs & Global Business
          </Reveal>
          <Reveal as="h1" delay={80} className="mt-6 font-display text-4xl leading-[1.05] text-navy-deep sm:text-5xl lg:text-[64px]">
            Discover the opportunities.<br />
            Prepare the materials.<br />
            <span className="text-gilt">Open the doors.</span> Get hired.
          </Reveal>
          <Reveal as="p" delay={160} className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Discover Diplomacy is the platform built for globally-minded students and
            early-career professionals — combining a curated opportunity directory,
            instant expert-designed application help, vetted insider coaches, and direct
            access to employers. Fast, affordable, and built for this field.
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <MagneticLink
              to="/assessment"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Take the free assessment
              <ArrowRight className="h-4 w-4" />
            </MagneticLink>
            <Link
              to="/waitlist"
              className="inline-flex items-center gap-2 rounded-sm border border-navy-deep/30 px-6 py-3.5 text-sm font-medium text-navy-deep transition-colors hover:border-navy-deep hover:bg-navy-deep/5"
            >
              Get the weekly digest
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
            >
              See plans
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <Reveal as="aside" delay={200} y={36} className="lg:col-span-5">
          <figure className="overflow-hidden border border-border">
            <Parallax speed={-0.15}>
              <img
                src={institution}
                alt="Classical institutional architecture at dusk"
                width={1920}
                height={1280}
                fetchPriority="high"
                decoding="async"
                className="h-[460px] w-full scale-110 object-cover lg:h-[560px]"
              />
            </Parallax>
          </figure>
        </Reveal>

      </div>
    </section>
  );
}

function Traction() {
  const stats = [
    { v: TRACTION.peopleReached, l: "People reached through the directory and digest" },
    { v: TRACTION.directoryViews, l: "Views on our curated opportunity directory" },
    { v: TRACTION.weeklyOpportunities, l: "Global opportunities curated every week" },
  ];
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-14">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            What we've built so far
          </div>
        </Reveal>
        <ul className="mt-6 grid gap-px border border-border bg-border md:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 80} className="bg-paper p-8">
              <div className="font-display text-4xl text-navy-deep lg:text-5xl">{s.v}</div>
              <div className="mt-3 text-sm text-muted-foreground">{s.l}</div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Pillars() {
  const icons: Record<string, typeof Compass> = { clarity: Compass, preparation: Target, access: DoorOpen };
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <Reveal>
          <div className="eyebrow">How the platform works</div>
          <h2 className="mt-4 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
            Three things every serious candidate needs. We do all three.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Built on the principle that paid time is sold — coaching, review, expertise — but
            genuine vouches are earned. We sell preparation and access to the venue; you earn the rest.
          </p>
        </Reveal>
        <ul className="mt-12 grid gap-px border border-border bg-border lg:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = icons[p.key];
            return (
              <Reveal key={p.key} delay={i * 100} className="bg-paper p-8">
                <Icon className="h-6 w-6 text-gilt" />
                <h3 className="mt-5 font-display text-2xl text-navy-deep">{p.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.line}</p>
              </Reveal>
            );
          })}
        </ul>
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
    desc: "The field is vast, foreign service, multilaterals, think tanks, international development, government affairs, global business. We help you cut through the noise and identify the roles, sectors, and trajectories that genuinely fit your interests, skills, and life.",
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
    desc: "Once direction is clear, we run a disciplined campaign to get you hired. Resume and narrative, network architecture, application strategy, interview preparation, and offer negotiation, the full arc from positioning to acceptance.",
    bullets: [
      "Resume, CV, and LinkedIn repositioning for the target sector",
      "Network mapping and outreach strategy",
      "Application drafting, review, and timing",
      "Mock interviews with panel-style preparation tailored to each role",
      "Offer evaluation and negotiation",
    ],
  },
];

function Practice() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal as="header" className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
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

const engagementSteps = [
  { n: "01", t: "Make your account", d: "Sign up in under a minute." },
  { n: "02", t: "Upload your documents", d: "Resume, CV, LinkedIn, whatever you've got. We work from what you give us." },
  { n: "03", t: "Link the job postings", d: "Drop in the roles you actually want to apply to. That pings us." },
  { n: "04", t: "We send it back", d: "Updated documents and clear advice, no hassle, no awkward email chains, no information overload." },
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
              Just clear insights into exactly what you should do.
            </h2>
            <p className="mt-5 max-w-md text-paper/70">
              Make your account, upload your documents, and link the job postings you want to
              apply to. That pings us, and we send you your updated documents and advice. No
              hassle, no awkward email exchange, no information overload.
            </p>
          </Reveal>
          <div className="grid gap-px bg-paper/10 lg:col-span-7 lg:grid-cols-2">
            {engagementSteps.map((p, i) => (
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

function BackedBy() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <Reveal className="flex flex-col items-center gap-8 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Backed by
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            <li>
              <img
                src={ypfpLogo.url}
                alt="Young Professionals in Foreign Policy"
                width={160}
                height={160}
                loading="lazy"
                className="h-20 w-20 object-contain opacity-80 grayscale transition-all duration-500 hover:scale-105 hover:opacity-100 hover:grayscale-0 lg:h-24 lg:w-24"
              />
            </li>
            <li className="hidden h-10 w-px bg-border md:block" aria-hidden />
            <li>
              <img
                src={americanUniversityLogo.url}
                alt="American University — Veloric Center for Entrepreneurship"
                width={160}
                height={160}
                loading="lazy"
                className="h-16 w-16 object-contain opacity-80 grayscale transition-all duration-500 hover:scale-105 hover:opacity-100 hover:grayscale-0 lg:h-20 lg:w-20"
              />
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}


function ForEmployers() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="eyebrow">For Employers</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-4xl">
              Hiring? Access vetted candidates in international affairs.
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Our clients are students and early-career professionals serious enough about the
              field to invest in their own preparation. Browse their resumes and reach the ones
              that fit your role.
            </p>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <Link
              to="/employers"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Access candidate resumes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
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
            <div className="eyebrow">Start here</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-5xl">
              Free to start. Built to get you the offer.
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Explorer is free — create an account and book a Diplomat-level coach. Compass
              at $20/mo adds the weekly digest, full resource library, and Ambassador
              coaches. Envoy at $150/mo adds Presidential coaches and two complimentary
              Diplomat sessions every month. Month-to-month, cancel anytime.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 lg:col-span-4 lg:items-end">
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-navy-deep px-7 py-4 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              See plans
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/assessment"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-deep/30 px-7 py-3 text-sm font-medium text-navy-deep transition-colors hover:border-navy-deep hover:bg-navy-deep/5"
            >
              Take the free assessment
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
