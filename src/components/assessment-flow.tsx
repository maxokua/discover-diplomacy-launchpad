import { useMemo, useState } from "react";
import {
  QUESTIONS,
  QUESTION_KEYS,
  type AssessmentAnswers,
  type QuestionKey,
  EMPTY_ANSWERS,
} from "@/lib/assessment-shared";

const MENTOR = "DD · your mentor";

type Props = {
  initialAnswers?: Partial<AssessmentAnswers>;
  intro?: string;
  ctaLabel?: string;
  allowDeferAfterIndex?: number; // show "Finish later" starting at this question index (0-based)
  onDefer?: (partial: AssessmentAnswers) => void;
  onComplete: (answers: AssessmentAnswers) => void | Promise<void>;
  submitting?: boolean;
};

export function AssessmentFlow({
  initialAnswers,
  intro,
  ctaLabel = "Build my map",
  allowDeferAfterIndex,
  onDefer,
  onComplete,
  submitting,
}: Props) {
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    ...EMPTY_ANSWERS,
    ...(initialAnswers ?? {}),
  });
  const [idx, setIdx] = useState(0);

  const total = QUESTIONS.length;
  const q = QUESTIONS[idx];
  const progress = Math.round(((idx) / total) * 100);

  const isMulti = !!q.multi;
  const current = (answers as any)[q.key] as string | string[];
  const canAdvance = useMemo(() => {
    if (isMulti) return Array.isArray(current) && current.length > 0;
    return typeof current === "string" && current.length > 0;
  }, [current, isMulti]);

  function setAnswer(k: QuestionKey, v: string | string[]) {
    setAnswers((a) => ({ ...a, [k]: v } as AssessmentAnswers));
  }

  function toggleMulti(opt: string) {
    if (!q.multi) return;
    const cur = (current as string[]) ?? [];
    const has = cur.includes(opt);
    let next: string[];
    if (has) next = cur.filter((x) => x !== opt);
    else next = cur.length >= q.multi.max ? [...cur.slice(1), opt] : [...cur, opt];
    setAnswer(q.key, next);
  }

  const showDefer =
    typeof allowDeferAfterIndex === "number" &&
    idx >= allowDeferAfterIndex &&
    idx < total - 1 &&
    !!onDefer;

  function advance() {
    if (idx < total - 1) setIdx(idx + 1);
    else onComplete(answers);
  }

  const reaction =
    (q.reactions && typeof current === "string" && q.reactions[current]) ||
    (canAdvance ? q.defaultReaction : "");

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span>Question {idx + 1} of {total}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone">
          <div
            className="h-full bg-navy-deep transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {idx === 0 && intro && (
        <div className="mb-6 rounded-lg border border-border bg-paper p-5 text-sm leading-relaxed text-navy-deep">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gilt">
            {MENTOR}
          </div>
          {intro}
        </div>
      )}

      <div className="rounded-xl border border-border bg-paper p-6 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gilt">
          {MENTOR}
        </div>
        <h2 className="mt-3 font-display text-2xl text-navy-deep">{q.prompt}</h2>
        {q.helper && <p className="mt-2 text-sm text-muted-foreground">{q.helper}</p>}

        <div className="mt-5 grid gap-2">
          {q.options.map((opt) => {
            const selected = isMulti
              ? Array.isArray(current) && current.includes(opt)
              : current === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => (isMulti ? toggleMulti(opt) : setAnswer(q.key, opt))}
                className={
                  "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors " +
                  (selected
                    ? "border-navy-deep bg-navy-deep text-paper"
                    : "border-border bg-paper text-navy-deep hover:border-navy-deep")
                }
              >
                {opt}
              </button>
            );
          })}
        </div>

        {reaction && (
          <div className="mt-5 rounded-md border border-gilt/30 bg-gilt/5 px-4 py-3 text-sm italic text-navy-deep">
            {reaction}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-navy-deep disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={advance}
            disabled={!canAdvance || submitting}
            className="rounded-md bg-navy-deep px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy-deep/90 disabled:opacity-40"
          >
            {idx === total - 1 ? (submitting ? "Building…" : ctaLabel) : "Next →"}
          </button>
        </div>
      </div>

      {showDefer && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => onDefer!(answers)}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-navy-deep"
          >
            Finish later — save what I've done and take me to the dashboard
          </button>
        </div>
      )}
    </div>
  );
}
