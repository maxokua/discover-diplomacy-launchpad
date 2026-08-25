import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getDashboardProfile,
  getPlanProgress,
  togglePlanTask,
  type DashboardProfile,
} from "@/lib/onboarding.functions";
import {
  ARCHETYPES,
  answersCompletion,
  computePlan,
  type AssessmentAnswers,
} from "@/lib/assessment-shared";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "My Map | Discover Diplomacy" }] }),
  loader: async () => {
    const [profile, progress] = await Promise.all([
      getDashboardProfile(),
      getPlanProgress(),
    ]);
    return { profile, progress };
  },
  component: MyMapPage,
});

function MyMapPage() {
  const { profile, progress } = Route.useLoaderData();
  const router = useRouter();
  const answers = profile.assessment_answers as AssessmentAnswers | null;
  const completion = answersCompletion(answers);
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of progress) map[`${p.phase}:${p.task_index}`] = p.checked;
    return map;
  });
  const toggle = useServerFn(togglePlanTask);

  async function onCheck(phase: "p1" | "p2" | "p3", task_index: number) {
    const key = `${phase}:${task_index}`;
    const next = !checks[key];
    setChecks((c) => ({ ...c, [key]: next }));
    try {
      await toggle({ data: { phase, task_index, checked: next } });
    } catch (err) {
      setChecks((c) => ({ ...c, [key]: !next }));
      toast.error(err instanceof Error ? err.message : "Couldn't save");
    }
  }

  const firstName = profile.full_name?.split(" ")[0];
  const hasAnswers = !!answers && !!answers.q2_sector;
  const plan = hasAnswers && answers ? computePlan(answers) : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
      {completion < 100 && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gilt/40 bg-gilt/5 px-5 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
              Setup {completion}% complete
            </div>
            <p className="mt-1 text-sm text-navy-deep">
              Your map is {completion}% built — finish setup so I can sharpen every recommendation.
            </p>
          </div>
          <Link
            to="/welcome"
            className="rounded-md bg-navy-deep px-4 py-2 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy-deep/90"
          >
            Finish setup
          </Link>
        </div>
      )}

      <header className="mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
          Your Map
        </div>
        <h1 className="mt-3 font-display text-4xl text-navy-deep lg:text-5xl">
          {firstName ? `${firstName}, ` : ""}
          {profile.archetype
            ? <>you're on the <em className="not-italic text-gilt">{profile.archetype}</em> track.</>
            : "welcome to your dashboard."}
        </h1>
        {plan && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {plan.summary}
          </p>
        )}
      </header>

      {plan ? (
        <>
          {/* Primary path */}
          <section className="mb-12">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Your primary path
            </div>
            <PathCard path={plan.primary} accent />
          </section>

          {/* 90-day plan */}
          <section className="mb-12">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-2xl text-navy-deep">Your 90-day plan</h2>
              <div className="text-xs text-muted-foreground">Check items as you finish them.</div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <PhaseCard title="Days 0–30" phase="p1" tasks={plan.days0to30} checks={checks} onCheck={onCheck} />
              <PhaseCard title="Days 30–60" phase="p2" tasks={plan.days30to60} checks={checks} onCheck={onCheck} />
              <PhaseCard title="Days 60–90" phase="p3" tasks={plan.days60to90} checks={checks} onCheck={onCheck} />
            </div>
          </section>

          {/* This week */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-2xl text-navy-deep">This week</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <WeekTile title="New matches" body="Fresh opportunities matching your primary path will surface here." />
              <WeekTile title="Latest brief" body="Your Wednesday intel digest will land here as soon as it publishes." />
              <WeekTile title="Next plan action" body={plan.days0to30[0]} />
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-paper p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Your map builds from your setup answers. Finish the 10 questions to see your archetype
            and 90-day plan.
          </p>
          <Link
            to="/welcome"
            className="mt-6 inline-block rounded-md bg-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy-deep/90"
          >
            Start setup
          </Link>
        </div>
      )}
    </div>
  );
}

function PathCard({ path, accent }: { path: ReturnType<typeof computePlan>["primary"]; accent?: boolean }) {
  return (
    <div className={"mt-3 rounded-xl border p-6 " + (accent ? "border-navy-deep bg-navy-deep text-paper" : "border-border bg-paper text-navy-deep")}>
      <div className="font-display text-2xl">{path.title}</div>
      <p className={"mt-3 text-sm leading-relaxed " + (accent ? "text-paper/80" : "text-muted-foreground")}>
        {path.why}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className={"text-[10px] font-semibold uppercase tracking-[0.22em] " + (accent ? "text-paper/60" : "text-muted-foreground")}>
            Example roles
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {path.exampleRoles.map((r) => <li key={r}>• {r}</li>)}
          </ul>
        </div>
        <div>
          <div className={"text-[10px] font-semibold uppercase tracking-[0.22em] " + (accent ? "text-paper/60" : "text-muted-foreground")}>
            Example employers
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {path.exampleEmployers.map((r) => <li key={r}>• {r}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-5">
        <a
          href={path.directoryHref}
          className={"inline-block rounded-md px-4 py-2 text-xs font-medium uppercase tracking-wider " + (accent ? "bg-paper text-navy-deep hover:bg-paper/90" : "bg-navy-deep text-paper hover:bg-navy-deep/90")}
        >
          Browse matching directory →
        </a>
      </div>
    </div>
  );
}

function PhaseCard({
  title,
  phase,
  tasks,
  checks,
  onCheck,
}: {
  title: string;
  phase: "p1" | "p2" | "p3";
  tasks: string[];
  checks: Record<string, boolean>;
  onCheck: (phase: "p1" | "p2" | "p3", i: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-paper p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gilt">{title}</div>
      <ul className="mt-3 space-y-3">
        {tasks.map((t, i) => {
          const key = `${phase}:${i}`;
          const done = !!checks[key];
          return (
            <li key={i} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={done}
                onChange={() => onCheck(phase, i)}
                className="mt-1 h-4 w-4 shrink-0 accent-navy-deep"
              />
              <span className={"text-sm leading-relaxed " + (done ? "text-muted-foreground line-through" : "text-navy-deep")}>
                {t}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WeekTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-paper p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </div>
      <p className="mt-2 text-sm text-navy-deep">{body}</p>
    </div>
  );
}
