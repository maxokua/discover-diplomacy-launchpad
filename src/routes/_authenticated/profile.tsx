import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import {
  getMyCandidateProfile,
  patchCandidateProfile,
} from "@/lib/profile.functions";
import {
  generateProfileFollowup,
  saveProfileFollowupAnswer,
  updateAiCoreSignature,
} from "@/lib/ai-followup.functions";
import { ProfileCard } from "@/components/profile-card";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Your Profile | Discover Diplomacy" }],
  }),
  component: ProfileBuilderPage,
});

// ─── Option lists ────────────────────────────────────────────────────────────
const YEARS = ["0–1", "1–2", "3–5", "6–10", "11–15", "15+"];
const CAREER_STAGE = ["Entry-level", "Mid-level", "Senior", "Leadership"] as const;
const DEGREE = ["Bachelor's", "Master's", "PhD", "Professional (JD/MD/etc.)", "Other"];
const MANAGEMENT = ["None", "Led 1–3 people", "Led 4–10 people", "Led 10+ people"];
const BUDGET = ["Under $100K", "$100K–$500K", "$500K–$2M", "$2M+", "Not applicable"];
const ORG_TYPES = [
  "NGO", "Multilateral Organization", "Government/Bilateral", "Think Tank",
  "Foundation", "Private Sector", "Academic/Research", "UN System", "Social Enterprise",
];
const FUNCTIONS = [
  "Research", "Monitoring & Evaluation", "Program Management", "Policy Analysis",
  "Communications", "Fundraising/Grants", "Data Analysis", "Advocacy",
  "Partnerships", "Operations", "Fieldwork", "Project Design",
];
const THEMES = [
  "Climate/Environment", "Development", "Trade/Economics", "Security/Conflict",
  "Human Rights", "Health", "Education", "Migration", "Governance", "Gender",
  "Tech Policy", "Humanitarian",
];
const TECH = [
  "Excel", "Stata", "R", "Python", "GIS", "SQL", "Salesforce", "Tableau",
  "SPSS", "Qualitative methods", "Quantitative methods", "None / Not applicable",
];
const LANGUAGES = [
  "English", "Spanish", "French", "Arabic", "Mandarin Chinese", "Portuguese",
  "German", "Japanese", "Russian", "Swahili", "Hindi", "Other",
];
const PROFICIENCY = ["Beginner", "Intermediate", "Fluent", "Native"] as const;
const REGIONS = [
  "North America", "Latin America", "Europe", "Middle East/North Africa",
  "Sub-Saharan Africa", "South Asia", "East/Southeast Asia", "Oceania",
];
const ELIGIBILITY = ["United States", "European Union", "United Kingdom", "Canada", "Australia", "Other"];
const RELOCATION = ["Yes — anywhere", "Yes — select regions", "No / Remote only"];
const WORK_MODE = ["Remote", "Hybrid", "Onsite", "Open"];
const AVAILABILITY = ["Immediately", "2–4 weeks", "1–3 months", "3–6 months", "Flexible"];
const WORK_TYPE = ["Full-time", "Part-time", "Contract", "Consulting", "Internship/Fellowship"];
const ROLES = [
  "Analyst", "Officer", "Coordinator", "Specialist", "Advisor", "Consultant",
  "Manager", "Director", "Researcher", "Communications",
];
const SALARY = ["Under $40K", "$40–60K", "$60–80K", "$80–100K", "$100–130K", "$130K+", "Flexible"];
const CLEARANCE = ["None", "Eligible", "Active — Confidential", "Active — Secret", "Active — Top Secret/SCI"];
const FELLOWSHIP = ["None", "National fellowship", "Government program", "University fellowship"];
const INTERNSHIPS = ["None yet", "1 internship", "2–3 internships", "4+ internships/fellowships"];

// Required fields for completion-percent calc & "must answer to advance"
const REQUIRED = [
  "career_stage", "years_experience", "primary_theme",
  "current_base", "work_eligibility",
] as const;

type LangProf = { lang: string; level: (typeof PROFICIENCY)[number] };

