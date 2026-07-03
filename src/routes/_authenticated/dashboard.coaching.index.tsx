import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardProfile } from "@/lib/onboarding.functions";

type Coach = {
  id: string;
  slug: string;
  name: string;
  title: string;
  background: string;
  specialties: string[];
  languages: string[];
  price_per_session_cents: number;
  is_sample: boolean;
  sort_order: number;
};

export const Route = createFileRoute("/_authenticated/dashboard/coaching/")({
  head: () => ({ meta: [{ title: "Coaching | Discover Diplomacy" }] }),
  loader: async () => {
    const [profile, coachesRes] = await Promise.all([
      getDashboardProfile(),
      (supabase as any)
        .from("coaches")
        .select(
          "id, slug, name, title, background, specialties, languages, price_per_session_cents, is_sample, sort_order",
        )
        .order("sort_order", { ascending: true }),
    ]);
    const coaches: Coach[] = (coachesRes.data ?? []) as Coach[];
    return { profile, coaches };
  },
  component: CoachingIndex,
});

function CoachingIndex() {
  const data = Route.useLoaderData() as { profile: { plan: string; full_name: string | null; email: string | null }; coaches: Coach[] };
  const { profile, coaches } = data;
  const isEnvoy = profile.plan === "envoy";
  const anySamples = coaches.some((c: Coach) => c.is_sample);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
        Coaching
      </div>
      <h1 className="mt-3 font-display text-4xl text-navy-deep">Vetted insider coaches</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Every coach here has actually worked in the roles you're targeting — Foreign Service
        officers, UN P-staff, think tank hiring managers, private-sector advisors. Pick the
        conversation you actually need.
      </p>

      <div className="mt-4 inline-flex rounded-full border border-gilt/40 bg-gilt/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gilt">
        {isEnvoy ? "Envoy: 2 sessions/month included" : "Compass & Free: per-session pricing"}
      </div>

      {anySamples && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <strong>Admin note:</strong> Sample coach profiles are visible for layout review. Replace
          with real vetted coaches before launch.
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {coaches.map((c: Coach) => (
          <CoachCard key={c.id} coach={c} isEnvoy={isEnvoy} />
        ))}
      </div>
    </div>
  );
}

function CoachCard({ coach, isEnvoy }: { coach: Coach; isEnvoy: boolean }) {
  return (
    <Link
      to="/dashboard/coaching/$coachId"
      params={{ coachId: coach.slug }}
      className="group flex flex-col rounded-xl border border-border bg-paper p-5 transition-all hover:border-navy-deep hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <IllustratedAvatar seed={coach.slug} />
        <div className="min-w-0 flex-1">
          {coach.is_sample && (
            <span className="inline-block rounded-sm bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-900">
              Sample Profile
            </span>
          )}
          <div className="mt-1 font-display text-lg leading-tight text-navy-deep">{coach.name}</div>
          <div className="text-xs text-muted-foreground">{coach.title}</div>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm text-navy-deep/80">{coach.background}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {coach.specialties.slice(0, 3).map((s) => (
          <span key={s} className="rounded-sm border border-border bg-stone px-2 py-0.5 text-[11px] text-navy-deep">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="text-sm text-navy-deep">
          {isEnvoy ? (
            <span className="font-medium text-gilt">Included · Envoy</span>
          ) : (
            <span>
              <span className="font-medium">${(coach.price_per_session_cents / 100).toFixed(0)}</span>
              <span className="text-muted-foreground"> / session</span>
            </span>
          )}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-navy-deep group-hover:text-gilt">
          View →
        </span>
      </div>
    </Link>
  );
}

/** Simple deterministic geometric avatar based on slug hash. */
function IllustratedAvatar({ seed }: { seed: string }) {
  const hash = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  const palettes = [
    ["#0E1E36", "#C8A24A"],
    ["#1F2838", "#2E6FB0"],
    ["#15233D", "#C8A24A"],
    ["#0E1E36", "#2E6FB0"],
  ];
  const [bg, fg] = palettes[hash % palettes.length];
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
      style={{ background: bg }}
      aria-hidden="true"
    >
      <div className="h-6 w-6 rounded-full" style={{ background: fg }} />
    </div>
  );
}
