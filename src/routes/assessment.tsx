import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
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

type StepKey = "interests" | "stage" | "blocker" | "nonNegotiables" | "network" | "email";

const INTERESTS = [
  "Diplomacy & foreign service",
  "International policy & think tanks",
  "Development & humanitarian",
  "Multilateral institutions (UN/WB/IMF)",
  "Global business & geoeconomics",
];

const STAGES = [
  "Undergraduate student",
  "Graduate student",
  "Early-career (0–3 yrs)",
  "Mid-career transition",
  "Career changer",
];

const BLOCKERS = [
  "I need clarity on what I want",
  "I know what I want — can't break in",
  "I'm transitioning sectors",
  "My resume isn't landing interviews",
  "I need interview / case prep",
];

const NON_NEGOTIABLES = [
  "Open to relocation (DC/NY/Geneva)",
  "Salary $80k+",
  "Mission-driven only",
  "Remote-friendly",
  "None of the above",
];

const NETWORK = [
  "Almost none — starting from scratch",
  "A few contacts in the field",
  "Solid network, need to activate it",
  "Strong network, need a strategy",
];

const STEPS: StepKey[] = ["interests", "stage", "blocker", "nonNegotiables", "network", "email"];

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
  interests: "Which area of global affairs pulls you the most?",
  stage: "Where are you right now in your career?",
  blocker: "What's the real thing in your way today?",
  nonNegotiables: "Any non-negotiables I should know about?",
  network: "How's your network in this space?",
  email: "Drop your email and I'll generate your personalized plan.",
};

function summarize(step: StepKey, a: Answers, email: string): string | null {
  switch (step) {
    case "interests":
      return a.interests.length ? a.interests.join(" · ") : null;
    case "stage":
      return a.stage || null;
    case "blocker":
      return a.blocker || null;
    case "nonNegotiables":
      return a.nonNegotiables.length ? a.nonNegotiables.join(" · ") : "None";
    case "network":
      return a.network || null;
    case "email":
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

    case "email":
      return (
        <div className="space-y-3">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
          />
          <p className="text-[11px] text-muted-foreground">
            We'll email a copy of your plan and occasional opportunity briefings. Unsubscribe anytime.
          </p>
          <input type="hidden" value={consent ? "1" : "0"} onChange={() => setConsent(true)} />
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
                Get my results <ArrowRight className="h-4 w-4" />
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
  const archetype = plan.recommendedTier;
  const directoryFilter = answers.interests[0] ?? "";
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24 lg:px-10 text-center">
        <div className="eyebrow text-emerald">Your archetype</div>
        <h1 className="mt-3 font-display text-4xl text-navy-deep lg:text-5xl">
          {plan.paths[0]?.title ?? archetype}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-navy-deep/80">{plan.summary}</p>
        <p className="mt-4 text-[11px] text-muted-foreground">
          A copy of this has been sent to {email}.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            to="/directory"
            search={{ area: directoryFilter }}
            className="inline-flex w-full items-center justify-center gap-2 bg-navy-deep px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            See opportunities matched to your path <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/waitlist"
            search={{ interest: "compass" }}
            className="inline-flex w-full items-center justify-center gap-2 border border-navy-deep px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-navy-deep hover:text-paper"
          >
            Start Compass
          </Link>
        </div>

        <button
          onClick={onRestart}
          className="mt-8 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
        >
          Retake assessment
        </button>
      </div>
    </section>
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
