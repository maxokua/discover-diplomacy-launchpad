import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { browseCandidates } from "@/lib/profile.functions";
import { myPortalRoles, getEmployerCreditBalance } from "@/lib/payments.functions";
import { Lock, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employer/browse")({
  head: () => ({ meta: [{ title: "Browse Candidates | Discover Diplomacy" }] }),
  component: BrowsePage,
});

type Row = {
  user_id: string;
  headline: string | null;
  target_roles: string[] | null;
  skills: string[] | null;
  languages: unknown;
  regions: string[] | null;
  sectors: string[] | null;
  experience_level: string | null;
  education: unknown;
  updated_at: string;
  pile: "paid" | "free";
  tier: string | null;
};

const REGIONS = [
  "North America", "Latin America & Caribbean", "Europe", "Eurasia & Russia",
  "MENA", "Sub-Saharan Africa", "South Asia", "East Asia", "Southeast Asia",
  "Pacific", "Global",
];
const SECTORS = [
  "Diplomacy / Foreign service", "Multilateral / UN system", "Development / Aid",
  "Humanitarian", "Security & defense", "Human rights", "Trade & economics",
  "Climate & environment", "Global health", "Education", "Tech policy",
  "Think tank / Research", "Private sector — international",
];

function BrowsePage() {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [pile, setPile] = useState<"all" | "paid" | "free">("all");
  const [skill, setSkill] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const roles = await myPortalRoles();
      if (!roles.employer && !roles.admin) {
        setAllowed(false);
        return;
      }
      setAllowed(true);
      try {
        const b = await getEmployerCreditBalance();
        setBalance(b.balance);
      } catch {/* ignore */}
    })();
  }, []);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setLoading(true);
    browseCandidates({ data: { q, pile, skill, region, sector } as never }).then((r) => {
      if (cancelled) return;
      if ("error" in r) toast.error(r.error);
      else setRows(r.rows as Row[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [allowed, q, pile, skill, region, sector]);

  const paidCount = useMemo(() => rows.filter((r) => r.pile === "paid").length, [rows]);
  const freeCount = rows.length - paidCount;

  if (allowed === false) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10">
          <Lock className="mx-auto h-10 w-10 text-navy-deep" />
          <h1 className="mt-4 font-display text-3xl text-navy-deep">
            Employer access required
          </h1>
          <p className="mt-3 text-muted-foreground">
            Browsing the candidate pool is available to verified employers.
          </p>
          <Link
            to="/employers/apply"
            className="mt-6 inline-flex rounded-sm bg-navy-deep px-5 py-3 text-sm font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            Apply for access
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (allowed === null) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">Loading…</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Employer Portal</div>
              <h1 className="mt-2 font-display text-3xl text-navy-deep lg:text-5xl">
                Browse candidates
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                You see skills, regions, sectors, and background. To see the
                resume and contact info, unlock with a credit on the resume
                view.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Credit balance
              </div>
              <div className="font-display text-2xl text-navy-deep">
                {balance ?? "—"}
              </div>
              <Link
                to="/employer/credits/checkout"
                className="mt-1 inline-block text-xs text-navy-deep underline"
              >
                Buy credits
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input
              className="border border-border bg-white px-3 py-2 text-sm"
              placeholder="Search headline, skill, or role"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="border border-border bg-white px-3 py-2 text-sm"
              value={pile}
              onChange={(e) => setPile(e.target.value as typeof pile)}
            >
              <option value="all">All piles</option>
              <option value="paid">Member Pile only</option>
              <option value="free">Open Pile only</option>
            </select>
            <input
              className="border border-border bg-white px-3 py-2 text-sm"
              placeholder="Filter by skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
            <select
              className="border border-border bg-white px-3 py-2 text-sm"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">All regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              className="border border-border bg-white px-3 py-2 text-sm"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            >
              <option value="">All sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          {loading ? (
            <div>Loading…</div>
          ) : rows.length === 0 ? (
            <div className="border border-dashed border-border bg-paper p-10 text-center text-muted-foreground">
              No candidates match those filters yet.
            </div>
          ) : (
            <>
              {paidCount > 0 && (
                <PileHeader
                  label="Member Pile"
                  count={paidCount}
                  note="Compass & Envoy members. Surfaced first."
                  accent
                />
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows
                  .filter((r) => r.pile === "paid")
                  .map((r) => (
                    <CandidateCard key={r.user_id} row={r} />
                  ))}
              </div>

              {freeCount > 0 && (
                <PileHeader label="Open Pile" count={freeCount} note="Free-account candidates." />
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows
                  .filter((r) => r.pile === "free")
                  .map((r) => (
                    <CandidateCard key={r.user_id} row={r} />
                  ))}
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function PileHeader({
  label,
  count,
  note,
  accent,
}: {
  label: string;
  count: number;
  note: string;
  accent?: boolean;
}) {
  return (
    <div className="mb-4 mt-8 flex items-center gap-3 first:mt-0">
      {accent && <Star className="h-4 w-4 text-gilt" />}
      <div className="font-display text-xl text-navy-deep">{label}</div>
      <div className="text-xs text-muted-foreground">
        {count} · {note}
      </div>
    </div>
  );
}

function CandidateCard({ row }: { row: Row }) {
  return (
    <div className="flex h-full flex-col border border-border bg-paper p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {row.experience_level ?? "—"}
        </div>
        {row.pile === "paid" && (
          <span className="rounded-full bg-gilt/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-deep">
            Member
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-lg text-navy-deep">
        {row.headline || "Candidate"}
      </div>
      {(row.target_roles ?? []).length > 0 && (
        <div className="mt-1 text-xs text-muted-foreground">
          Targeting: {(row.target_roles ?? []).slice(0, 3).join(" · ")}
        </div>
      )}
      {(row.skills ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {(row.skills ?? []).slice(0, 6).map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-stone/50 px-2 py-0.5 text-[11px] text-navy-deep"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <div>
          <div className="uppercase tracking-wider">Regions</div>
          <div className="text-navy-deep/80">{(row.regions ?? []).join(", ") || "—"}</div>
        </div>
        <div>
          <div className="uppercase tracking-wider">Sectors</div>
          <div className="text-navy-deep/80">{(row.sectors ?? []).join(", ") || "—"}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Lock className="h-3 w-3" /> Resume & contact require a credit
        </span>
        <Link
          to="/employer/resumes"
          className="text-navy-deep underline"
        >
          Unlock
        </Link>
      </div>
    </div>
  );
}
