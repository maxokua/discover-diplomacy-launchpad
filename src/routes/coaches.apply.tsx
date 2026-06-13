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
          "Apply to coach with Discover Diplomacy. Share your background, availability, and how you want to help the next generation of foreign policy leaders.",
      },
      { property: "og:title", content: "Apply to Coach | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Apply to coach. Tell us about your experience, capacity, and approach so we can match you with the right clients.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/coaches/apply" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/coaches/apply" },
    ],
  }),
  component: CoachApplyPage,
});

const AREAS = [
  "U.S. Foreign Service",
  "Multilateral / UN",
  "Capitol Hill",
  "Think tanks",
  "International development",
  "Graduate admissions",
  "Fellowships",
  "Private sector (intl. business)",
  "Intelligence community",
];

const CLIENT_LEVELS = [
  "High school",
  "Undergraduate",
  "Recent graduate",
  "Graduate student",
  "Early career",
  "Mid-career switcher",
];

const schema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  timezone: z.string().trim().max(100).optional().or(z.literal("")),
  linkedin_url: z.string().trim().max(500).optional().or(z.literal("")),
  current_position: z.string().trim().max(300).optional().or(z.literal("")),
  years_experience: z.number().int().min(0).max(60).optional(),
  clients_capacity: z.number().int().min(1).max(50).optional(),
  hours_per_week: z.number().int().min(1).max(80).optional(),
  availability: z.string().trim().max(500).optional().or(z.literal("")),
  education: z.string().trim().max(1000).optional().or(z.literal("")),
  notable_experience: z.string().trim().max(2000).optional().or(z.literal("")),
  coaching_experience: z.string().trim().max(2000).optional().or(z.literal("")),
  approach: z.string().trim().max(2000).optional().or(z.literal("")),
  start_date: z.string().trim().max(100).optional().or(z.literal("")),
  referral_source: z.string().trim().max(300).optional().or(z.literal("")),
  compensation_expectations: z.string().trim().max(500).optional().or(z.literal("")),
  conflicts_disclosure: z.string().trim().max(1000).optional().or(z.literal("")),
  motivation: z.string().trim().min(20, "Please share a bit more").max(5000),
  agree_background_check: z.boolean(),
  agree_terms: z.literal(true, { message: "You must agree to proceed" }),
});

function CoachApplyPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    timezone: "",
    linkedin_url: "",
    current_position: "",
    years_experience: "",
    clients_capacity: "",
    hours_per_week: "",
    availability: "",
    education: "",
    notable_experience: "",
    coaching_experience: "",
    approach: "",
    start_date: "",
    referral_source: "",
    compensation_expectations: "",
    conflicts_disclosure: "",
    motivation: "",
    languages: "",
  });
  const [areas, setAreas] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [agreeBg, setAgreeBg] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, a: string) {
    setList(list.includes(a) ? list.filter((x) => x !== a) : [...list, a]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = schema.parse({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        timezone: form.timezone,
        linkedin_url: form.linkedin_url,
        current_position: form.current_position,
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
        clients_capacity: form.clients_capacity ? Number(form.clients_capacity) : undefined,
        hours_per_week: form.hours_per_week ? Number(form.hours_per_week) : undefined,
        availability: form.availability,
        education: form.education,
        notable_experience: form.notable_experience,
        coaching_experience: form.coaching_experience,
        approach: form.approach,
        start_date: form.start_date,
        referral_source: form.referral_source,
        compensation_expectations: form.compensation_expectations,
        conflicts_disclosure: form.conflicts_disclosure,
        motivation: form.motivation,
        agree_background_check: agreeBg,
        agree_terms: agreeTerms,
      });

      let resumePath: string | null = null;
      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error("Resume must be under 10MB");
        const ALLOWED_MIME = new Set([
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]);
        const ALLOWED_EXT = new Set(["pdf", "doc", "docx"]);
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.type)) {
          throw new Error("Resume must be a PDF, DOC, or DOCX file");
        }
        resumePath = `applications/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("coach-resumes")
          .upload(resumePath, file, { contentType: "application/octet-stream" });
        if (upErr) throw upErr;
      }

      const languages = form.languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.from("coach_applications").insert({
        full_name: parsed.full_name,
        email: parsed.email,
        phone: parsed.phone || null,
        location: parsed.location || null,
        timezone: parsed.timezone || null,
        linkedin_url: parsed.linkedin_url || null,
        current_position: parsed.current_position || null,
        years_experience: parsed.years_experience ?? null,
        clients_capacity: parsed.clients_capacity ?? null,
        hours_per_week: parsed.hours_per_week ?? null,
        availability: parsed.availability || null,
        preferred_client_levels: levels,
        languages,
        education: parsed.education || null,
        notable_experience: parsed.notable_experience || null,
        coaching_experience: parsed.coaching_experience || null,
        approach: parsed.approach || null,
        start_date: parsed.start_date || null,
        referral_source: parsed.referral_source || null,
        compensation_expectations: parsed.compensation_expectations || null,
        conflicts_disclosure: parsed.conflicts_disclosure || null,
        areas_of_expertise: areas,
        motivation: parsed.motivation,
        resume_path: resumePath,
        agree_background_check: agreeBg,
        agree_terms: agreeTerms,
      });
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
            <p className="mt-5 max-w-2xl text-base text-muted-foreground">
              The more you tell us, the better we can match you with clients. Most coaches finish this in about 10 minutes. We read every submission ourselves.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="mt-8 font-display text-3xl text-navy-deep">Application received.</h2>
              <p className="mt-3 text-base text-muted-foreground">
                Thanks for putting this together. We will review it and follow up by email.
              </p>
              <Link
                to="/coaches"
                className="mt-8 inline-block border border-border bg-paper px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
              >
                Back to coaches
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-14">
              <Section title="Basics" subtitle="Who you are and how to reach you.">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Full name" required>
                    <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Email" required>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Phone">
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="LinkedIn URL">
                    <input type="url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/…" />
                  </Field>
                  <Field label="Location (city, country)">
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Time zone">
                    <input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className={inputCls} placeholder="e.g. ET, GMT+1" />
                  </Field>
                </div>
              </Section>

              <Section title="Background" subtitle="Your professional story so far.">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Current role / affiliation">
                    <input value={form.current_position} onChange={(e) => setForm({ ...form, current_position: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Years of experience">
                    <input type="number" min={0} max={60} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} className={inputCls} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Education (degrees, institutions)">
                      <textarea rows={2} value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Notable roles, postings, or projects">
                      <textarea rows={3} value={form.notable_experience} onChange={(e) => setForm({ ...form, notable_experience: e.target.value })} className={inputCls} placeholder="Embassies, agencies, fellowships, publications, etc." />
                    </Field>
                  </div>
                  <Field label="Languages (comma separated)">
                    <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className={inputCls} placeholder="English, French, Arabic" />
                  </Field>
                  <Field label="Resume (PDF/DOCX, max 10MB)">
                    <input type="file" accept=".pdf,.doc,.docx,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={inputCls + " file:mr-4 file:border-0 file:bg-stone file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider file:text-navy-deep"} />
                  </Field>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                    Areas of expertise
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {AREAS.map((a) => (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggle(areas, setAreas, a)}
                        className={chipCls(areas.includes(a))}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="Capacity" subtitle="How much time you actually have.">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="How many clients would you like to take on?" required>
                    <input required type="number" min={1} max={50} value={form.clients_capacity} onChange={(e) => setForm({ ...form, clients_capacity: e.target.value })} className={inputCls} placeholder="e.g. 3" />
                  </Field>
                  <Field label="Hours per week you can commit" required>
                    <input required type="number" min={1} max={80} value={form.hours_per_week} onChange={(e) => setForm({ ...form, hours_per_week: e.target.value })} className={inputCls} placeholder="e.g. 5" />
                  </Field>
                  <Field label="When could you start?">
                    <input value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputCls} placeholder="e.g. immediately, next month" />
                  </Field>
                  <Field label="Compensation expectations (optional)">
                    <input value={form.compensation_expectations} onChange={(e) => setForm({ ...form, compensation_expectations: e.target.value })} className={inputCls} placeholder="Per session or per client" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="General weekly availability">
                      <textarea rows={2} value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputCls} placeholder="e.g. weekday evenings ET, weekend mornings" />
                    </Field>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                    Client levels you would coach
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CLIENT_LEVELS.map((a) => (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggle(levels, setLevels, a)}
                        className={chipCls(levels.includes(a))}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="Coaching approach" subtitle="How you work with people.">
                <div className="space-y-6">
                  <Field label="Have you coached, mentored, or taught before? Tell us about it.">
                    <textarea rows={4} value={form.coaching_experience} onChange={(e) => setForm({ ...form, coaching_experience: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="How would you describe your coaching style?">
                    <textarea rows={4} value={form.approach} onChange={(e) => setForm({ ...form, approach: e.target.value })} className={inputCls} placeholder="Direct, Socratic, structured frameworks, etc." />
                  </Field>
                  <Field label="Why do you want to coach with us?" required>
                    <textarea required rows={5} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              </Section>

              <Section title="A few last things">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="How did you hear about us?">
                    <input value={form.referral_source} onChange={(e) => setForm({ ...form, referral_source: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Any conflicts of interest we should know about?">
                    <input value={form.conflicts_disclosure} onChange={(e) => setForm({ ...form, conflicts_disclosure: e.target.value })} className={inputCls} placeholder="Optional" />
                  </Field>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="flex items-start gap-3 text-sm text-navy-deep">
                    <input type="checkbox" checked={agreeBg} onChange={(e) => setAgreeBg(e.target.checked)} className="mt-1" />
                    <span>I am open to a background check if we move forward.</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm text-navy-deep">
                    <input type="checkbox" required checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1" />
                    <span>
                      I confirm the information above is accurate and I have read the{" "}
                      <Link to="/privacy" className="underline">privacy policy</Link> and{" "}
                      <Link to="/terms" className="underline">terms</Link>.
                    </span>
                  </label>
                </div>
              </Section>

              <div className="border-t border-border pt-8">
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-navy-deep px-8 py-4 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Submit application"}
                </button>
                <p className="mt-4 text-xs text-muted-foreground">
                  We read every application ourselves.
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
        {label} {required && <span className="text-emerald">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-border pb-4">
        <h2 className="font-display text-2xl text-navy-deep">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
