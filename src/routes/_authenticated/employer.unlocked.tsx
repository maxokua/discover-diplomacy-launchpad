import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { ProfileCard } from "@/components/profile-card";
import { listUnlockedCandidates } from "@/lib/unlock-flow.functions";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employer/unlocked")({
  head: () => ({ meta: [{ title: "My Unlocked Candidates | Discover Diplomacy" }] }),
  component: UnlockedListPage,
});

type Row = Record<string, unknown> & {
  user_id: string;
  unlocked_at: string;
  intro_status: string | null;
  anon_label: string;
};

function UnlockedListPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    listUnlockedCandidates()
      .then((r) => setRows(((r.rows ?? []) as unknown) as Row[]))
      .catch(() => setRows([]));
  }, []);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="eyebrow">Employer Portal</div>
          <h1 className="mt-2 font-display text-3xl text-navy-deep lg:text-4xl">
            My unlocked candidates
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Candidates you&apos;ve already spent a credit to unlock. Re-opening is free.
          </p>
        </div>
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          {rows === null ? (
            <div className="border border-dashed border-border bg-paper p-10 text-center text-muted-foreground">
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="border border-dashed border-border bg-paper p-10 text-center text-muted-foreground">
              You haven&apos;t unlocked anyone yet.{" "}
              <Link to="/employer/browse" className="underline">Browse candidates</Link>.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((r) => (
                <div key={r.user_id} className="relative">
                  <div className="absolute right-3 top-3 z-10">
                    <IntroBadge status={r.intro_status} />
                  </div>
                  <ProfileCard p={r as never} />
                  <Link
                    to="/employer/unlocked/$candidateId"
                    params={{ candidateId: r.user_id }}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1 border border-t-0 border-border bg-paper px-4 py-3 text-xs font-semibold text-navy-deep underline"
                  >
                    <Lock className="h-3 w-3" /> Open full profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function IntroBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Intro pending", cls: "bg-stone text-navy-deep/80" },
    accepted: { label: "Intro accepted", cls: "bg-gilt/30 text-navy-deep" },
    connected: { label: "Connected", cls: "bg-gilt/30 text-navy-deep" },
    declined: { label: "Declined", cls: "bg-stone text-muted-foreground" },
    closed: { label: "Closed", cls: "bg-stone text-muted-foreground" },
  };
  const v = map[status] ?? { label: status, cls: "bg-stone text-navy-deep/80" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${v.cls}`}>
      {v.label}
    </span>
  );
}
