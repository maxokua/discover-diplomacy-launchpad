import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardProfile } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/_authenticated/dashboard/coaching/$coachId")({
  head: () => ({ meta: [{ title: "Coach | Discover Diplomacy" }] }),
  loader: async ({ params }) => {
    const [profile, coachRes] = await Promise.all([
      getDashboardProfile(),
      (supabase as any)
        .from("coaches")
        .select(
          "id, slug, name, title, background, specialties, languages, price_per_session_cents, is_sample",
        )
        .eq("slug", params.coachId)
        .maybeSingle(),
    ]);
    if (!coachRes.data) throw notFound();
    return { profile, coach: coachRes.data as {
      id: string; slug: string; name: string; title: string; background: string;
      specialties: string[]; languages: string[]; price_per_session_cents: number; is_sample: boolean;
    } };
  },
  component: CoachDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-navy-deep">Coach not found</h1>
      <Link to="/dashboard/coaching" className="mt-4 inline-block text-sm text-gilt underline">
        ← Back to coaching
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-navy-deep">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function CoachDetail() {
  const { profile, coach } = Route.useLoaderData();
  const isEnvoy = profile.plan === "envoy";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <Link to="/dashboard/coaching" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-navy-deep">
        ← Back to coaches
      </Link>

      {coach.is_sample && (
        <div className="mt-4 inline-block rounded-sm bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900">
          Sample Profile
        </div>
      )}

      <header className="mt-4">
        <h1 className="font-display text-4xl text-navy-deep">{coach.name}</h1>
        <div className="mt-2 text-sm text-muted-foreground">{coach.title}</div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,320px]">
        <div>
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
              Background
            </h2>
            <p className="mt-3 text-base leading-relaxed text-navy-deep">{coach.background}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
              Specialties
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {coach.specialties.map((s: string) => (
                <span key={s} className="rounded-sm border border-border bg-stone px-2.5 py-1 text-sm text-navy-deep">
                  {s}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
              Languages
            </h2>
            <p className="mt-3 text-sm text-navy-deep">{coach.languages.join(" · ")}</p>
          </section>
        </div>

        <aside className="rounded-xl border border-border bg-paper p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Session
          </div>
          <div className="mt-2 font-display text-3xl text-navy-deep">
            {isEnvoy ? (
              <span className="text-gilt">Included</span>
            ) : (
              <>${(coach.price_per_session_cents / 100).toFixed(0)}</>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {isEnvoy ? "2 sessions/month · Envoy plan" : "60-minute working session"}
          </div>

          <button
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-md bg-navy-deep/40 px-4 py-3 text-xs font-medium uppercase tracking-wider text-paper"
          >
            Booking opens soon
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            We're finalizing calendar integrations. You'll be able to book directly here in the
            next release.
          </p>
        </aside>
      </div>
    </div>
  );
}
