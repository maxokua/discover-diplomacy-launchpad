import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Compass, Target, DoorOpen, GraduationCap, Sparkles, Users } from "lucide-react";
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
      { title: "Discover Diplomacy — The International Career Platform" },
      {
        name: "description",
        content:
          "Discover the opportunities. Prepare the materials. Get hired. Fast. Choose Compass for self-directed tools or Envoy for unlimited coaching — built for international affairs and global business.",
      },
      { property: "og:title", content: "Discover Diplomacy — The International Career Platform" },
      {
        property: "og:description",
        content:
          "Choose Compass for self-directed tools, or Envoy for unlimited coaching. Universities — give your IR program a dedicated career layer.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/" },
      { name: "twitter:title", content: "Discover Diplomacy — The International Career Platform" },
      { name: "twitter:description", content: "Compass, Envoy, or our University Program. Three ways into international careers." },
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
          serviceType: ["Opportunity directory", "Resume review", "Career coaching", "Interview preparation", "Employer access", "University program"],
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
      <ThreePaths />
      <Pillars />
      <Traction />
      <BackedBy />
      <ForEmployers />
      <UniversityCallout />
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
            International Affairs · Global Business · Multilaterals
          </Reveal>
          <Reveal as="h1" delay={80} className="mt-6 font-display text-4xl leading-[1.05] text-navy-deep sm:text-5xl lg:text-[64px]">
            Discover the opportunities.<br />
            Prepare the materials.<br />
            <span className="text-gilt">Get hired. Fast.</span>
          </Reveal>
          <Reveal as="p" delay={160} className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            For ambitious students and early-career professionals in international affairs.
            Choose self-directed tools, hands-on coaching, or bring us in for your whole program.
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <MagneticLink
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Start with Compass
              <ArrowRight className="h-4 w-4" />
            </MagneticLink>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-sm border border-navy-deep/30 px-6 py-3.5 text-sm font-medium text-navy-deep transition-colors hover:border-navy-deep hover:bg-navy-deep/5"
            >
              See Envoy + Coaching
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/universities"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
            >
              Are you a university? Learn more
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

function ThreePaths() {
  const paths = [
    {
      icon: Compass,
      eyebrow: "Self-directed",
      heading: "Self-directed? Start with Compass.",
      body:
        "Resume review, job board, members-only community, and weekly curated opportunities. Everything you need to apply yourself.",
      price: "$20/mo",
      cta: { label: "Start Compass", to: "/pricing" as const },
      tone: "default" as const,
    },
    {
      icon: Sparkles,
      eyebrow: "Mentor included",
      heading: "Want a mentor? Choose Envoy.",
      body:
        "Unlimited coaching, mock interviews, strategic guidance. A vetted insider walks you through every step.",
      price: "$150/mo",
      cta: { label: "Start Envoy", to: "/pricing" as const },
      tone: "feature" as const,
    },
    {
      icon: GraduationCap,
      eyebrow: "For institutions",
      heading: "Are you a university? We're your IR career layer.",
      body:
        "Give your international studies majors a dedicated career platform. Resume help, job board, coaching — in bulk.",
      price: "$20/student/mo",
      cta: { label: "Learn about our University Program", to: "/universities" as const },
      tone: "default" as const,
    },
  ];
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <Reveal>
          <div className="eyebrow">Three ways in</div>
          <h2 className="mt-4 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
            Three ways to get your next international role.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {paths.map((p, i) => (
            <Reveal key={p.heading} delay={i * 100}>
              <div
                className={
                  "flex h-full flex-col border bg-paper p-8 " +
                  (p.tone === "feature" ? "border-2 border-emerald" : "border-border")
                }
              >
                <div className="flex items-center gap-3">
                  <p.icon className={"h-6 w-6 " + (p.tone === "feature" ? "text-emerald" : "text-navy-deep")} />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {p.eyebrow}
                  </div>
                </div>
                <h3 className="mt-4 font-display text-xl text-navy-deep">{p.heading}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                <div className="mt-6 font-display text-2xl text-navy-deep">{p.price}</div>
                <Link
                  to={p.cta.to}
                  className={
                    "mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium uppercase tracking-wider " +
                    (p.tone === "feature"
                      ? "bg-emerald text-navy-deep hover:bg-emerald/90"
                      : "bg-navy-deep text-paper hover:bg-navy")
                  }
                >
                  {p.cta.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
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
          <div className="eyebrow">Why Discover Diplomacy</div>
          <h2 className="mt-4 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
            Built specifically for international careers.
          </h2>
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

function Traction() {
  const stats = [
    { v: TRACTION.peopleReached, l: "Professionals reached" },
    { v: TRACTION.directoryViews, l: "Views to our opportunity directory" },
    { v: "2,500+", l: "Vetted candidates" },
    { v: "200+", l: "Coaches in our network" },
    { v: "500+", l: "Employers accessing talent" },
    { v: TRACTION.weeklyOpportunities, l: "Global opportunities curated weekly" },
  ];
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <Reveal>
          <div className="eyebrow">By the numbers</div>
        </Reveal>
        <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 60} className="bg-paper p-8">
              <div className="font-display text-4xl text-navy-deep lg:text-5xl">{s.v}</div>
              <div className="mt-3 text-sm text-muted-foreground">{s.l}</div>
            </Reveal>
          ))}
        </ul>
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
              Hiring? Unlock vetted international talent.
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Our members are pre-screened — students and early-career professionals serious
              enough about the field to invest in their own preparation. Browse pre-screened
              candidates and reach the ones that fit your role.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 lg:col-span-5 lg:items-end">
            <Link
              to="/employers"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Browse Vetted Talent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-deep/30 px-6 py-3 text-sm font-medium text-navy-deep transition-colors hover:border-navy-deep hover:bg-navy-deep/5"
            >
              See Employer Pricing
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function UniversityCallout() {
  return (
    <section className="border-b border-border bg-navy-deep text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <Reveal className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              For Universities
            </div>
            <h2 className="mt-4 font-display text-2xl text-paper lg:text-3xl">
              Already a university looking to support your students?
            </h2>
            <p className="mt-4 max-w-2xl text-paper/75">
              Discover Diplomacy is the career layer your IR program needs. Bulk Compass
              memberships at $20/student/mo, coach access, and quarterly outcomes reporting.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/universities"
              className="inline-flex items-center gap-2 bg-emerald px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-emerald/90"
            >
              <Users className="h-4 w-4" />
              Learn about our University Program
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
              Choose the path that fits you.
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Compass at $20/mo for self-directed tools, intel, and community. Envoy at $150/mo
              when you want unlimited coaching and a mentor walking you through every step.
              Switch anytime.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 lg:col-span-4 lg:items-end">
            <Link
              to="/pricing"
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
