type LangProf = { lang: string; level: string };

type CardProfile = {
  career_stage?: string | null;
  years_intl?: string | null;
  years_experience?: string | null;
  primary_theme?: string | null;
  secondary_themes?: string[] | null;
  functional_skills?: string[] | null;
  org_types?: string[] | null;
  technical_skills?: string[] | null;
  language_proficiencies?: LangProf[] | null;
  current_base?: string | null;
  work_eligibility?: string[] | null;
  relocation?: string | null;
  relocation_regions?: string[] | null;
  availability?: string | null;
  work_mode?: string | null;
  work_type?: string[] | null;
  budget_responsibility?: string | null;
  management_experience?: string | null;
  security_clearance?: string | null;
  roles_seeking?: string[] | null;
  target_sectors?: string[] | null;
  salary_expectation?: string | null;
  fellowship_category?: string | null;
  internship_count?: string | null;
  ai_followups?: Array<{ question?: string; answer?: string }> | null;
  anon_label?: string | null;
};

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="min-w-[110px] text-muted-foreground">{label}</span>
      <span className="flex-1 text-navy-deep">{value}</span>
    </div>
  );
}

function joinList(xs?: string[] | null) {
  return xs && xs.length ? xs.join(", ") : null;
}

export function ProfileCard({ p, locked = true }: { p: CardProfile; locked?: boolean }) {
  const header = [
    p.career_stage,
    p.years_intl ? `${p.years_intl} yrs intl experience` : p.years_experience ? `${p.years_experience} yrs experience` : null,
  ]
    .filter(Boolean)
    .join(" • ");
  const specializations = Array.isArray(p.ai_followups)
    ? p.ai_followups.map((t) => t?.answer).filter((a): a is string => !!a)
    : [];

  const langs =
    p.language_proficiencies && p.language_proficiencies.length
      ? p.language_proficiencies.map((l) => `${l.lang} (${l.level})`).join(", ")
      : null;

  const eligibility = joinList(p.work_eligibility);
  const relocation =
    p.relocation === "Yes — select regions"
      ? `Yes (${joinList(p.relocation_regions) ?? "regions tbd"})`
      : p.relocation;

  return (
    <article className="border border-border bg-paper p-6 lg:p-8">
      {p.anon_label && (
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {p.anon_label}
        </div>
      )}
      <div className="font-display text-xl text-navy-deep">{header || "Candidate"}</div>
      {specializations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {specializations.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full bg-gilt/15 px-2.5 py-0.5 text-[11px] font-medium text-navy-deep"
              title="AI-generated specialization"
            >
              ✦ {s}
            </span>
          ))}
        </div>
      )}
      {p.primary_theme && (
        <div className="mt-1 text-sm text-muted-foreground">
          Primary: <span className="text-navy-deep">{p.primary_theme}</span>
          {p.secondary_themes && p.secondary_themes.length > 0 && (
            <> · Also: {p.secondary_themes.join(", ")}</>
          )}
        </div>
      )}

      <div className="my-5 h-px bg-border" />

      <div className="space-y-2">
        <Line label="Functions" value={joinList(p.functional_skills)} />
        <Line label="Org types" value={joinList(p.org_types)} />
        <Line label="Technical" value={joinList(p.technical_skills)} />
        <Line label="Languages" value={langs} />
        <Line label="Based in" value={p.current_base} />
        <Line
          label="Eligible"
          value={eligibility && relocation ? `${eligibility} · Relocate: ${relocation}` : eligibility ?? relocation}
        />
        <Line
          label="Available"
          value={[p.availability, p.work_mode, joinList(p.work_type)].filter(Boolean).join(" · ") || null}
        />
        {p.budget_responsibility && p.budget_responsibility !== "Not applicable" && (
          <Line label="Budgets" value={p.budget_responsibility} />
        )}
        {p.management_experience && p.management_experience !== "None" && (
          <Line label="Manages" value={p.management_experience} />
        )}
        <Line label="Clearance" value={p.security_clearance} />
        <Line label="Seeking" value={joinList(p.roles_seeking)} />
        <Line label="Sectors" value={joinList(p.target_sectors)} />
        <Line label="Salary" value={p.salary_expectation} />
        <Line label="Fellowship" value={p.fellowship_category && p.fellowship_category !== "None" ? p.fellowship_category : null} />
        <Line label="Internships" value={p.internship_count} />
      </div>

      <div className="my-5 h-px bg-border" />

      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-sm border border-dashed border-border bg-stone/40 px-4 py-2.5 text-sm text-muted-foreground"
      >
        {locked ? "🔒 Unlock to contact this candidate" : "Contact unlocked"}
      </button>
    </article>
  );
}
