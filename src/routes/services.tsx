import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Two services: 1:1 career orientation coaching for international affairs, and a $25 expert resume review tailored to pass ATS.",
      },
      { property: "og:title", content: "Services — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "1:1 career orientation coaching and a $25 expert resume review tailored to pass ATS.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">Services</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Two services. Built for people who are serious about this field.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              We help globally minded students and early professionals figure out what they
              actually want to do in international affairs — and give them the tools to land it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Career Orientation */}
      <section id="orientation" className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              Service 01
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Career Orientation
            </h2>
            <p className="mt-5 text-muted-foreground">
              The field is huge. The Foreign Service, multilaterals, think tanks, intelligence,
              international business, development — they all look adjacent from the outside and
              feel completely different on the inside. We help you cut through it.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
            >
              Book an intake call <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              What it includes
            </div>
            <ul className="mt-5 space-y-3">
              {[
                "1:1 sessions with a coach who has lived the path you're considering",
                "Career-orientation diagnostic: skills, interests, leverage, and constraints",
                "A shortlist of roles, employers, and entry points worth actually pursuing",
                "A personalized roadmap with milestones, applications, and people to meet",
                "Direct, candid feedback on the tradeoffs of each track",
              ].map((i) => (
                <li key={i} className="flex gap-3 text-sm text-navy-deep/85">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Resume Review */}
      <section id="resume-review" className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
              Service 02 · $25
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Expert Resume Review
            </h2>
            <p className="mt-5 text-muted-foreground">
              A line-by-line review by an expert who knows what hiring managers and applicant
              tracking systems are actually looking for. Tailored to the role you're targeting,
              with the essential keywords your resume needs to get a second look.
            </p>
            <Link
              to="/resume-review"
              className="mt-8 inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Get started — $25
            </Link>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              How it works
            </div>
            <ol className="mt-5 space-y-5">
              {[
                ["01", "Submit", "Sign in, upload your resume, and tell us the role you're targeting."],
                ["02", "Pay $25", "Secure checkout. You'll only be charged for the review itself."],
                ["03", "Expert review", "A coach with direct hiring-side experience rewrites your resume line by line for ATS keywords, structure, and impact."],
                ["04", "Returned in 3–5 days", "You get the marked-up version, a clean revised draft, and notes on what to keep doing."],
              ].map(([n, t, d]) => (
                <li key={n} className="grid grid-cols-[auto,1fr] gap-5 border-b border-border pb-5 last:border-0">
                  <div className="font-display text-lg italic text-emerald">{n}.</div>
                  <div>
                    <div className="font-display text-base text-navy-deep">{t}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-deep text-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                Not sure where to start?
              </div>
              <h2 className="mt-4 font-display text-2xl text-paper lg:text-3xl">
                Most clients start with the $25 resume review and move to coaching from there.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link to="/resume-review" className="bg-paper px-5 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-paper/90">
                Start the $25 review
              </Link>
              <Link to="/contact" className="border border-paper/40 px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-paper/10">
                Book a coaching intake
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
