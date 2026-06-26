import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Check, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/employers/apply")({
  head: () => ({
    meta: [
      { title: "Apply for Employer Access | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Apply to join Discover Diplomacy's verified employer network. We individually vet every employer before granting access to candidate resumes.",
      },
      { property: "og:title", content: "Apply for Employer Access | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Apply to join our verified employer network and access vetted candidates in international affairs.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/employers/apply" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/employers/apply" },
    ],
  }),
  component: EmployerApplyPage,
});

const ORG_TYPES = [
  "Government / Foreign Ministry",
  "Multilateral / IGO (UN, World Bank, etc.)",
  "NGO / Non-profit",
  "Think tank / Research",
  "Private sector — global firm",
  "Consulting / Advisory",
  "Media / Journalism",
  "Academia",
  "Other",
];

const TIMELINES = [
  "Hiring now",
  "Hiring within 3 months",
  "Hiring within 6 months",
  "Building a long-term pipeline",
];

const FreeEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

const schema = z.object({
  organization_name: z.string().trim().min(2).max(200),
  organization_website: z
    .string()
    .trim()
    .min(4)
    .max(300)
    .regex(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i, "Enter a valid website URL"),
  organization_type: z.string().min(1, "Select organization type"),
  hq_country: z.string().trim().min(2).max(100),
  contact_full_name: z.string().trim().min(2).max(120),
  contact_title: z.string().trim().min(2).max(120),
  contact_work_email: z
    .string()
    .trim()
    .email()
    .max(254)
    .refine((e) => {
      const domain = e.split("@")[1]?.toLowerCase();
      return domain ? !FreeEmailDomains.has(domain) : false;
    }, "Use your work email, not a personal address"),
  contact_phone: z.string().trim().max(40).optional().or(z.literal("")),
  contact_linkedin: z
    .string()
    .trim()
    .min(10)
    .max(300)
    .regex(/linkedin\.com\//i, "Provide your LinkedIn profile URL"),
  hiring_roles: z.string().trim().min(10).max(5000),
  target_hires: z.coerce.number().int().min(1).max(10000).optional(),
  hiring_timeline: z.string().min(1, "Select a timeline"),
  why_us: z.string().trim().min(10).max(5000),
  references_text: z.string().trim().max(3000).optional().or(z.literal("")),
  acknowledged_terms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

type FormState = {
  organization_name: string;
  organization_website: string;
  organization_type: string;
  hq_country: string;
  contact_full_name: string;
  contact_title: string;
  contact_work_email: string;
  contact_phone: string;
  contact_linkedin: string;
  hiring_roles: string;
  target_hires: string;
  hiring_timeline: string;
  why_us: string;
  references_text: string;
  acknowledged_terms: boolean;
};

const initial: FormState = {
  organization_name: "",
  organization_website: "",
  organization_type: "",
  hq_country: "",
  contact_full_name: "",
  contact_title: "",
  contact_work_email: "",
  contact_phone: "",
  contact_linkedin: "",
  hiring_roles: "",
  target_hires: "",
  hiring_timeline: "",
  why_us: "",
  references_text: "",
  acknowledged_terms: false,
};

function EmployerApplyPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse({
      ...form,
      target_hires: form.target_hires === "" ? undefined : form.target_hires,
      contact_phone: form.contact_phone || undefined,
      references_text: form.references_text || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (typeof k === "string" && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("employer_applications").insert({
      organization_name: parsed.data.organization_name,
      organization_website: parsed.data.organization_website,
      organization_type: parsed.data.organization_type,
      hq_country: parsed.data.hq_country,
      contact_full_name: parsed.data.contact_full_name,
      contact_title: parsed.data.contact_title,
      contact_work_email: parsed.data.contact_work_email,
      contact_phone: parsed.data.contact_phone ?? null,
      contact_linkedin: parsed.data.contact_linkedin,
      hiring_roles: parsed.data.hiring_roles,
      target_hires: parsed.data.target_hires ?? null,
      hiring_timeline: parsed.data.hiring_timeline,
      why_us: parsed.data.why_us,
      references_text: parsed.data.references_text ?? null,
      acknowledged_terms: true,
      status: "submitted",
    });
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't submit your application. Please try again.");
      return;
    }
    setSubmitted(true);
    setForm(initial);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <SiteLayout>
        <section className="bg-paper">
          <div className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10">
            <ShieldCheck className="mx-auto h-12 w-12 text-emerald" />
            <h1 className="mt-6 font-display text-3xl text-navy-deep lg:text-4xl">
              Application received.
            </h1>
            <p className="mt-4 text-muted-foreground">
              We review every employer application personally. Expect to hear back within five
              business days at the work email you provided. If we need a reference call, we'll
              coordinate by email first.
            </p>
            <div className="mt-8">
              <Link
                to="/employers"
                className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
              >
                Back to employers
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <div className="eyebrow">Employer Application</div>
            <h1 className="mt-5 font-display text-3xl text-navy-deep lg:text-5xl">
              Apply for verified employer access.
            </h1>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              This application is the first step in our vetting process. Use your work email and
              answer honestly — anything that doesn't add up means an automatic decline.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-navy-deep/85 sm:grid-cols-2">
              {[
                "Work email required (no personal domains)",
                "LinkedIn profile required",
                "Two professional references",
                "Decision within ~5 business days",
              ].map((i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-20">
          <form onSubmit={onSubmit} className="space-y-10 border border-border bg-paper p-6 lg:p-10">
            <FormSection title="Organization">
              <Field label="Organization name" error={errors.organization_name} required>
                <input
                  type="text"
                  required
                  value={form.organization_name}
                  onChange={(e) => update("organization_name", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Website" error={errors.organization_website} required hint="e.g. https://example.org">
                <input
                  type="url"
                  required
                  value={form.organization_website}
                  onChange={(e) => update("organization_website", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Organization type" error={errors.organization_type} required>
                  <select
                    required
                    value={form.organization_type}
                    onChange={(e) => update("organization_type", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {ORG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="HQ country" error={errors.hq_country} required>
                  <input
                    type="text"
                    required
                    value={form.hq_country}
                    onChange={(e) => update("hq_country", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Hiring contact">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" error={errors.contact_full_name} required>
                  <input
                    type="text"
                    required
                    value={form.contact_full_name}
                    onChange={(e) => update("contact_full_name", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Title / role" error={errors.contact_title} required>
                  <input
                    type="text"
                    required
                    value={form.contact_title}
                    onChange={(e) => update("contact_title", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field
                label="Work email"
                error={errors.contact_work_email}
                hint="Must match your organization's domain. Personal addresses are auto-rejected."
                required
              >
                <input
                  type="email"
                  required
                  value={form.contact_work_email}
                  onChange={(e) => update("contact_work_email", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="LinkedIn profile" error={errors.contact_linkedin} required>
                  <input
                    type="url"
                    required
                    placeholder="https://linkedin.com/in/…"
                    value={form.contact_linkedin}
                    onChange={(e) => update("contact_linkedin", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone (optional)" error={errors.contact_phone}>
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => update("contact_phone", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Hiring needs">
              <Field
                label="What roles are you hiring for?"
                error={errors.hiring_roles}
                hint="Titles, level, location/remote, and any must-haves."
                required
              >
                <textarea
                  required
                  rows={4}
                  value={form.hiring_roles}
                  onChange={(e) => update("hiring_roles", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Target number of hires (optional)" error={errors.target_hires}>
                  <input
                    type="number"
                    min={1}
                    value={form.target_hires}
                    onChange={(e) => update("target_hires", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Timeline" error={errors.hiring_timeline} required>
                  <select
                    required
                    value={form.hiring_timeline}
                    onChange={(e) => update("hiring_timeline", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {TIMELINES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field
                label="Why Discover Diplomacy?"
                hint="Tell us what you're hoping to find and why our candidate pool fits."
                error={errors.why_us}
                required
              >
                <textarea
                  required
                  rows={4}
                  value={form.why_us}
                  onChange={(e) => update("why_us", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </FormSection>

            <FormSection title="References">
              <Field
                label="Two professional references"
                hint="Name, organization, title, email and phone. We'll contact at least one before approving."
                error={errors.references_text}
              >
                <textarea
                  rows={4}
                  value={form.references_text}
                  onChange={(e) => update("references_text", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </FormSection>

            <div className="border-t border-border pt-6">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-navy-deep/90">
                <input
                  type="checkbox"
                  checked={form.acknowledged_terms}
                  onChange={(e) => update("acknowledged_terms", e.target.checked)}
                  className="mt-1 h-4 w-4 border-border accent-emerald"
                />
                <span>
                  I confirm I'm authorized to hire on behalf of this organization and agree to
                  Discover Diplomacy's{" "}
                  <Link to="/terms" className="underline">terms</Link> and{" "}
                  <Link to="/privacy" className="underline">privacy policy</Link>. I understand
                  candidate materials are confidential and not for redistribution.
                </span>
              </label>
              {errors.acknowledged_terms && (
                <p className="mt-2 text-xs text-red-600">{errors.acknowledged_terms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-navy-deep px-6 py-4 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

const inputClass =
  "mt-2 w-full border border-border bg-paper px-3 py-2.5 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-navy-deep">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-navy-deep">
      <span className="font-medium">
        {label} {required && <span className="text-emerald">*</span>}
      </span>
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
