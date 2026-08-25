import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AssessmentFlow } from "@/components/assessment-flow";
import {
  computeArchetypeKey,
  ARCHETYPES,
  QUESTIONS,
  type AssessmentAnswers,
  EMPTY_ANSWERS,
} from "@/lib/assessment-shared";
import {
  getDashboardProfile,
  importPriorAssessment,
  saveOnboarding,
} from "@/lib/onboarding.functions";

export const Route = createFileRoute("/_authenticated/welcome")({
  head: () => ({ meta: [{ title: "Welcome | Discover Diplomacy" }] }),
  loader: () => getDashboardProfile(),
  component: WelcomePage,
});

type Screen = "loading" | "import-confirm" | "flow" | "done";

function WelcomePage() {
  const profile = Route.useLoaderData();
  const navigate = useNavigate();
  const importFn = useServerFn(importPriorAssessment);
  const saveFn = useServerFn(saveOnboarding);

  const [screen, setScreen] = useState<Screen>(profile.onboarding_complete ? "done" : "loading");
  const [imported, setImported] = useState<AssessmentAnswers | null>(null);
  const [importedArchetype, setImportedArchetype] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [archetypeShown, setArchetypeShown] = useState<string | null>(null);

  // If already complete, bounce to dashboard.
  useEffect(() => {
    if (profile.onboarding_complete) {
      navigate({ to: "/dashboard" });
    }
  }, [profile.onboarding_complete, navigate]);

  // Try to import prior public-assessment answers on mount.
  useEffect(() => {
    if (profile.onboarding_complete) return;
    // If we already have partial answers on the profile, use those.
    if (profile.assessment_answers && (profile.assessment_answers as any).q2_sector) {
      setImported({ ...EMPTY_ANSWERS, ...(profile.assessment_answers as any) });
      setScreen("import-confirm");
      return;
    }
    importFn({})
      .then((res) => {
        if (res.imported) {
          setImported({ ...EMPTY_ANSWERS, ...(res.answers as any) });
          setImportedArchetype(res.archetype);
          setScreen("import-confirm");
        } else {
          setScreen("flow");
        }
      })
      .catch(() => setScreen("flow"));
  }, []);

  async function completeWith(answers: AssessmentAnswers) {
    setSubmitting(true);
    try {
      const key = computeArchetypeKey(answers);
      const title = ARCHETYPES[key]?.title ?? null;
      await saveFn({ data: { answers, archetype: title, complete: true } });
      setArchetypeShown(title);
      setScreen("done");
      setTimeout(() => navigate({ to: "/dashboard" }), 1400);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setSubmitting(false);
    }
  }

  async function deferWith(partial: AssessmentAnswers) {
    setSubmitting(true);
    try {
      await saveFn({ data: { answers: partial, archetype: null, complete: false } });
      toast.success("Saved. Finish setup any time from your dashboard.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
        {screen === "loading" && (
          <div className="rounded-xl border border-border bg-paper p-8 text-center text-sm text-muted-foreground">
            Preparing your setup…
          </div>
        )}

        {screen === "import-confirm" && imported && (
          <ImportConfirm
            answers={imported}
            archetype={importedArchetype}
            onConfirm={() => completeWith(imported)}
            onEdit={() => setScreen("flow")}
            submitting={submitting}
          />
        )}

        {screen === "flow" && (
          <AssessmentFlow
            initialAnswers={imported ?? undefined}
            intro="Before I can build your map, I need to know where you are. 10 quick questions."
            ctaLabel="Build my dashboard"
            allowDeferAfterIndex={3}
            onDefer={deferWith}
            onComplete={completeWith}
            submitting={submitting}
          />
        )}

        {screen === "done" && (
          <div className="rounded-xl border border-border bg-paper p-10 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
              Setup complete
            </div>
            <div className="mt-3 font-display text-3xl text-navy-deep">
              {archetypeShown ?? profile.archetype
                ? `You're on the ${archetypeShown ?? profile.archetype} track.`
                : "You're all set."}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Taking you to your dashboard…</p>
            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-md bg-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper"
            >
              Go now →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ImportConfirm({
  answers,
  archetype,
  onConfirm,
  onEdit,
  submitting,
}: {
  answers: AssessmentAnswers;
  archetype: string | null;
  onConfirm: () => void;
  onEdit: () => void;
  submitting?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-paper p-6 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gilt">
        DD · your mentor
      </div>
      <h2 className="mt-3 font-display text-2xl text-navy-deep">
        Here's what you told me — still accurate?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        I pulled these in from your public assessment. Confirm and I'll skip you straight to your
        dashboard.
      </p>

      {archetype && (
        <div className="mt-4 inline-flex rounded-full border border-gilt/40 bg-gilt/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gilt">
          Your track: {archetype}
        </div>
      )}

      <dl className="mt-6 divide-y divide-border rounded-lg border border-border">
        {QUESTIONS.map((q) => {
          const v = (answers as any)[q.key];
          const display = Array.isArray(v) ? v.join(", ") : v || "—";
          return (
            <div key={q.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px,1fr]">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{q.prompt}</dt>
              <dd className="text-sm text-navy-deep">{display}</dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="rounded-md bg-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy-deep/90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Yes — take me to my dashboard"}
        </button>
        <button
          onClick={onEdit}
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
        >
          Edit my answers
        </button>
      </div>
    </div>
  );
}
