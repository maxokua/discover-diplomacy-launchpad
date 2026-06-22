import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Download, Loader2, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { generateAssessment, type AssessmentPlan } from "@/lib/assessment.functions";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Career Assessment — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Take a 2-minute conversational assessment and get a personalized career plan for diplomacy, international policy, multilateral institutions, and global business.",
      },
      { property: "og:title", content: "Career Assessment — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Get a personalized 90-day action plan for your career in global affairs in under 2 minutes.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/assessment" },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/assessment" }],
  }),
  component: AssessmentPage,
});

// -----------------------------------------------------------------------------
// Question definitions
// -----------------------------------------------------------------------------

type StepKey = "intro" | "interests" | "stage" | "blocker" | "nonNegotiables" | "strengths" | "network" | "contact";

const INTERESTS = [
  "Diplomacy & foreign service",
  "International policy & think tanks",
  "Development & humanitarian",
  "Multilateral institutions (UN/WB/IMF)",
  "Global business & geoeconomics",
  "National security & intelligence",
];

const STAGES = [
  "Undergraduate student",
  "Graduate student",
  "Early-career (0–3 yrs)",
  "Mid-career transition",
  "Career changer from another field",
];

const BLOCKERS = [
  "I need clarity on what I actually want",
  "I know what I want — I can't break in",
  "I'm transitioning sectors",
  "My resume isn't landing interviews",
  "I need interview / case prep",
];

const NON_NEGOTIABLES = [
  "Stay in current city",
  "Open to relocation (DC/NY/Geneva/etc.)",
  "Salary $80k+",
  "Salary $120k+",
  "Mission-driven only",
  "Need security clearance path",
  "Remote-friendly",
];

const NETWORK = [
  "Almost none — starting from scratch",
  "A few contacts in the field",
  "Solid network, need to activate it",
  "Strong network, need a strategy",
];

const STEPS: StepKey[] = ["intro", "interests", "stage", "blocker", "nonNegotiables", "strengths", "network", "contact"];

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

type Answers = {
  name: string;
  interests: string[];
  stage: string;
  blocker: string;
  nonNegotiables: string[];
  strengths: string;
  network: string;
};

function AssessmentPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    name: "",
    interests: [],
    stage: "",
    blocker: "",
    nonNegotiables: [],
    strengths: "",
    network: "",
  });
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<AssessmentPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useServerFn(generateAssessment);
  const step = STEPS[stepIdx];
  const progress = Math.round(((stepIdx + (plan ? 1 : 0)) / STEPS.length) * 100);

  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [stepIdx, plan]);

  function next() {
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIdx((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const { plan } = await generate({
        data: {
          email: email.trim(),
          consentNewsletter: consent,
          answers,
        },
      });
      setPlan(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setPlan(null);
    setStepIdx(0);
    setAnswers({ name: "", interests: [], stage: "", blocker: "", nonNegotiables: [], strengths: "", network: "" });
    setEmail("");
    setConsent(true);
    setError(null);
  }

  // ---------- Results view ----------
  if (plan) {
    return (
      <SiteLayout>
        <ResultsView plan={plan} answers={answers} email={email} onRestart={reset} />
      </SiteLayout>
    );
  }

  // ---------- Stepper view ----------
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16 lg:px-10">
          <div className="eyebrow flex items-center gap-2 text-emerald">
            <Sparkles className="h-3.5 w-3.5" /> 2-minute assessment
          </div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Find your path in global affairs.
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            A short conversation. A personalized career map. No generic advice.
          </p>
        </div>
      </section>

      <section className="bg-stone">
        <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-14">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>Step {Math.min(stepIdx + 1, STEPS.length)} of {STEPS.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden bg-border">
              <div className="h-full bg-navy-deep transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Chat transcript */}
          <div
            ref={transcriptRef}
            className="max-h-[60vh] overflow-y-auto border border-border bg-paper p-5 lg:p-8 space-y-5 shadow-sm"
          >
            {STEPS.slice(0, stepIdx + 1).map((s, i) => (
              <Turn key={s} stepKey={s} answers={answers} email={email} isCurrent={i === stepIdx} />
            ))}
          </div>

          {/* Active input */}
          <div className="mt-5 border border-border bg-paper p-5 lg:p-6">
            <StepInput
              step={step}
              answers={answers}
              setAnswers={setAnswers}
              email={email}
              setEmail={setEmail}
              consent={consent}
              setConsent={setConsent}
              onNext={next}
              onSubmit={submit}
              submitting={submitting}
              error={error}
            />

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={back}
                disabled={stepIdx === 0 || submitting}
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-navy-deep disabled:opacity-30"
              >
                ← Back
              </button>
              <div className="text-[11px] text-muted-foreground">
                Your responses are private. We never share or sell your data.
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

// -----------------------------------------------------------------------------
// Chat "turn" — the mentor question + your answer summary
// -----------------------------------------------------------------------------

function Turn({
  stepKey,
  answers,
  email,
  isCurrent,
}: {
  stepKey: StepKey;
  answers: Answers;
  email: string;
  isCurrent: boolean;
}) {
  const question = QUESTIONS[stepKey];
  const answerSummary = summarize(stepKey, answers, email);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar />
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald">Your mentor</div>
          <p className="mt-1 text-sm leading-relaxed text-navy-deep whitespace-pre-line">{question}</p>
        </div>
      </div>
      {!isCurrent && answerSummary && (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-sm bg-navy-deep px-4 py-2.5 text-sm text-paper">
            {answerSummary}
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-deep text-paper font-display text-xs">
      DD
    </div>
  );
}

const QUESTIONS: Record<StepKey, string> = {
  intro:
    "Hi — I'm here to help you figure out your path in global affairs. We'll go through 6 quick questions (about 2 minutes), then I'll put together a real plan for you.\n\nFirst — what should I call you?",
  interests: "Which areas pull you the most? Pick any that apply.",
  stage: "Where are you right now in your career?",
  blocker: "What's the real thing in your way today? Be honest.",
  nonNegotiables: "Any non-negotiables I should know about? Pick what's true.",
  strengths:
    "Tell me about your background — degrees, languages, internships, work, or anything you're known for. A sentence or two is plenty.",
  network: "How's your network in this space?",
  contact:
    "All set. Drop your email and I'll generate your personalized career plan right now — and send you a copy you can keep.",
};

function summarize(step: StepKey, a: Answers, email: string): string | null {
  switch (step) {
    case "intro":
      return a.name ? a.name : null;
    case "interests":
      return a.interests.length ? a.interests.join(" · ") : null;
    case "stage":
      return a.stage || null;
    case "blocker":
      return a.blocker || null;
    case "nonNegotiables":
      return a.nonNegotiables.length ? a.nonNegotiables.join(" · ") : "None";
    case "strengths":
      return a.strengths ? (a.strengths.length > 120 ? a.strengths.slice(0, 117) + "…" : a.strengths) : null;
    case "network":
      return a.network || null;
    case "contact":
      return email || null;
  }
}

// -----------------------------------------------------------------------------
// Active input area
// -----------------------------------------------------------------------------

function StepInput(props: {
  step: StepKey;
  answers: Answers;
  setAnswers: (u: (a: Answers) => Answers) => void;
  email: string;
  setEmail: (s: string) => void;
  consent: boolean;
  setConsent: (b: boolean) => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const { step, answers, setAnswers, email, setEmail, consent, setConsent, onNext, onSubmit, submitting, error } = props;

  switch (step) {
    case "intro":
      return (
        <div>
          <input
            autoFocus
            value={answers.name}
            onChange={(e) => setAnswers((a) => ({ ...a, name: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && answers.name.trim() && onNext()}
            placeholder="Your first name"
            className="w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
          />
          <PrimaryNext onClick={onNext} disabled={!answers.name.trim()}>Start</PrimaryNext>
        </div>
      );

    case "interests":
      return (
        <ChipsMulti
          options={INTERESTS}
          values={answers.interests}
          onToggle={(v) =>
            setAnswers((a) => ({
              ...a,
              interests: a.interests.includes(v) ? a.interests.filter((x) => x !== v) : [...a.interests, v],
            }))
          }
          onNext={onNext}
          minRequired={1}
        />
      );

    case "stage":
      return (
        <ChipsSingle
          options={STAGES}
          value={answers.stage}
          onPick={(v) => {
            setAnswers((a) => ({ ...a, stage: v }));
            setTimeout(onNext, 200);
          }}
        />
      );

    case "blocker":
      return (
        <ChipsSingle
          options={BLOCKERS}
          value={answers.blocker}
          onPick={(v) => {
            setAnswers((a) => ({ ...a, blocker: v }));
            setTimeout(onNext, 200);
          }}
        />
      );

    case "nonNegotiables":
      return (
        <ChipsMulti
          options={NON_NEGOTIABLES}
          values={answers.nonNegotiables}
          onToggle={(v) =>
            setAnswers((a) => ({
              ...a,
              nonNegotiables: a.nonNegotiables.includes(v)
                ? a.nonNegotiables.filter((x) => x !== v)
                : [...a.nonNegotiables, v],
            }))
          }
          onNext={onNext}
          allowEmpty
        />
      );

    case "strengths":
      return (
        <div>
          <textarea
            autoFocus
            value={answers.strengths}
            onChange={(e) => setAnswers((a) => ({ ...a, strengths: e.target.value }))}
            placeholder="e.g. BA in IR from American, conversational French, State Dept summer internship, three years in nonprofit comms…"
            rows={4}
            maxLength={600}
            className="w-full resize-none border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
          />
          <div className="mt-1 text-right text-[11px] text-muted-foreground">{answers.strengths.length}/600</div>
          <PrimaryNext onClick={onNext}>Continue</PrimaryNext>
        </div>
      );

    case "network":
      return (
        <ChipsSingle
          options={NETWORK}
          value={answers.network}
          onPick={(v) => {
            setAnswers((a) => ({ ...a, network: v }));
            setTimeout(onNext, 200);
          }}
        />
      );

    case "contact":
      return (
        <div className="space-y-4">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
          />
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Send me occasional opportunity briefings from Discover Diplomacy. Unsubscribe anytime.
            </span>
          </label>
          {error && <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
          <button
            onClick={onSubmit}
            disabled={submitting || !/^\S+@\S+\.\S+$/.test(email)}
            className="inline-flex w-full items-center justify-center gap-2 bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper transition-colors hover:bg-navy disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Building your plan…
              </>
            ) : (
              <>
                Generate my plan <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      );
  }
}

function PrimaryNext({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-4 inline-flex items-center gap-2 bg-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper transition-colors hover:bg-navy disabled:opacity-40"
    >
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

function ChipsSingle({ options, value, onPick }: { options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onPick(o)}
            className={
              "border px-3.5 py-2 text-xs transition-colors " +
              (active
                ? "border-navy-deep bg-navy-deep text-paper"
                : "border-border bg-paper text-navy-deep hover:border-navy-deep")
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function ChipsMulti({
  options,
  values,
  onToggle,
  onNext,
  minRequired,
  allowEmpty,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  onNext: () => void;
  minRequired?: number;
  allowEmpty?: boolean;
}) {
  const canNext = allowEmpty || values.length >= (minRequired ?? 1);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = values.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={
                "inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs transition-colors " +
                (active
                  ? "border-navy-deep bg-navy-deep text-paper"
                  : "border-border bg-paper text-navy-deep hover:border-navy-deep")
              }
            >
              {active && <Check className="h-3 w-3" />} {o}
            </button>
          );
        })}
      </div>
      <PrimaryNext onClick={onNext} disabled={!canNext}>Continue</PrimaryNext>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Results
// -----------------------------------------------------------------------------

function ResultsView({
  plan,
  answers,
  email,
  onRestart,
}: {
  plan: AssessmentPlan;
  answers: Answers;
  email: string;
  onRestart: () => void;
}) {
  function handleDownload() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <>
      <section className="border-b border-border bg-paper print:border-0">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:py-14 lg:px-10">
          <div className="eyebrow text-emerald">Your personalized plan</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            {answers.name ? `${answers.name}, here's your map.` : "Here's your map."}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-deep/80">{plan.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-navy-deep hover:text-paper"
            >
              Schedule a free consultation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={onRestart}
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
            >
              Retake assessment
            </button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground print:hidden">
            We've emailed your plan to <span className="font-medium text-navy-deep">{email}</span>. Check spam if you don't see it within a few minutes.
          </p>
        </div>
      </section>

      {/* Paths */}
      <section className="bg-stone print:bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16 lg:px-10">
          <SectionHeader eyebrow="Recommended paths" title="Three directions that fit you" />
          <div className="mt-6 grid gap-px bg-border md:grid-cols-3">
            {plan.paths.map((p, i) => (
              <div key={i} className="flex h-full flex-col bg-paper p-6">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald">Path 0{i + 1}</div>
                <h3 className="mt-2 font-display text-lg text-navy-deep">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-deep/80">{p.why}</p>
                <div className="mt-5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Example roles</div>
                  <ul className="mt-2 space-y-1 text-sm text-navy-deep">
                    {p.exampleRoles.map((r) => <li key={r}>· {r}</li>)}
                  </ul>
                </div>
                <div className="mt-5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Target employers</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.exampleEmployers.map((e) => (
                      <span key={e} className="border border-border bg-stone px-2 py-0.5 text-[11px] text-navy-deep">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 90 day plan */}
      <section className="border-t border-border bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16 lg:px-10">
          <SectionHeader eyebrow="90-day action plan" title="What to do, in order" />
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <PlanBucket label="Days 0–30" items={plan.ninetyDayPlan.days0to30} />
            <PlanBucket label="Days 30–60" items={plan.ninetyDayPlan.days30to60} />
            <PlanBucket label="Days 60–90" items={plan.ninetyDayPlan.days60to90} />
          </div>
        </div>
      </section>

      {/* Networking + Resume */}
      <section className="border-t border-border bg-stone print:bg-paper">
        <div className="mx-auto grid max-w-4xl gap-px bg-border px-6 py-12 md:grid-cols-2 lg:py-16 lg:px-10">
          <ListBlock title="Networking strategy" items={plan.networkingStrategy} />
          <ListBlock title="Resume updates" items={plan.resumeUpdates} />
        </div>
      </section>

      {/* Tier recommendation */}
      <section className="border-t border-border bg-navy-deep text-paper print:bg-paper print:text-navy-deep">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16 lg:px-10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald">Recommended for you</div>
          <h2 className="mt-3 font-display text-2xl lg:text-3xl">{plan.recommendedTier}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper/80 print:text-navy-deep/80">{plan.tierRationale}</p>
          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-paper px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-paper/90"
            >
              See {plan.recommendedTier} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-paper/40 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper hover:border-paper"
            >
              Talk to a coach first
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald">{eyebrow}</div>
      <h2 className="mt-2 font-display text-2xl text-navy-deep lg:text-3xl">{title}</h2>
    </div>
  );
}

function PlanBucket({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="border border-border bg-paper p-5">
      <div className="font-display text-base text-navy-deep">{label}</div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-deep/85">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="text-emerald">→</span><span>{it}</span></li>
        ))}
      </ul>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-paper p-6">
      <div className="font-display text-lg text-navy-deep">{title}</div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-deep/85">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="text-emerald">·</span><span>{it}</span></li>
        ))}
      </ul>
    </div>
  );
}
