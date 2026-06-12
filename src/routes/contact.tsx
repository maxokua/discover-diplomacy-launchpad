import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Mail, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Request a confidential consultation with Discover Diplomacy. Limited new engagements each quarter.",
      },
      { property: "og:title", content: "Contact — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Request a confidential consultation with Discover Diplomacy.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="eyebrow">Contact</div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
            Request a confidential consultation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            We respond to qualified inquiries within two business days. All
            correspondence is held in confidence.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-12 lg:gap-20 lg:px-10 lg:py-24">
          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="eyebrow">Direct Correspondence</div>
            <ul className="mt-6 space-y-6 text-sm">
              <li className="flex gap-4">
                <Mail className="h-5 w-5 flex-shrink-0 text-emerald" />
                <div>
                  <div className="font-medium text-navy-deep">General Inquiries</div>
                  <a
                    href="mailto:hello@discoverdiplomacy.com"
                    className="text-muted-foreground hover:text-navy-deep"
                  >
                    hello@discoverdiplomacy.com
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="h-5 w-5 flex-shrink-0 text-emerald" />
                <div>
                  <div className="font-medium text-navy-deep">Engagements</div>
                  <a
                    href="mailto:engagements@discoverdiplomacy.com"
                    className="text-muted-foreground hover:text-navy-deep"
                  >
                    engagements@discoverdiplomacy.com
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="h-5 w-5 flex-shrink-0 text-emerald" />
                <div>
                  <div className="font-medium text-navy-deep">Press</div>
                  <a
                    href="mailto:press@discoverdiplomacy.com"
                    className="text-muted-foreground hover:text-navy-deep"
                  >
                    press@discoverdiplomacy.com
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-10 border-t border-border pt-8">
              <div className="eyebrow">Offices</div>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-4">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-emerald" />
                  <div>
                    <div className="font-medium text-navy-deep">Washington, DC</div>
                    <div className="text-muted-foreground">1100 K Street NW, Suite 700</div>
                    <div className="text-muted-foreground">Washington, DC 20005</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-emerald" />
                  <div>
                    <div className="font-medium text-navy-deep">Geneva</div>
                    <div className="text-muted-foreground">Rue du Rhône 14</div>
                    <div className="text-muted-foreground">1204 Geneva, Switzerland</div>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-8">
            {submitted ? (
              <div className="border border-border bg-stone p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-paper">
                  <Check className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-display text-3xl text-navy-deep">
                  Inquiry received.
                </h2>
                <p className="mt-4 max-w-lg text-muted-foreground">
                  Thank you. A senior advisor will review your submission and respond
                  within two business days. If your inquiry is time-sensitive, please
                  write directly to{" "}
                  <a
                    href="mailto:engagements@discoverdiplomacy.com"
                    className="text-navy-deep underline underline-offset-4"
                  >
                    engagements@discoverdiplomacy.com
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-sm font-medium text-navy-deep underline underline-offset-4"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="grid gap-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="firstName" label="First name" required />
                  <Field id="lastName" label="Last name" required />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="email" label="Email" type="email" required />
                  <Field id="phone" label="Phone (optional)" type="tel" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    id="institution"
                    label="Current institution or employer"
                    required
                  />
                  <Select
                    id="practice"
                    label="Practice area of interest"
                    options={[
                      "Graduate Admissions Advisory",
                      "Fellowships & Scholarships",
                      "Foreign Service & Multilateral Careers",
                      "Early-Career Transitions",
                      "Not yet determined",
                    ]}
                  />
                </div>
                <Select
                  id="timeline"
                  label="Timeline"
                  options={[
                    "Within 3 months",
                    "3–6 months",
                    "6–12 months",
                    "More than 12 months",
                  ]}
                />
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-navy-deep">
                    Brief outline of your background and objectives
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:border-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Please include your current academic or professional context and
                    any specific programs or roles you are considering.
                  </p>
                </div>

                <label className="flex items-start gap-3 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 border-border text-navy-deep"
                  />
                  <span>
                    I acknowledge that submission of this form does not constitute
                    an advisory engagement and I consent to the practice contacting
                    me regarding my inquiry.
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-6 border-t border-border pt-8">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-sm bg-navy-deep px-8 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-navy"
                  >
                    Submit Inquiry
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Response within two business days.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy-deep">
        {label}
        {required && <span className="ml-1 text-emerald">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:border-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
      />
    </div>
  );
}

function Select({
  id,
  label,
  options,
}: {
  id: string;
  label: string;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy-deep">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className="mt-2 w-full appearance-none border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:border-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
