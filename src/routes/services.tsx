import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Advisory services for graduate admissions, fellowships, foreign service, multilateral careers, and early-career transitions in international affairs.",
      },
      { property: "og:title", content: "Services — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Advisory services for graduate admissions, fellowships, foreign service, multilateral careers, and early-career transitions.",
      },
    ],
  }),
  component: ServicesPage,
});

const PRACTICES = [
  {
    id: "graduate",
    eyebrow: "Practice 01",
    title: "Graduate Admissions Advisory",
    summary:
      "End-to-end strategy for admission to the world's leading programs in international affairs, public policy, and security studies.",
    includes: [
      "School selection and portfolio strategy",
      "Personal statement and statement of purpose development",
      "Resume and CV positioning for academic review",
      "Letter of recommendation strategy",
      "Interview preparation",
      "Scholarship and assistantship advisory",
    ],
    programs: [
      "Johns Hopkins SAIS",
      "Columbia SIPA",
      "Fletcher School (Tufts)",
      "Princeton SPIA",
      "Harvard Kennedy School",
      "Sciences Po PSIA",
      "Oxford BSG",
      "LSE",
      "Georgetown SFS",
    ],
  },
  {
    id: "fellowships",
    eyebrow: "Practice 02",
    title: "Fellowships & Scholarships",
    summary:
      "Comprehensive candidacy support for the most competitive postgraduate fellowships, from preliminary positioning through final interview.",
    includes: [
      "Candidacy diagnostic and timeline",
      "Endorsement and nomination strategy",
      "Application drafting and revision",
      "Mock interview cycles with subject-matter panels",
      "Post-decision negotiation and acceptance",
    ],
    programs: [
      "Rhodes Scholarship",
      "Marshall Scholarship",
      "Fulbright (U.S. and Foreign Student)",
      "Schwarzman Scholars",
      "Truman Scholarship",
      "Pickering Fellowship",
      "Rangel Fellowship",
      "Boren Awards",
    ],
  },
  {
    id: "foreign-service",
    eyebrow: "Practice 03",
    title: "Foreign Service & Multilateral Careers",
    summary:
      "Structured preparation for entry into the U.S. Foreign Service and parallel systems at the United Nations, World Bank, and European institutions.",
    includes: [
      "FSOT preparation (Job Knowledge, English Expression, Biographic)",
      "Personal Narrative drafting and review",
      "Oral Assessment simulation",
      "UN YPP, JPO, and Consultant track strategy",
      "World Bank YPP advisory",
      "EU concours and EPSO preparation",
    ],
    programs: [
      "U.S. Foreign Service Officer",
      "UN Young Professionals Programme",
      "UN Junior Professional Officer",
      "World Bank YPP",
      "EU EPSO competitions",
      "FCDO (UK) Diplomatic Service",
    ],
  },
  {
    id: "transitions",
    eyebrow: "Practice 04",
    title: "Early-Career Transitions",
    summary:
      "Confidential advisory for working professionals pivoting into international policy, development, or diplomacy from adjacent sectors.",
    includes: [
      "Sector and role mapping",
      "Network architecture and outreach strategy",
      "Resume and LinkedIn repositioning",
      "Interview coaching for policy and IO roles",
      "Compensation benchmarking and offer negotiation",
    ],
    programs: [
      "International NGOs",
      "Think tanks (Brookings, CFR, RAND, Chatham House)",
      "Development consultancies",
      "Government affairs",
      "Global corporate strategy",
    ],
  },
];

function ServicesPage() {
  return (
    <SiteLayout>
      {/* Page header */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="eyebrow">Services</div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
            Four practices. One advisory standard.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Each practice is led personally and delivered on a one-to-one basis.
            Engagements are scoped to outcomes, not hours, and are subject to a
            confidentiality agreement.
          </p>
        </div>
      </section>

      {/* Anchor nav */}
      <section className="sticky top-[73px] z-30 border-b border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground lg:px-10">
          {PRACTICES.map((p) => (
            <a key={p.id} href={`#${p.id}`} className="whitespace-nowrap hover:text-navy-deep">
              {p.title}
            </a>
          ))}
        </div>
      </section>

      {/* Practices */}
      {PRACTICES.map((p, idx) => (
        <section
          key={p.id}
          id={p.id}
          className={
            "border-b border-border " + (idx % 2 === 0 ? "bg-paper" : "bg-stone")
          }
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
            <header className="lg:col-span-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                {p.eyebrow}
              </div>
              <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
                {p.title}
              </h2>
              <p className="mt-5 text-muted-foreground">{p.summary}</p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
              >
                Inquire about this practice <ArrowRight className="h-4 w-4" />
              </Link>
            </header>

            <div className="grid gap-10 lg:col-span-8 lg:grid-cols-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Engagement includes
                </div>
                <ul className="mt-5 space-y-3">
                  {p.includes.map((i) => (
                    <li key={i} className="flex gap-3 text-sm text-navy-deep/85">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Representative targets
                </div>
                <ul className="mt-5 grid grid-cols-1 gap-y-2 text-sm text-navy-deep/85 sm:grid-cols-2">
                  {p.programs.map((pr) => (
                    <li key={pr} className="border-b border-border pb-2">
                      {pr}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Pricing structure */}
      <section className="border-b border-border bg-navy-deep text-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                Engagement Structure
              </div>
              <h2 className="mt-5 font-display text-3xl text-paper lg:text-4xl">
                Three engagement formats.
              </h2>
              <p className="mt-5 max-w-md text-paper/70">
                Each format begins with a complimentary 30-minute consultation
                to assess fit. Final scope and fees are quoted in writing.
              </p>
            </div>
            <div className="grid gap-px bg-paper/10 lg:col-span-7 lg:grid-cols-3">
              {[
                {
                  t: "Single Engagement",
                  d: "One application cycle — graduate program, fellowship, or role.",
                  f: "From $2,400",
                },
                {
                  t: "Retainer",
                  d: "Ongoing advisory across multiple cycles and decisions.",
                  f: "Quarterly",
                },
                {
                  t: "Strategic Review",
                  d: "Three-session diagnostic with written advisory memorandum.",
                  f: "$850",
                },
              ].map((t) => (
                <div key={t.t} className="bg-navy-deep p-8">
                  <h3 className="font-display text-xl text-paper">{t.t}</h3>
                  <p className="mt-3 text-sm text-paper/70">{t.d}</p>
                  <div className="mt-6 text-sm font-medium text-emerald">{t.f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
