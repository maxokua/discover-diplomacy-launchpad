import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/coaches/apply")({
  head: () => ({
    meta: [
      { title: "Apply to Coach | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Apply to coach with Discover Diplomacy. We vet for expertise, generosity, and alignment with our mission.",
      },
      { property: "og:title", content: "Apply to Coach | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Apply to coach with Discover Diplomacy. We vet for expertise, generosity, and alignment with our mission.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/coaches/apply" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/coaches/apply" },
    ],
  }),
  component: CoachApplyPage,
});

const EXPERTISE = [
  "International affairs & diplomacy (bilateral, multilateral, government)",
  "International business & global development",
  "International economics, finance, or trade",
  "Human rights, humanitarian aid, or international development",
  "International law, global policy, or area studies",
  "Global nonprofit or NGO leadership",
  "International education or exchange",
];

const YEARS = ["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16+ years"];

const schema = z.object({
  full_name: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().email("Valid email required").max(320),
  linkedin_url: z.string().trim().max(500).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  q1_current_role: z.string().trim().min(20, "Please share a bit more").max(3000),
  expertise_other: z.string().trim().max(300).optional().or(z.literal("")),
  q2_accomplishments: z.string().trim().min(20).max(3000),
  q3_break_in: z.string().trim().min(20).max(3000),
  outside_experience: z.string().trim().max(2000).optional().or(z.literal("")),
  q5_focus: z.string().trim().min(5).max(1000),
  q6_coaching_examples: z.string().trim().min(20).max(3000),
  q7_why_advice: z.string().trim().min(10).max(2000),
  q8_philosophy: z.string().trim().min(20).max(2000),
  q9_disagreement: z.string().trim().min(10).max(2000),
  q10_non_negotiables: z.string().trim().min(10).max(2000),
  q11_why_dd: z.string().trim().min(20).max(2000),
  q12_what_youd_want: z.string().trim().min(10).max(2000),
  q13_trust_wall: z.string().trim().min(10).max(2000),
  q14_wish_known: z.string().trim().min(10).max(2000),
  q15_references: z.string().trim().min(10).max(3000),
  video1_url: z.string().trim().url("Valid URL required").max(500).optional().or(z.literal("")),
  video2_url: z.string().trim().url("Valid URL required").max(500).optional().or(z.literal("")),
  agree_terms: z.literal(true, { message: "You must agree to proceed" }),
});

function CoachApplyPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    linkedin_url: "",
    location: "",
    q1_current_role: "",
    expertise_other: "",
    q2_accomplishments: "",
    q3_break_in: "",
    outside_experience: "",
    q5_focus: "",
    q6_coaching_examples: "",
    q7_why_advice: "",
    q8_philosophy: "",
    q9_disagreement: "",
    q10_non_negotiables: "",
    q11_why_dd: "",
    q12_what_youd_want: "",
    q13_trust_wall: "",
    q14_wish_known: "",
    q15_references: "",
    video1_url: "",
    video2_url: "",
  });
  const [expertise, setExpertise] = useState<string[]>([]);
  const [years, setYears] = useState<string>("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, a: string) {
    setList(list.includes(a) ? list.filter((x) => x !== a) : [...list, a]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = schema.parse({ ...form, agree_terms: agreeTerms });

      const yearsToNumber: Record<string, number> = {
        "0–2 years": 1,
        "3–5 years": 4,
        "6–10 years": 8,
        "11–15 years": 13,
        "16+ years": 16,
      };

      const allExpertise = [
        ...expertise,
        ...(parsed.expertise_other ? [`Other: ${parsed.expertise_other}`] : []),
      ];

      const responses = {
        q1_current_role: parsed.q1_current_role,
        q2_accomplishments: parsed.q2_accomplishments,
        q3_break_in: parsed.q3_break_in,
        years_bucket: years || null,
        outside_experience: parsed.outside_experience || null,
        q5_focus: parsed.q5_focus,
        q6_coaching_examples: parsed.q6_coaching_examples,
        q7_why_advice: parsed.q7_why_advice,
        q8_philosophy: parsed.q8_philosophy,
        q9_disagreement: parsed.q9_disagreement,
        q10_non_negotiables: parsed.q10_non_negotiables,
        q11_why_dd: parsed.q11_why_dd,
        q12_what_youd_want: parsed.q12_what_youd_want,
        q13_trust_wall: parsed.q13_trust_wall,
        q14_wish_known: parsed.q14_wish_known,
      };

      const { error } = await supabase.from("coach_applications").insert({
        full_name: parsed.full_name,
        email: parsed.email,
        linkedin_url: parsed.linkedin_url || null,
        location: parsed.location || null,
        current_position: parsed.q1_current_role.slice(0, 300),
        years_experience: years ? yearsToNumber[years] : null,
        areas_of_expertise: allExpertise,
        notable_experience: parsed.q2_accomplishments,
        coaching_experience: parsed.q6_coaching_examples,
        approach: parsed.q8_philosophy,
        motivation: parsed.q11_why_dd,
        responses,
        references_text: parsed.q15_references,
        video1_url: parsed.video1_url || null,
        video2_url: parsed.video2_url || null,
        agree_terms: agreeTerms,
      } as any);
      if (error) throw error;
      setSubmitted(true);
      toast.success("Application submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg =
        err instanceof z.ZodError
          ? err.issues[0]?.message ?? "Please check the form"
          : err instanceof Error
            ? err.message
            : "Submission failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <div className="eyebrow">
              <Link to="/coaches" className="hover:text-navy-deep">Coaches</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span>Apply</span>
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-4xl text-navy-deep lg:text-5xl">
              Coach application
            </h1>
            <p className="mt-5 max-w-3xl text-base text-muted-foreground">
              Discover Diplomacy is building a network of vetted insiders who help early-career professionals navigate internationally-focused careers. We're selective about coaches for one reason: the trust is real. People book time with coaches because they trust that person has walked the path and earned the right to guide others.
            </p>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground">
              This application vets for expertise, generosity, and alignment with our mission. Answer thoughtfully. There are no "correct" answers — we're looking for authenticity and clarity.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-20">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="mt-8 font-display text-3xl text-navy-deep">Application received.</h2>
              <p className="mt-3 text-base text-muted-foreground">
                Thanks for putting this together. We review on a rolling basis. If we move forward, we'll ask for 1–2 references and schedule a 20-minute conversation. If not selected, you'll hear from us within 30 days.
              </p>
              <Link
                to="/coaches"
                className="mt-8 inline-block border border-border bg-paper px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
              >
                Back to coaches
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-16">
              <Section title="Basics">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Full name" required>
                    <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Email" required>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="LinkedIn URL">
                    <input type="url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/…" />
                  </Field>
                  <Field label="Location (city, country)">
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              </Section>

              <Section title="Section 1 — Your background & expertise">
                <LongField
                  num="1"
                  label="In three sentences, describe your current or most recent role and why you left it (or why you're still there)."
                  hint="We want to understand your career arc and what drew you to this work. This helps us position you accurately to candidates."
                  rows={4}
                  value={form.q1_current_role}
                  onChange={(v) => setForm({ ...form, q1_current_role: v })}
                  required
                />

                <div className="mt-10">
                  <NumLabel num="2" text="What field would you describe your expertise in?" />
                  <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {EXPERTISE.map((a) => (
                      <button key={a} type="button" onClick={() => toggle(expertise, setExpertise, a)} className={chipCls(expertise.includes(a))}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Field label="Other (please specify)">
                      <input value={form.expertise_other} onChange={(e) => setForm({ ...form, expertise_other: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <div className="mt-6">
                    <Field label="Describe 1–2 concrete accomplishments or projects in this space that prepared you to coach others in it." required>
                      <textarea required rows={4} value={form.q2_accomplishments} onChange={(e) => setForm({ ...form, q2_accomplishments: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                </div>

                <LongField
                  num="3"
                  label="How did you break into your field?"
                  hint="Walk us through your entry point — the fellowship, the job, the connection, the mentor. This story helps candidates see a path, and it shows us whether your advice is rooted in real experience."
                  rows={5}
                  value={form.q3_break_in}
                  onChange={(v) => setForm({ ...form, q3_break_in: v })}
                  required
                />

                <div className="mt-10">
                  <NumLabel num="4" text="How many years have you worked in internationally-focused roles?" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {YEARS.map((y) => (
                      <button key={y} type="button" onClick={() => setYears(y)} className={chipCls(years === y)}>
                        {y}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Field label="If you've had a career outside international work, describe that too. We value diverse paths.">
                      <textarea rows={3} value={form.outside_experience} onChange={(e) => setForm({ ...form, outside_experience: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                </div>

                <LongField
                  num="5"
                  label="Geographic or thematic focus?"
                  hint='What region(s), organization types, or specialties do you know best? (E.g., "West Africa, emerging market finance"; "UN system, conflict resolution"; "Latin America NGO management")'
                  rows={3}
                  value={form.q5_focus}
                  onChange={(v) => setForm({ ...form, q5_focus: v })}
                  required
                />
              </Section>

              <Section title="Section 2 — Coaching experience & philosophy">
                <LongField num="6" label="Have you coached, mentored, or helped junior professionals before this?"
                  hint='Describe 2–3 examples. What was the context, how long did you work with them, and what was the outcome? (E.g., "helped my direct report prep for a Foreign Service exam," "mentored a fellowship cohort on proposal writing," "advised a friend on a career pivot.")'
                  rows={5} value={form.q6_coaching_examples} onChange={(v) => setForm({ ...form, q6_coaching_examples: v })} required />

                <LongField num="7" label="Why do people ask you for advice?"
                  hint="Be honest. Are you the person they call before a big interview? The one who knows the system? The person who's been through it? The connective type?"
                  rows={4} value={form.q7_why_advice} onChange={(v) => setForm({ ...form, q7_why_advice: v })} required />

                <LongField num="8" label="What's your coaching philosophy?"
                  hint="In 3–4 sentences: What do you believe makes mentoring effective? Do you coach by asking questions, by sharing war stories, by making introductions, by being a sounding board, or something else?"
                  rows={4} value={form.q8_philosophy} onChange={(v) => setForm({ ...form, q8_philosophy: v })} required />

                <LongField num="9" label="How do you handle disagreement or feedback?"
                  hint={`If someone pushed back on your advice or said "that didn't work for me," how would you respond? This tells us if you're coachable and collaborative.`}
                  rows={4} value={form.q9_disagreement} onChange={(v) => setForm({ ...form, q9_disagreement: v })} required />

                <LongField num="10" label="What are your non-negotiables as a coach?"
                  hint="Are there things you won't do (e.g., pull strings unfairly, oversell connections, misrepresent the field)? What matters to you ethically?"
                  rows={4} value={form.q10_non_negotiables} onChange={(v) => setForm({ ...form, q10_non_negotiables: v })} required />
              </Section>

              <Section title="Section 3 — Discover Diplomacy fit & mission">
                <LongField num="11" label="What draws you to Discover Diplomacy?"
                  hint="Have you used the platform? Do you know someone who has? What problem do you think we're solving? Why does it matter to you?"
                  rows={4} value={form.q11_why_dd} onChange={(v) => setForm({ ...form, q11_why_dd: v })} required />

                <LongField num="12" label="What kind of coaches would you want to learn from as a candidate?"
                  hint="If you were an early-career person navigating this field right now, what would you want from a mentor? This tells us what standard you'll hold yourself to."
                  rows={4} value={form.q12_what_youd_want} onChange={(v) => setForm({ ...form, q12_what_youd_want: v })} required />

                <LongField num="13" label={`How would you describe "the trust wall"?`}
                  hint="We believe genuine referrals and vouches are earned, never for sale. Paid time is sold (coaching, review, expertise). Earned trust is not. How does this land for you? Do you agree? Would you be able to operate inside it?"
                  rows={4} value={form.q13_trust_wall} onChange={(v) => setForm({ ...form, q13_trust_wall: v })} required />

                <LongField num="14" label="What's one thing you wish you'd known earlier in your career?"
                  hint="This reveals what you'd most want to pass on. Real answer matters here."
                  rows={3} value={form.q14_wish_known} onChange={(v) => setForm({ ...form, q14_wish_known: v })} required />

                <LongField num="15" label="Network & community"
                  hint="Name 3–5 people (no pressure to list everyone) who could vouch for your work as a mentor or colleague. Include their role/organization and a sentence on how they know you. We may reach out — and we're explicit about this."
                  rows={5} value={form.q15_references} onChange={(v) => setForm({ ...form, q15_references: v })} required />
              </Section>

              <Section title="Section 4 — Video responses" subtitle="2–3 minutes each. Use your phone, Zoom, or any recorder. Be yourself — authenticity matters more than production quality. Paste a shareable link (Loom, Google Drive, Dropbox, YouTube unlisted), or email files to hello@discoverdiplomacy.org.">
                <div className="space-y-6">
                  <div>
                    <NumLabel num="V1" text="Why do you want to coach, and why should you coach?" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tell us why coaching appeals to you now, why you're the right person to do it (don't be modest), and what you hope coaching will do for you and the people you work with. We're listening for clarity, generosity, and realism.
                    </p>
                    <Field label="Video 1 link">
                      <input type="url" value={form.video1_url} onChange={(e) => setForm({ ...form, video1_url: e.target.value })} className={inputCls} placeholder="https://…" />
                    </Field>
                  </div>
                  <div>
                    <NumLabel num="V2" text="What is your vision for Discover Diplomacy, and how do you want to contribute to that mission?" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      How you see Discover Diplomacy evolving over the next 2–3 years, the role you'd play in that vision, what you'd build or change, and why this matters to you personally. We're listening for understanding of the trust-wall principle and a vision that's both ambitious and grounded.
                    </p>
                    <Field label="Video 2 link">
                      <input type="url" value={form.video2_url} onChange={(e) => setForm({ ...form, video2_url: e.target.value })} className={inputCls} placeholder="https://…" />
                    </Field>
                  </div>
                </div>
              </Section>

              <div className="border-t border-border pt-8">
                <label className="flex items-start gap-3 text-sm text-navy-deep">
                  <input type="checkbox" required checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1" />
                  <span>
                    I confirm the information above is accurate and I have read the{" "}
                    <Link to="/privacy" className="underline">privacy policy</Link> and{" "}
                    <Link to="/terms" className="underline">terms</Link>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-8 bg-navy-deep px-8 py-4 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Submit application"}
                </button>
                <p className="mt-4 text-xs text-muted-foreground">
                  We review on a rolling basis and read every application ourselves.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

const inputCls =
  "mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep";

function chipCls(active: boolean) {
  return (
    "border px-3 py-2 text-xs transition-colors " +
    (active
      ? "border-navy-deep bg-navy-deep text-paper"
      : "border-border bg-paper text-navy-deep hover:bg-stone")
  );
}

function NumLabel({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-display text-sm text-emerald">{num}.</span>
      <span className="text-sm font-medium text-navy-deep">{text}</span>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
        {label} {required && <span className="text-emerald">*</span>}
      </span>
      {children}
    </label>
  );
}

function LongField({
  num, label, hint, rows, value, onChange, required,
}: {
  num: string; label: string; hint?: string; rows: number;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="mt-10 first:mt-0">
      <NumLabel num={num} text={label} />
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-border pb-4">
        <h2 className="font-display text-2xl text-navy-deep">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
