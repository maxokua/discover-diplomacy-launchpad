import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Users, BarChart3, MessageSquare, Download, GraduationCap } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { submitUniversityLead } from "@/lib/universities.functions";

export const Route = createFileRoute("/universities")({
  head: () => ({
    meta: [
      { title: "For Universities | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Career support for international relations programs. Bulk Compass memberships at $20/student/mo, coaching network, quarterly outcomes reports. Minimum 50 students.",
      },
      {
        property: "og:title",
        content: "Career support for international studies programs",
      },
      {
        property: "og:description",
        content:
          "Discover Diplomacy partners with IR, international affairs, and global studies programs. $20/student/mo. Coaching, job board, community, placement reporting.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/universities" },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/universities" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Discover Diplomacy for Universities",
          description:
            "Bulk Compass memberships for international relations programs. Career coaching, job board, community, and quarterly placement reporting.",
          provider: { "@type": "Organization", name: "Discover Diplomacy" },
          areaServed: "Worldwide",
          offers: {
            "@type": "Offer",
            price: "20",
            priceCurrency: "USD",
            description: "$20 per student per month, minimum 50 students",
          },
        }),
      },
    ],
  }),
  component: UniversitiesPage,
});

const FAQ = [
  {
    q: "How much does this cost?",
    a: "$20 per student per month. Minimum 50 students. Annual commitment. We're flexible if you want to try a semester first.",
  },
  {
    q: "What if students don't use it?",
    a: "We handle onboarding and send monthly engagement reminders. Most cohorts see 60–70% active usage. If fewer than 40% are active after 3 months, we'll work with you on a discount or adjustment.",
  },
  {
    q: "Can we bundle this with other Discover Diplomacy offerings?",
    a: "Yes. Universities can also offer Envoy (recurring 1:1 coaching) to graduate students or specialized tracks. We can set up discounted add-ons.",
  },
  {
    q: "What if a student drops out or graduates?",
    a: "You update your roster quarterly. We activate new students, remove graduated ones. Billing adjusts accordingly.",
  },
  {
    q: "Do we get data on where students are hired?",
    a: "Yes. Quarterly reports include: number of students who got interviews, number hired, average salary range (if students share), top employers, and time-to-hire. Individual data is anonymized unless you request otherwise.",
  },
  {
    q: "Can students keep the membership after graduation?",
    a: "Yes, at the standard Compass rate ($20/mo). This keeps alumni engaged and creates an easy continuity for them.",
  },
];

