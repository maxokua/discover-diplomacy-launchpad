import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/coaches")({
  head: () => ({
    meta: [
      { title: "Coach with Discover Diplomacy" },
      {
        name: "description",
        content:
          "Apply to coach with Discover Diplomacy. Market-leading pay per client, flexible scheduling, mission-driven work.",
      },
      { property: "og:title", content: "Coach with Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Apply to coach. Market-leading pay per client, flexible scheduling, mission-driven work.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/coaches" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/coaches" },
    ],
  }),
  component: CoachesPage,
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

const schema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  linkedin_url: z.string().trim().max(500).optional().or(z.literal("")),
  current_position: z.string().trim().max(300).optional().or(z.literal("")),
  years_experience: z.number().int().min(0).max(60).optional(),
  motivation: z.string().trim().min(20, "Please share a bit more").max(5000),
});

function CoachesPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    linkedin_url: "",
    current_position: "",
    years_experience: "",
    motivation: "",
  });
  const [areas, setAreas] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleArea(a: string) {
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = schema.parse({
        full_name: form.full_name,
        email: form.email,
        linkedin_url: form.linkedin_url,
        current_position: form.current_position,
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
        motivation: form.motivation,
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

      const { error } = await supabase.from("coach_applications").insert({
        full_name: parsed.full_name,
        email: parsed.email,
        linkedin_url: parsed.linkedin_url || null,
        current_position: parsed.current_position || null,
        years_experience: parsed.years_experience ?? null,
        areas_of_expertise: areas,
        motivation: parsed.motivation,
        resume_path: resumePath,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Application submitted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">Coach With Us</div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              Help the next generation break into international affairs, and get paid at the top of the market.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Discover Diplomacy pays coaches a market-leading rate per client. If you've built a
              career in foreign policy, international business, or multilateral institutions, we
              want to hear from you.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">Why Coach With Us</div>
          </Reveal>
          <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Top-of-market pay", d: "We pay coaches a market-leading rate per client. No platform fees skimmed off the top." },
              { t: "Flexible", d: "Coach as many or as few clients as your schedule allows. Fully remote." },
              { t: "Motivated clients", d: "Our clients self-select, they're serious, prepared, and globally minded." },
              { t: "Mission-driven", d: "Open the field for people who couldn't otherwise navigate it on their own." },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 60}>
                <div className="h-full bg-paper p-8">
                  <h3 className="font-display text-lg text-navy-deep">{v.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="mt-8 font-display text-3xl text-navy-deep">Application received.</h2>
              <p className="mt-3 text-base text-muted-foreground">
                We'll review your application and follow up by email.
              </p>

            </div>
          ) : (
            <>
              <Reveal>
                <div className="eyebrow">Apply</div>
                <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
                  Coach application
                </h2>
              </Reveal>
              <form onSubmit={handleSubmit} className="mt-10 grid gap-6 md:grid-cols-2">
                <Field label="Full name" required>
                  <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Email" required>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                </Field>
                <Field label="LinkedIn URL">
                  <input type="url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/…" />
                </Field>
                <Field label="Current role / affiliation">
                  <input value={form.current_position} onChange={(e) => setForm({ ...form, current_position: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Years of experience">
                  <input type="number" min={0} max={60} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Resume (PDF/DOCX, max 10MB)">
                  <input type="file" accept=".pdf,.doc,.docx,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={inputCls + " file:mr-4 file:border-0 file:bg-stone file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider file:text-navy-deep"} />
                </Field>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                    Areas of expertise
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {AREAS.map((a) => (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggleArea(a)}
                        className={
                          "border px-3 py-2 text-xs transition-colors " +
                          (areas.includes(a)
                            ? "border-navy-deep bg-navy-deep text-paper"
                            : "border-border bg-paper text-navy-deep hover:bg-stone")
                        }
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Field label="Why do you want to coach with us?" required>
                    <textarea
                      required
                      rows={6}
                      value={form.motivation}
                      onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
                  >
                    {busy ? "Submitting…" : "Submit application"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

const inputCls =
  "mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep";

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