type ProfileState = {
  years_experience: string | null;
  years_intl: string | null;
  career_stage: (typeof CAREER_STAGE)[number] | null;
  highest_degree: string | null;
  management_experience: string | null;
  budget_responsibility: string | null;
  org_types: string[];
  functional_skills: string[];
  primary_theme: string | null;
  secondary_themes: string[];
  technical_skills: string[];
  language_proficiencies: LangProf[];
  current_base: string | null;
  work_eligibility: string[];
  relocation: string | null;
  relocation_regions: string[];
  work_mode: string | null;
  availability: string | null;
  work_type: string[];
  roles_seeking: string[];
  target_sectors: string[];
  salary_expectation: string | null;
  security_clearance: string | null;
  fellowship_category: string | null;
  internship_count: string | null;
  include_in_resume_drop: boolean;
  profile_status: "draft" | "complete" | "published";
};

const EMPTY: ProfileState = {
  years_experience: null, years_intl: null, career_stage: null, highest_degree: null,
  management_experience: null, budget_responsibility: null,
  org_types: [], functional_skills: [], primary_theme: null, secondary_themes: [],
  technical_skills: [], language_proficiencies: [],
  current_base: null, work_eligibility: [], relocation: null, relocation_regions: [],
  work_mode: null, availability: null, work_type: [],
  roles_seeking: [], target_sectors: [], salary_expectation: null,
  security_clearance: null, fellowship_category: null, internship_count: null,
  include_in_resume_drop: false, profile_status: "draft",
};

const TOTAL_FIELDS = 25;

function completionPercent(p: ProfileState) {
  const filled = [
    p.years_experience, p.years_intl, p.career_stage, p.highest_degree,
    p.management_experience, p.budget_responsibility,
    p.org_types.length, p.functional_skills.length, p.primary_theme, p.secondary_themes.length,
    p.technical_skills.length, p.language_proficiencies.length,
    p.current_base, p.work_eligibility.length, p.relocation, p.work_mode, p.availability, p.work_type.length,
    p.roles_seeking.length, p.target_sectors.length, p.salary_expectation,
    p.security_clearance, p.fellowship_category, p.internship_count,
    p.include_in_resume_drop ? 1 : 0,
  ].filter((v) => (typeof v === "number" ? v > 0 : Boolean(v))).length;
  return Math.min(100, Math.round((filled / TOTAL_FIELDS) * 100));
}

function ProfileBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ProfileState>(EMPTY);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"card" | "builder">("builder");
  const [followup, setFollowup] = useState<{
    question: string;
    options: string[];
    surface: "after_screen_2" | "after_screen_5";
    nextAction: "advance" | "finish";
  } | null>(null);
  const [aiCallsMade, setAiCallsMade] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const lastCoreSigRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getMyCandidateProfile();
      if ("profile" in r && r.profile) {
        const p = r.profile as Record<string, unknown>;
        const merged: ProfileState = { ...EMPTY };
        for (const k of Object.keys(EMPTY) as (keyof ProfileState)[]) {
          if (p[k] !== undefined && p[k] !== null) {
            // @ts-expect-error dynamic
            merged[k] = p[k];
          }
        }
        setState(merged);
        lastCoreSigRef.current = (p.ai_core_signature as string | null) ?? null;
        if ((p.profile_status as string) === "complete" || (p.profile_status as string) === "published") {
          setMode("card");
        }
      }
      setLoading(false);
    })();
  }, []);

  // Autosave (debounced) on any state change after initial load
  const firstRef = useRef(true);
  useEffect(() => {
    if (loading) return;
    if (firstRef.current) { firstRef.current = false; return; }
    const t = setTimeout(async () => {
      const r = await patchCandidateProfile({
        data: {
          ...state,
          profile_completion_percent: completionPercent(state),
        } as never,
      });
      if ("error" in r) toast.error(r.error);
    }, 500);
    return () => clearTimeout(t);
  }, [state, loading]);

  const set = useCallback(
    <K extends keyof ProfileState>(key: K, value: ProfileState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    [],
  );

  // ── Branching: keep state coherent ────────────────────────────────────────
  useEffect(() => {
    if (state.career_stage === "Entry-level") {
      if (state.management_experience || state.budget_responsibility) {
        setState((s) => ({ ...s, management_experience: null, budget_responsibility: null }));
      }
    } else if (state.career_stage === "Mid-level") {
      if (state.budget_responsibility) setState((s) => ({ ...s, budget_responsibility: null }));
      if (state.internship_count) setState((s) => ({ ...s, internship_count: null }));
    } else if (state.career_stage === "Senior" || state.career_stage === "Leadership") {
      if (state.internship_count) setState((s) => ({ ...s, internship_count: null }));
    }
    if (state.relocation !== "Yes — select regions" && state.relocation_regions.length) {
      setState((s) => ({ ...s, relocation_regions: [] }));
    }
  }, [state.career_stage, state.relocation, state.management_experience, state.budget_responsibility, state.internship_count, state.relocation_regions.length]);

  // Sync language proficiencies with selected languages
  const setLanguages = useCallback((langs: string[]) => {
    setState((s) => {
      const existing = new Map(s.language_proficiencies.map((l) => [l.lang, l.level]));
      const next = langs.map<LangProf>((lang) => ({
        lang,
        level: existing.get(lang) ?? "Intermediate",
      }));
      return { ...s, language_proficiencies: next };
    });
  }, []);
  const setLangLevel = useCallback((lang: string, level: LangProf["level"]) => {
    setState((s) => ({
      ...s,
      language_proficiencies: s.language_proficiencies.map((l) =>
        l.lang === lang ? { ...l, level } : l,
      ),
    }));
  }, []);

  const pct = useMemo(() => completionPercent(state), [state]);

  // AI follow-up: trigger after screens 2 and 5, capped at 2 total.
  async function tryFollowup(
    surface: "after_screen_2" | "after_screen_5",
    nextAction: "advance" | "finish",
  ): Promise<boolean> {
    if (aiCallsMade >= 2) return false;
    const coreSig = [
      state.primary_theme ?? "",
      [...state.functional_skills].sort().join("|"),
      state.career_stage ?? "",
      [...state.roles_seeking].sort().join("|"),
      [...state.target_sectors].sort().join("|"),
    ].join("::");
    if (lastCoreSigRef.current === coreSig) return false; // no relevant change since last AI run

    setAiLoading(true);
    try {
      const askedQs = Array.isArray(state) ? [] : [];
      const r = await generateProfileFollowup({
        data: {
          surface,
          selections: {
            career_stage: state.career_stage,
            years_experience: state.years_experience,
            primary_theme: state.primary_theme,
            secondary_themes: state.secondary_themes,
            functional_skills: state.functional_skills,
            org_types: state.org_types,
            roles_seeking: state.roles_seeking,
            target_sectors: state.target_sectors,
            current_base: state.current_base,
          },
          asked_questions: askedQs,
        },
      });
      setAiCallsMade((n) => n + 1);
      lastCoreSigRef.current = coreSig;
      await updateAiCoreSignature({ data: { signature: coreSig } });
      if (r && r.question && r.options.length >= 3) {
        setFollowup({
          question: r.question,
          options: r.options,
          surface,
          nextAction,
        });
        return true;
      }
    } catch {
      // silent fallback
    } finally {
      setAiLoading(false);
    }
    return false;
  }

  async function finishProfile() {
    const status: ProfileState["profile_status"] = "complete";
    setState((s) => ({ ...s, profile_status: status }));
    await patchCandidateProfile({
      data: { profile_status: status, profile_completion_percent: pct } as never,
    });
    toast.success("Profile saved");
    setMode("card");
  }

  async function finish() {
    const shown = await tryFollowup("after_screen_5", "finish");
    if (!shown) await finishProfile();
  }

  async function chooseFollowup(answer: string | null) {
    const f = followup;
    if (!f) return;
    setFollowup(null);
    if (answer) {
      try {
        await saveProfileFollowupAnswer({
          data: { question: f.question, answer, surface: f.surface },
        });
      } catch {
        // ignore
      }
    }
    if (f.nextAction === "advance") {
      setStep((s) => s + 1);
    } else {
      await finishProfile();
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">Loading…</div>
      </SiteLayout>
    );
  }

  if (mode === "card") {
    return (
      <SiteLayout>
        <section className="border-b border-border bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
            <div className="eyebrow">Your Profile</div>
            <h1 className="mt-3 font-display text-3xl text-navy-deep lg:text-5xl">
              Your candidate card
            </h1>
            <p className="mt-4 text-muted-foreground">
              This is what verified employers see. Your resume and contact info stay
              hidden until you opt into Resume Drop and an employer spends a credit.
            </p>
          </div>
        </section>
        <section className="bg-stone/30">
          <div className="mx-auto max-w-3xl space-y-6 px-6 py-12 lg:px-10">
            <ProfileCard p={state} />
            <div className="flex items-center justify-between border border-border bg-paper p-5">
              <div>
                <div className="font-display text-lg text-navy-deep">Include me in Resume Drop</div>
                <p className="text-sm text-muted-foreground">
                  Lets verified employers find your profile. Resume + contact still require a credit unlock.
                </p>
              </div>
              <Toggle
                value={state.include_in_resume_drop}
                onChange={(v) => set("include_in_resume_drop", v)}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Profile completion: {pct}%</span>
              <button className="underline" onClick={() => { setMode("builder"); setStep(1); }}>
                Edit profile
              </button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ── Builder ─────────────────────────────────────────────────────────────
  const totalSteps = 5;
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Profile Builder</div>
            <div className="text-sm text-muted-foreground">Step {step} of {totalSteps}</div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone">
            <div
              className="h-full bg-navy-deep transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 lg:px-10">
          {step === 1 && (
            <Screen title="Experience & seniority">
              <Single label="Total years full-time work experience *" options={YEARS}
                value={state.years_experience} onChange={(v) => set("years_experience", v)} />
              <Single label="Years in international or global work" options={YEARS}
                value={state.years_intl} onChange={(v) => set("years_intl", v)} skippable />
              <Single label="Career stage *" options={[...CAREER_STAGE]}
                value={state.career_stage} onChange={(v) => set("career_stage", v as never)} />
              <Single label="Highest degree completed" options={DEGREE}
                value={state.highest_degree} onChange={(v) => set("highest_degree", v)} skippable />
              {(state.career_stage === "Mid-level" || state.career_stage === "Senior" || state.career_stage === "Leadership") && (
                <Single label="Management experience" options={MANAGEMENT}
                  value={state.management_experience} onChange={(v) => set("management_experience", v)} skippable />
              )}
              {(state.career_stage === "Senior" || state.career_stage === "Leadership") && (
                <Single label="Budget or grant responsibility managed" options={BUDGET}
                  value={state.budget_responsibility} onChange={(v) => set("budget_responsibility", v)} skippable />
              )}
            </Screen>
          )}

          {step === 2 && (
            <Screen title="What you do">
              <Multi
                label={
                  state.career_stage === "Entry-level"
                    ? "Organization types you've worked in OR interned at"
                    : "Organization types you've worked in"
                }
                options={ORG_TYPES} values={state.org_types} onChange={(v) => set("org_types", v)} skippable
              />
              <Multi label="Functional skills (pick your top 5)" options={FUNCTIONS}
                values={state.functional_skills} onChange={(v) => set("functional_skills", v)} max={5} skippable />
              <Single label="Primary thematic expertise *" options={THEMES}
                value={state.primary_theme} onChange={(v) => set("primary_theme", v)} />
              <Multi label="Secondary thematic areas (max 3)" options={THEMES.filter((t) => t !== state.primary_theme)}
                values={state.secondary_themes} onChange={(v) => set("secondary_themes", v)} max={3} skippable />
            </Screen>
          )}

          {step === 3 && (
            <Screen title="Technical & languages">
              <Multi label="Technical / software skills" options={TECH}
                values={state.technical_skills} onChange={(v) => set("technical_skills", v)} skippable />
              <Multi label="Languages" options={LANGUAGES}
                values={state.language_proficiencies.map((l) => l.lang)} onChange={setLanguages} skippable />
              {state.language_proficiencies.map((l) => (
                <Single key={l.lang} label={`${l.lang} proficiency`} options={[...PROFICIENCY]}
                  value={l.level} onChange={(v) => setLangLevel(l.lang, v as LangProf["level"])} />
              ))}
            </Screen>
          )}

          {step === 4 && (
            <Screen title="Location & logistics">
              <Single label="Current base (region) *" options={REGIONS}
                value={state.current_base} onChange={(v) => set("current_base", v)} />
              <Multi label="Work eligibility / authorization *" options={ELIGIBILITY}
                values={state.work_eligibility} onChange={(v) => set("work_eligibility", v)} />
              <Single label="Relocation willingness" options={RELOCATION}
                value={state.relocation} onChange={(v) => set("relocation", v)} skippable />
              {state.relocation === "Yes — select regions" && (
                <Multi label="Which regions would you relocate to?" options={REGIONS}
                  values={state.relocation_regions} onChange={(v) => set("relocation_regions", v)} />
              )}
              <Single label="Work mode preference" options={WORK_MODE}
                value={state.work_mode} onChange={(v) => set("work_mode", v)} skippable />
              <Single label="Availability to start" options={AVAILABILITY}
                value={state.availability} onChange={(v) => set("availability", v)} skippable />
              <Multi label="Work type sought" options={WORK_TYPE}
                values={state.work_type} onChange={(v) => set("work_type", v)} skippable />
            </Screen>
          )}

          {step === 5 && (
            <Screen title="Goals & credentials">
              <Multi label="Roles you're seeking (max 3)" options={ROLES}
                values={state.roles_seeking} onChange={(v) => set("roles_seeking", v)} max={3} skippable />
              <Multi label="Sectors you're targeting" options={ORG_TYPES}
                values={state.target_sectors} onChange={(v) => set("target_sectors", v)} skippable />
              <Single label="Salary expectation" options={SALARY}
                value={state.salary_expectation} onChange={(v) => set("salary_expectation", v)} skippable />
              <Single label="Security clearance" options={CLEARANCE}
                value={state.security_clearance} onChange={(v) => set("security_clearance", v)} skippable />
              <Single label="Competitive fellowship or program (category only)" options={FELLOWSHIP}
                value={state.fellowship_category} onChange={(v) => set("fellowship_category", v)}
                helper="We keep this general to protect your identity." skippable />
              {state.career_stage === "Entry-level" && (
                <Single label="Internship/fellowship experience" options={INTERNSHIPS}
                  value={state.internship_count} onChange={(v) => set("internship_count", v)} skippable />
              )}
            </Screen>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="text-sm text-muted-foreground underline disabled:opacity-40"
            >
              ← Back
            </button>
            <div className="text-xs text-muted-foreground">Autosaved · {pct}% complete</div>
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => {
                  // Required check per-screen
                  if (step === 1 && (!state.career_stage || !state.years_experience)) {
                    toast.error("Career stage and years of experience are required");
                    return;
                  }
                  if (step === 2 && !state.primary_theme) {
                    toast.error("Primary thematic expertise is required");
                    return;
                  }
                  if (step === 4 && (!state.current_base || state.work_eligibility.length === 0)) {
                    toast.error("Current base and work eligibility are required");
                    return;
                  }
                  setStep(step + 1);
                }}
                className="rounded-sm bg-navy-deep px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-paper hover:bg-navy"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="rounded-sm bg-navy-deep px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-paper hover:bg-navy"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

// ─── Building blocks ────────────────────────────────────────────────────────
function Screen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 border border-border bg-paper p-6 lg:p-8">
      <h2 className="font-display text-2xl text-navy-deep">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children, helper, onSkip }: {
  children: React.ReactNode; helper?: string; onSkip?: () => void;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {children}
        </div>
        {helper && <div className="mt-0.5 text-xs text-muted-foreground/80">{helper}</div>}
      </div>
      {onSkip && (
        <button type="button" onClick={onSkip} className="text-xs text-muted-foreground underline">
          Skip for now
        </button>
      )}
    </div>
  );
}

function Single({
  label, options, value, onChange, helper, skippable,
}: {
  label: string; options: string[]; value: string | null;
  onChange: (v: string | null) => void; helper?: string; skippable?: boolean;
}) {
  return (
    <div>
      <FieldLabel helper={helper} onSkip={skippable ? () => onChange(null) : undefined}>{label}</FieldLabel>
      <select
        className="w-full rounded-sm border border-border bg-white px-3 py-3 text-sm text-foreground focus:outline-2 focus:outline-ring"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Multi({
  label, options, values, onChange, max, skippable,
}: {
  label: string; options: string[]; values: string[];
  onChange: (v: string[]) => void; max?: number; skippable?: boolean;
}) {
  const toggle = (o: string) => {
    if (values.includes(o)) onChange(values.filter((v) => v !== o));
    else {
      if (max && values.length >= max) {
        toast.message(`Pick your top ${max}.`);
        return;
      }
      onChange([...values, o]);
    }
  };
  return (
    <div>
      <FieldLabel onSkip={skippable ? () => onChange([]) : undefined}>
        {label}{max ? ` · ${values.length}/${max}` : ""}
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={
                "rounded-full border px-3 py-1.5 text-xs transition " +
                (on
                  ? "border-navy-deep bg-navy-deep text-paper"
                  : "border-border bg-paper text-navy-deep hover:bg-stone")
              }
            >
              {o}
            </button>
          );
        })}
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-gilt/10 px-2.5 py-0.5 text-xs text-navy-deep">
              {v}
              <button type="button" onClick={() => toggle(v)} aria-label={`Remove ${v}`}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={
        "relative h-7 w-12 rounded-full transition " +
        (value ? "bg-navy-deep" : "bg-stone")
      }
      aria-pressed={value}
    >
      <span
        className={
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition " +
          (value ? "left-[22px]" : "left-0.5")
        }
      />
    </button>
  );
}
