import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Share2, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import {
  generateAssessment,
  type AssessmentAnswers,
  type AssessmentPlan,
} from "@/lib/assessment.functions";
import {
  computePlan as computeSharedPlan,
  type AssessmentAnswers as SharedAnswers,
} from "@/lib/assessment-shared";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Career Assessment — Discover Diplomacy" },
      {
        name: "description",
        content:
          "A 3-minute conversation with a mentor. Get a personalized map into diplomacy, policy, multilaterals, development, and global business.",
      },
      { property: "og:title", content: "Career Assessment — Discover Diplomacy" },
      {
        property: "og:description",
        content: "3 minutes. 10 questions. Your personalized career map in global affairs.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/assessment" },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/assessment" }],
  }),
  component: AssessmentPage,
});

// -----------------------------------------------------------------------------
// Question definitions (10 counted + name warm-up + email)
// -----------------------------------------------------------------------------

type QKey =
  | "name"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10"
  | "email";

const COUNTED_ORDER: QKey[] = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
const STEPS: QKey[] = ["name", ...COUNTED_ORDER, "email"];

const MENTOR = "Your mentor · DD";

type Question = {
  prompt: string;
  helper?: string;
  options?: string[];
  multi?: { max: number };
  reactions?: Record<string, string>;
  defaultReaction?: string;
};

const Q: Record<Exclude<QKey, "name" | "email">, Question> = {
  q1: {
    prompt: "Where are you in your journey?",
    options: [
      "Undergrad (1st–2nd year)",
      "Undergrad (3rd–4th year)",
      "Grad student",
      "Working, early career",
      "Switching into this field",
    ],
    defaultReaction: "Got it — that shapes what I'd have you do first.",
  },
  q2: {
    prompt: "Which world pulls you the most?",
    options: [
      "Representing my country (diplomacy & foreign service)",
      "Shaping policy ideas (think tanks & research)",
      "Global institutions (UN & multilaterals)",
      "Mission-driven fieldwork (NGOs & development)",
      "Global business & risk (private sector)",
    ],
    defaultReaction: "That's the anchor for your primary path.",
  },
  q3: {
    prompt: "What kind of work makes you lose track of time?",
    options: [
      "Researching & writing",
      "Building relationships & persuading",
      "Running projects & operations",
      "Data & analysis",
      "Communicating to audiences",
    ],
    defaultReaction: "Noted — I'll flavor your roles around that.",
  },
  q4: {
    prompt: "Which issues do you follow in your free time?",
    helper: "Pick up to 2.",
    options: [
      "Security & defense",
      "Trade & economics",
      "Climate & energy",
      "Tech policy",
      "Human rights & humanitarian",
    ],
    multi: { max: 2 },
    defaultReaction: "Those are useful signals for niching down.",
  },
  q5: {
    prompt: "Where would you actually move for the right role?",
    options: [
      "Washington DC",
      "New York",
      "Anywhere in the US",
      "Abroad (Geneva, Brussels, field posts)",
      "I need remote-flexible",
    ],
    defaultReaction: "Location changes which employers are realistic. Good to know.",
  },
  q6: {
    prompt: "Choose your trade-off:",
    options: [
      "Prestige track, slower advancement",
      "Small org, big responsibility now",
      "Stability & clear structure",
      "Highest-impact work, even if unglamorous",
      "Best compensation available",
    ],
    defaultReaction: "That helps me rank paths, not just list them.",
  },
  q7: {
    prompt: "What's your timeline?",
    options: [
      "Applying right now",
      "This coming cycle (3–6 months)",
      "Next year",
      "Exploring, no rush",
    ],
    reactions: {
      "Applying right now": "Then we're compressing this. I'll put deadlines in phase 1.",
    },
    defaultReaction: "Good — that sets the pace of your plan.",
  },
  q8: {
    prompt: "Which of these do you already have?",
    helper: "Select all that apply.",
    options: [
      "Second language (professional)",
      "Quant or data skills",
      "Published or professional writing",
      "International living or work experience",
      "Still building",
    ],
    multi: { max: 5 },
    defaultReaction: "That changes what your resume should lead with.",
  },
  q9: {
    prompt: "Are you authorized to work in the U.S.?",
    helper: "Only used to match you to eligible roles — never shared.",
    options: [
      "U.S. citizen",
      "Green card or work-authorized",
      "International student (visa)",
      "Prefer not to say",
    ],
    reactions: {
      "International student (visa)":
        "Got it — I'll steer you away from anything that requires citizenship.",
    },
    defaultReaction: "Thanks — I'll filter for what's actually open to you.",
  },
  q10: {
    prompt: "What's the biggest thing standing between you and the job?",
    options: [
      "I don't know what roles exist",
      "My resume & materials",
      "No network in this field",
      "Interviews & assessments",
      "Getting seen by employers",
    ],
    defaultReaction: "That's the piece I'll build the plan around.",
  },
};