function UniversitiesPage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">For Universities</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Career support for international studies programs.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Give your students the tools to break into international affairs. We handle the
              placement coaching, the job board, and the outcomes reporting — your career office
              doesn't have to hire a specialist.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#demo"
                className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
              >
                Schedule a demo
              </a>
              <a
                href="/universities-onepager.pdf"
                className="inline-flex items-center gap-2 border border-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-navy-deep hover:text-paper"
              >
                <Download className="h-3.5 w-3.5" /> Download one-pager
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="eyebrow">The Gap</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Your IR program is strong. But career advising is stretched thin.
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <ul className="space-y-5">
              {[
                "IR majors graduate unsure how to translate their degree into a job.",
                "Career offices rarely have expertise in international affairs placement.",
                "Students apply with generic resumes — no sector-specific tailoring.",
                "You have little visibility into placement outcomes, so you can't tell the story to accreditors or donors.",
              ].map((item) => (
                <li key={item} className="flex gap-4 border-b border-border pb-5 last:border-0">
                  <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-emerald" />
                  <p className="text-base text-navy-deep/85">{item}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">The Partnership</div>
            <h2 className="mt-4 max-w-3xl font-display text-3xl text-navy-deep lg:text-4xl">
              Three ways Discover Diplomacy supports your program.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Career coaching, without hiring",
                body: "Your students get a vetted network of international affairs professionals. They book 30-minute sessions on demand, run mock interviews, or work with coaches on negotiation. You hire no one. We handle it.",
              },
              {
                icon: BarChart3,
                title: "Track placement outcomes",
                body: "Quarterly, we report: interviews booked, students hired, average time-to-hire, top employers. Use the data for rankings, accreditation, and program improvement.",
              },
              {
                icon: MessageSquare,
                title: "A community built for them",
                body: "Your students join a private community with IR peers from other universities. They share job intel, peer-coach, and celebrate wins. Engagement keeps them on the platform all four years.",
              },
            ].map((c) => (
              <Reveal key={c.title}>
                <div className="h-full bg-paper p-8">
                  <c.icon className="h-6 w-6 text-emerald" />
                  <h3 className="mt-4 font-display text-lg text-navy-deep">{c.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">Activation</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Three steps to activate your program.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Choose your model",
                d: "Tell us your program size and how you want to fund it. Direct — your career office pays the subscription. Student-cost — students pay $20/mo billed to the university with zero friction for the student. Either way, students get access immediately.",
              },
              {
                n: "02",
                t: "We onboard your cohort",
                d: "Send us a roster of IR majors. We create accounts, send a welcome email under your program's name, and walk students through the platform. Takes 1–2 weeks.",
              },
              {
                n: "03",
                t: "You track outcomes",
                d: "Each quarter we send you a report: engagement metrics, placement outcomes, student feedback. You get the data to demonstrate career support to accreditors and donors.",
              },
            ].map((s) => (
              <Reveal key={s.n}>
                <div className="border border-border bg-paper p-8">
                  <div className="font-display text-3xl italic text-emerald">{s.n}.</div>
                  <h3 className="mt-3 font-display text-lg text-navy-deep">{s.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="text-center">
              <div className="eyebrow">Pricing</div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
                Simple, scalable pricing.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-12 border-2 border-emerald bg-paper p-8 lg:p-12">
              <div className="grid gap-10 lg:grid-cols-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                    Per student, per month
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-6xl text-navy-deep">$20</span>
                    <span className="text-base text-muted-foreground">/student/mo</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Minimum 50 students per cohort. Annual commitment, with semester options
                    available. We work with your budget cycle.
                  </p>
                  <div className="mt-8 border-t border-border pt-6 text-sm text-navy-deep/85">
                    <div className="font-display text-base text-navy-deep">Volume snapshot</div>
                    <ul className="mt-3 space-y-2">
                      <li>50 students — $1,000/mo · $12K/year</li>
                      <li>100 students — $2,000/mo · $24K/year</li>
                      <li>200 students — $4,000/mo · $48K/year</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="font-display text-base text-navy-deep">What's included</div>
                  <ul className="mt-5 space-y-3 text-sm text-navy-deep/85">
                    {[
                      "Compass membership for every student (resume help, job board, community)",
                      "Coach directory access — students can book 1:1 sessions",
                      "Weekly opportunity digest tailored to early-career international roles",
                      "Custom onboarding for your cohort",
                      "Quarterly outcomes reporting",
                      "Program admin portal — track cohort engagement in real time",
                    ].map((i) => (
                      <li key={i} className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SUCCESS STORIES placeholder */}
      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-10 lg:py-20">
          <Reveal>
            <div className="eyebrow">Partners</div>
            <h2 className="mt-4 font-display text-2xl text-navy-deep lg:text-3xl">
              Universities partnering with us
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              We're onboarding our first cohort partners now. Logos and case studies coming soon.
              Want to be one of the first? Schedule a demo below.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <GraduationCap className="h-5 w-5" />
              <span>Typical program size — 50 to 200 students per cohort</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Common questions
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <Accordion type="single" collapsible className="mt-10 border-t border-border">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`q-${i}`} className="border-b border-border">
                  <AccordionTrigger className="py-5 text-left font-display text-base text-navy-deep hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* DEMO REQUEST FORM */}
      <section id="demo" className="border-b border-border bg-stone">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">Schedule a Demo</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Tell us about your program.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              We'll get back to you within 48 hours to discuss program size, funding model, and
              setup. Questions in the meantime? Email{" "}
              <a
                href="mailto:hello@discoverdiplomacy.org"
                className="font-medium text-navy-deep underline-offset-4 hover:underline"
              >
                hello@discoverdiplomacy.org
              </a>
              .
            </p>
          </Reveal>
          <Reveal delay={120}>
            <DemoForm />
          </Reveal>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="bg-navy-deep text-paper">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-10">
          <p className="font-display text-xl lg:text-2xl">
            "Career outcomes are the new accreditation."
          </p>
          <p className="mt-4 text-sm text-paper/60">
            Help your program show up where it counts.{" "}
            <Link
              to="/contact"
              className="underline-offset-4 hover:text-paper hover:underline"
            >
              Talk to us
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

// ─── Demo form ──────────────────────────────────────────────────────────────

const formSchema = z.object({
  university_name: z.string().trim().min(2, "Required").max(200),
  contact_name: z.string().trim().min(2, "Required").max(100),
  contact_email: z.string().trim().email("Valid email required").max(254),
  contact_title: z.string().trim().max(120).optional(),
  department: z.string().trim().min(2, "Required").max(120),
  est_students: z.coerce.number().int().min(1, "Required").max(100000),
  funding_model: z.enum(["direct", "student_cost", "hybrid", "undecided"]),
  start_date_pref: z.string().trim().max(80).optional(),
  budget_cycle: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(4000).optional(),
});

function DemoForm() {
  const submit = useServerFn(submitUniversityLead);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const raw = Object.fromEntries(fd.entries());
      const parsed = formSchema.parse(raw);
      const res = await submit({ data: parsed });
      if (res && "error" in res) throw new Error(res.error);
      setDone(true);
      toast.success("Got it. We'll be in touch within 48 hours.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-10 border border-emerald bg-paper p-10 text-center">
        <div className="eyebrow text-emerald">Received</div>
        <h3 className="mt-3 font-display text-2xl text-navy-deep">Thanks — we're on it.</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          We'll be in touch within 48 hours to schedule a kickoff call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-5 border border-border bg-paper p-8">
      <Field label="University name" name="university_name" required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your name" name="contact_name" required />
        <Field label="Title" name="contact_title" placeholder="Director, Program Chair, etc." />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Email" name="contact_email" type="email" required />
        <Field
          label="Department / Program"
          name="department"
          required
          placeholder="International Relations, Global Studies, etc."
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Estimated # of students"
          name="est_students"
          type="number"
          required
          placeholder="50"
        />
        <Select
          label="Funding model"
          name="funding_model"
          required
          options={[
            { v: "direct", l: "Direct (university pays)" },
            { v: "student_cost", l: "Student-cost (billed to university)" },
            { v: "hybrid", l: "Hybrid (let's discuss)" },
            { v: "undecided", l: "Undecided" },
          ]}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Preferred start"
          name="start_date_pref"
          placeholder="Next semester, next fall, ASAP…"
        />
        <Field label="Budget cycle" name="budget_cycle" placeholder="July–June, Sept–Aug…" />
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
          Anything else?
        </label>
        <textarea
          name="notes"
          rows={4}
          maxLength={4000}
          className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep outline-none focus:border-navy-deep"
          placeholder="Goals, constraints, who else on your team should be looped in…"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-2 inline-flex items-center justify-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
      >
        {busy ? "Sending…" : "Request a demo"}
      </button>
      <p className="text-xs text-muted-foreground">
        By submitting, you agree we may contact you about this inquiry. We don't share your data.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
        {label}
        {required && <span className="ml-1 text-emerald">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep outline-none focus:border-navy-deep"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: { v: string; l: string }[];
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
        {label}
        {required && <span className="ml-1 text-emerald">*</span>}
      </label>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep outline-none focus:border-navy-deep"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}
