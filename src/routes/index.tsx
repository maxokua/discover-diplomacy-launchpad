import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Compass, Target } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Parallax } from "@/components/scroll-effects";
import institution from "@/assets/institution.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Diplomacy | Career Advisory for International Affairs & Global Business" },
      {
        name: "description",
        content:
          "Discover Diplomacy advises students and early-career professionals pursuing careers in diplomacy, international policy, multilateral institutions, and international business.",
      },
      { property: "og:title", content: "Discover Diplomacy | Career Advisory for International Affairs & Global Business" },
      {
        property: "og:description",
        content:
          "Helping the next generation discover what they want to do in international affairs and global business, and how to land those roles.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/" },
      { name: "twitter:title", content: "Discover Diplomacy | Career Advisory" },
      { name: "twitter:description", content: "Career coaching for students and early-career professionals in diplomacy, policy, and global business." },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Discover Diplomacy",
          url: "https://discoverdiplomacy.org",
          description: "Career advisory for students and early-career professionals pursuing diplomacy, international policy, multilateral institutions, and global business.",
          areaServed: "Worldwide",
          address: { "@type": "PostalAddress", addressLocality: "Washington", addressRegion: "DC", addressCountry: "US" },
          serviceType: ["Career coaching", "Resume review", "Interview preparation", "Career membership"],
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
      <BackedBy />
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
            Career Advisory · International Affairs & Global Business
          </Reveal>
          <Reveal as="h1" delay={80} className="mt-6 font-display text-4xl leading-[1.1] text-navy-deep sm:text-5xl lg:text-[64px]">
            Discover what you want to do in the field, and how to land it.
          </Reveal>
          <Reveal as="p" delay={160} className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Discover Diplomacy advises students and early-career professionals pursuing
            roles in diplomacy, international policy, multilateral institutions, and
            international business. Our work begins with clarity about what you actually
            want, and ends with the offer in hand.
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Start a Membership
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
            <Parallax speed={-0.15}>
              <img
                src={institution}
                alt="Classical institutional architecture at dusk"
                width={1920}
                height={1280}
                className="h-[460px] w-full scale-110 object-cover lg:h-[560px]"
              />
            </Parallax>
          </figure>
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
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <Reveal className="flex flex-col items-center gap-10 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Backed by
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
            <div className="flex flex-col items-center">
              <div className="font-display text-2xl font-semibold tracking-tight text-navy-deep lg:text-3xl">
                YPFP
              </div>
              <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Young Professionals in Foreign Policy
              </div>
            </div>
            <div className="hidden h-12 w-px bg-border md:block" aria-hidden />
            <div className="flex flex-col items-center">
              <div className="font-display text-2xl font-semibold tracking-tight text-navy-deep lg:text-3xl">
                Veloric Center for Entrepreneurship
              </div>
              <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                American University · Washington, DC
              </div>
            </div>
          </div>
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
            <div className="eyebrow">Begin an Engagement</div>
            <h2 className="mt-5 font-display text-3xl text-navy-deep lg:text-5xl">
              Join the membership and get to work.
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              $50/month, no annual lock-in. Tailored resume, LinkedIn review, research,
              outreach, interview prep, and a weekly Substack of 50 global opportunities.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-7 py-4 text-sm font-medium text-paper transition-colors hover:bg-navy"
            >
              Start a Membership
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