// -----------------------------------------------------------------------------
// Answers state
// -----------------------------------------------------------------------------

type LocalAnswers = {
  name: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string[];
  q5: string;
  q6: string;
  q7: string;
  q8: string[];
  q9: string;
  q10: string;
};

const EMPTY: LocalAnswers = {
  name: "",
  q1: "",
  q2: "",
  q3: "",
  q4: [],
  q5: "",
  q6: "",
  q7: "",
  q8: [],
  q9: "",
  q10: "",
};

// -----------------------------------------------------------------------------
// Archetype logic — shared with onboarding/dashboard via assessment-shared.
// -----------------------------------------------------------------------------

function computePlan(ans: LocalAnswers): AssessmentPlan {
  const shared: SharedAnswers = {
    q1_stage: ans.q1,
    q2_sector: ans.q2,
    q3_function: ans.q3,
    q4_issues: ans.q4,
    q5_location: ans.q5,
    q6_tradeoff: ans.q6,
    q7_timeline: ans.q7,
    q8_skills: ans.q8,
    q9_work_auth: ans.q9,
    q10_obstacle: ans.q10,
  };
  return computeSharedPlan(shared);
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

function AssessmentPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<LocalAnswers>(EMPTY);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<AssessmentPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [retryingEmail, setRetryingEmail] = useState(false);
  const lastPayload = useRef<{
    email: string;
    consentNewsletter: boolean;
    answers: AssessmentAnswers;
    plan: AssessmentPlan;
  } | null>(null);

  const generate = useServerFn(generateAssessment);
  const step = STEPS[stepIdx];

  // Progress: only count Q1–Q10
  const countedIdx = COUNTED_ORDER.indexOf(step as any);
  const questionNumber = countedIdx >= 0 ? countedIdx + 1 : step === "name" ? 0 : 10;
  const percent = Math.round((Math.max(0, questionNumber - (step === "email" ? 0 : 1)) / 10) * 100);
  const showCounter = step !== "name" && step !== "email";

  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [stepIdx]);

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
      const localPlan = computePlan(answers);
      const payloadAnswers: AssessmentAnswers = {
        name: answers.name,
        q1_stage: answers.q1,
        q2_sector: answers.q2,
        q3_work: answers.q3,
        q4_issues: answers.q4,
        q5_location: answers.q5,
        q6_tradeoff: answers.q6,
        q7_timeline: answers.q7,
        q8_have: answers.q8,
        q9_authorization: answers.q9 as AssessmentAnswers["q9_authorization"],
        q10_blocker: answers.q10,
      };
      const payload = {
        email: email.trim(),
        consentNewsletter: true,
        answers: payloadAnswers,
        plan: localPlan,
      };
      lastPayload.current = payload;
      const result = await generate({ data: payload });
      setPlan(result?.plan ?? localPlan);
      if (result && (!result.persisted || !result.emailed)) {
        setEmailNotice(
          result.emailed
            ? null
            : "Your map is ready below — we couldn't email a copy just yet. You can retry from the results page.",
        );
      } else {
        setEmailNotice(null);
      }
    } catch (e) {
      console.error("[assessment] submit failed", e);
      const msg = e instanceof Error ? e.message : "";
      setError(
        msg.includes("hourly limit")
          ? msg
          : "Something glitched on our side — your answers are still here. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function retryEmail() {
    if (!lastPayload.current || retryingEmail) return;
    setRetryingEmail(true);
    try {
      const result = await generate({ data: lastPayload.current });
      if (result?.emailed) {
        setEmailNotice(null);
      } else {
        setEmailNotice("Still couldn't send the email — please try again in a few minutes.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setEmailNotice(
        msg.includes("hourly limit")
          ? "Too many attempts from this network — please try again in an hour."
          : "Still couldn't send the email — please try again in a few minutes.",
      );
    } finally {
      setRetryingEmail(false);
    }
  }

  function reset() {
    setPlan(null);
    setStepIdx(0);
    setAnswers(EMPTY);
    setEmail("");
    setError(null);
    setEmailNotice(null);
    lastPayload.current = null;
  }

  if (plan) {
    return (
      <SiteLayout>
        <ResultsView
          plan={plan}
          answers={answers}
          email={email}
          onRestart={reset}
          emailNotice={emailNotice}
          onRetryEmail={retryEmail}
          retryingEmail={retryingEmail}
        />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16 lg:px-10">
          <div className="eyebrow flex items-center gap-2 text-emerald">
            <Sparkles className="h-3.5 w-3.5" /> 3-minute assessment
          </div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Find your path in global affairs.
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            A short conversation with a mentor. A personalized career map at the end. No generic advice.
          </p>
        </div>
      </section>

      <section className="bg-stone">
        <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-14">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>
                {showCounter
                  ? `Question ${questionNumber} of 10`
                  : step === "name"
                    ? "Warm-up"
                    : "Almost done"}
              </span>
              <span>
                {step === "email"
                  ? "100%"
                  : showCounter
                    ? `${Math.round(((questionNumber - 1) / 10) * 100)}%`
                    : "0%"}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden bg-border">
              <div
                className="h-full bg-navy-deep transition-all duration-500 ease-out"
                style={{
                  width: `${
                    step === "email"
                      ? 100
                      : showCounter
                        ? ((questionNumber - 1) / 10) * 100
                        : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Chat transcript */}
          <div
            ref={transcriptRef}
            className="max-h-[60vh] overflow-y-auto border border-border bg-paper p-5 lg:p-8 space-y-5 shadow-sm"
          >
            {STEPS.slice(0, stepIdx + 1).map((s, i) => (
              <Turn
                key={s}
                stepKey={s}
                answers={answers}
                email={email}
                isCurrent={i === stepIdx}
                prevKey={i > 0 ? STEPS[i - 1] : null}
              />
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
// Chat "turn"
// -----------------------------------------------------------------------------

function reactionFor(prevKey: QKey | null, answers: LocalAnswers): string | null {
  if (!prevKey || prevKey === "name" || prevKey === "email") {
    if (prevKey === "name" && answers.name) return `Nice to meet you, ${answers.name}. Let's do this.`;
    return null;
  }
  const q = Q[prevKey as Exclude<QKey, "name" | "email">];
  const chosen =
    prevKey === "q4" || prevKey === "q8"
      ? (answers[prevKey] as string[])[0]
      : (answers[prevKey] as string);
  if (!chosen) return null;
  if (q.reactions && q.reactions[chosen]) return q.reactions[chosen];
  return q.defaultReaction ?? null;
}

function Turn({
  stepKey,
  answers,
  email,
  isCurrent,
  prevKey,
}: {
  stepKey: QKey;
  answers: LocalAnswers;
  email: string;
  isCurrent: boolean;
  prevKey: QKey | null;
}) {
  const prompt = promptFor(stepKey, answers);
  const helper = stepKey !== "name" && stepKey !== "email" ? Q[stepKey].helper : undefined;
  const answerSummary = summarize(stepKey, answers, email);
  const reaction = reactionFor(prevKey, answers);

  return (
    <div className="space-y-3">
      {reaction && (
        <div className="flex gap-3">
          <Avatar dim />
          <p className="mt-1 text-xs italic text-muted-foreground">{reaction}</p>
        </div>
      )}
      <div className="flex gap-3">
        <Avatar />
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald">
            {MENTOR}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-navy-deep whitespace-pre-line">{prompt}</p>
          {helper && <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>}
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

function Avatar({ dim = false }: { dim?: boolean }) {
  return (
    <div
      className={
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs " +
        (dim ? "bg-muted text-muted-foreground" : "bg-navy-deep text-paper")
      }
    >
      DD
    </div>
  );
}

function promptFor(step: QKey, a: LocalAnswers): string {
  if (step === "name") return "Before we start — what should I call you?";
  if (step === "email") {
    const name = a.name ? `${a.name}, ` : "";
    return `${name}drop your email and I'll build your map.`;
  }
  return Q[step].prompt;
}

function summarize(step: QKey, a: LocalAnswers, email: string): string | null {
  switch (step) {
    case "name":
      return a.name || null;
    case "q4":
      return a.q4.length ? a.q4.join(" · ") : null;
    case "q8":
      return a.q8.length ? a.q8.join(" · ") : null;
    case "email":
      return email || null;
    default:
      return (a[step] as string) || null;
  }
}

// -----------------------------------------------------------------------------
// Active input
// -----------------------------------------------------------------------------

function StepInput(props: {
  step: QKey;
  answers: LocalAnswers;
  setAnswers: (u: (a: LocalAnswers) => LocalAnswers) => void;
  email: string;
  setEmail: (s: string) => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const { step, answers, setAnswers, email, setEmail, onNext, onSubmit, submitting, error } = props;

  if (step === "name") {
    return (
      <div className="space-y-3">
        <input
          autoFocus
          type="text"
          value={answers.name}
          onChange={(e) => setAnswers((a) => ({ ...a, name: e.target.value }))}
          placeholder="First name"
          maxLength={80}
          className="w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
          onKeyDown={(e) => {
            if (e.key === "Enter" && answers.name.trim()) onNext();
          }}
        />
        <PrimaryNext onClick={onNext} disabled={!answers.name.trim()}>
          Start
        </PrimaryNext>
      </div>
    );
  }

  if (step === "email") {
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
          We'll email a copy of your plan. Unsubscribe anytime.
        </p>
        {error && (
          <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
        <button
          onClick={onSubmit}
          disabled={submitting || !/^\S+@\S+\.\S+$/.test(email)}
          className="inline-flex w-full items-center justify-center gap-2 bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper transition-colors hover:bg-navy disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Building your map…
            </>
          ) : (
            <>
              Get my map <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  const q = Q[step];
  const isMulti = !!q.multi;

  if (isMulti) {
    const values = answers[step as "q4" | "q8"];
    const max = q.multi!.max;
    return (
      <ChipsMulti
        options={q.options!}
        values={values}
        max={max}
        onToggle={(v) =>
          setAnswers((a) => {
            const cur = a[step as "q4" | "q8"];
            if (cur.includes(v)) {
              return { ...a, [step]: cur.filter((x) => x !== v) };
            }
            if (cur.length >= max) return a;
            return { ...a, [step]: [...cur, v] };
          })
        }
        onNext={onNext}
      />
    );
  }

  return (
    <ChipsSingle
      options={q.options!}
      value={answers[step as "q1"] as string}
      onPick={(v) => {
        setAnswers((a) => ({ ...a, [step]: v }));
        setTimeout(onNext, 250);
      }}
    />
  );
}

function PrimaryNext({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
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

function ChipsSingle({
  options,
  value,
  onPick,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
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
  max,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  onNext: () => void;
  max: number;
}) {
  const canNext = values.length >= 1;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = values.includes(o);
          const disabled = !active && values.length >= max;
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              disabled={disabled}
              className={
                "inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs transition-colors " +
                (active
                  ? "border-navy-deep bg-navy-deep text-paper"
                  : "border-border bg-paper text-navy-deep hover:border-navy-deep disabled:opacity-30")
              }
            >
              {active && <Check className="h-3 w-3" />} {o}
            </button>
          );
        })}
      </div>
      <PrimaryNext onClick={onNext} disabled={!canNext}>
        Continue
      </PrimaryNext>
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
  emailNotice,
  onRetryEmail,
  retryingEmail,
}: {
  plan: AssessmentPlan;
  answers: LocalAnswers;
  email: string;
  onRestart: () => void;
  emailNotice?: string | null;
  onRetryEmail?: () => void;
  retryingEmail?: boolean;
}) {
  const [shared, setShared] = useState(false);
  const name = answers.name || "friend";
  const shareText = useMemo(
    () => `I'm on the ${plan.archetype} track — Discover Diplomacy mapped my next 90 days. Find yours →`,
    [plan.archetype],
  );

  async function shareArchetype() {
    const url = "https://discoverdiplomacy.org/assessment";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Discover Diplomacy", text: shareText, url });
        setShared(true);
        return;
      } catch {
        /* fallthrough */
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setShared(true);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-14 lg:py-20 lg:px-10">
          <div className="eyebrow text-emerald">Your map</div>
          <h1 className="mt-3 font-display text-4xl text-navy-deep lg:text-5xl">
            {name}, here's your map.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-navy-deep/85">{plan.summary}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            {emailNotice ? (
              <>
                You're on the <strong>{plan.archetype}</strong> track.
              </>
            ) : (
              <>
                A copy has been sent to {email}. You're on the{" "}
                <strong>{plan.archetype}</strong> track.
              </>
            )}
          </p>
          {emailNotice && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border border-gilt/40 bg-gilt/10 px-4 py-3">
              <p className="text-xs text-navy-deep">{emailNotice}</p>
              {onRetryEmail && (
                <button
                  onClick={onRetryEmail}
                  disabled={retryingEmail}
                  className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-navy-deep underline hover:text-emerald disabled:opacity-50"
                >
                  {retryingEmail && <Loader2 className="h-3 w-3 animate-spin" />}
                  {retryingEmail ? "Sending…" : "Retry email"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Primary path */}
      <section className="bg-stone">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16 lg:px-10">
          <div className="eyebrow mb-3 text-emerald">Your primary path</div>
          <PathCard path={plan.primary} featured />
        </div>
      </section>

      {/* Adjacent paths */}
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16 lg:px-10">
          <div className="eyebrow mb-3">Also worth exploring</div>
          <div className="grid gap-5 md:grid-cols-2">
            {plan.adjacent.map((p) => (
              <PathCard key={p.title} path={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 90-day plan */}
      <section className="bg-stone">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16 lg:px-10">
          <div className="eyebrow mb-3 text-emerald">Your 90-day plan</div>
          <h2 className="font-display text-2xl text-navy-deep lg:text-3xl">
            What I'd have you do next.
          </h2>
          <div className="mt-8 space-y-6">
            <Phase label="Days 0–30" items={plan.days0to30} />
            <Phase label="Days 30–60" items={plan.days30to60} />
            <Phase label="Days 60–90" items={plan.days60to90} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-14 lg:py-20 lg:px-10 text-center">
          <h2 className="font-display text-3xl text-navy-deep lg:text-4xl">
            Want this plan tracked, not just read?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Compass is the members' toolkit: your plan, the directory, the digest, the AI resume score, and the community — all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-navy-deep px-8 py-4 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Start Compass — your plan, tracked <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/booking"
              className="text-xs uppercase tracking-wider text-navy-deep underline hover:text-emerald"
            >
              Or book a single session with a vetted coach →
            </Link>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <button
              onClick={shareArchetype}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
            >
              <Share2 className="h-3.5 w-3.5" />
              {shared ? "Copied — share your track" : "Share your result"}
            </button>
            <div className="mt-3 text-[11px] text-muted-foreground">
              Only your track name is shared. Your answers stay private.
            </div>
          </div>

          <button
            onClick={onRestart}
            className="mt-10 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
          >
            Retake assessment
          </button>
        </div>
      </section>
    </>
  );
}

function PathCard({
  path,
  featured = false,
}: {
  path: AssessmentPlan["primary"];
  featured?: boolean;
}) {
  return (
    <div
      className={
        "flex h-full flex-col border p-6 lg:p-8 " +
        (featured ? "border-navy-deep bg-paper shadow-md" : "border-border bg-paper")
      }
    >
      <h3
        className={
          "font-display text-navy-deep " + (featured ? "text-2xl lg:text-3xl" : "text-xl")
        }
      >
        {path.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-navy-deep/85">{path.why}</p>

      <div className="mt-5 space-y-3 text-xs">
        <div>
          <div className="font-semibold uppercase tracking-wider text-emerald">Example roles</div>
          <div className="mt-1 text-navy-deep/80">{path.exampleRoles.join(" · ")}</div>
        </div>
        <div>
          <div className="font-semibold uppercase tracking-wider text-emerald">
            Target employers
          </div>
          <div className="mt-1 text-navy-deep/80">{path.exampleEmployers.join(", ")}</div>
        </div>
      </div>

      {path.directoryHref && (
        <a
          href={path.directoryHref}
          className={
            "mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider " +
            (featured
              ? "self-start bg-navy-deep px-4 py-2.5 text-paper hover:bg-navy"
              : "text-navy-deep hover:text-emerald")
          }
        >
          See live {path.title} opportunities <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

function Phase({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="border-l-2 border-navy-deep pl-5">
      <div className="font-display text-sm font-semibold uppercase tracking-wider text-navy-deep">
        {label}
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-deep/85">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-emerald">→</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
