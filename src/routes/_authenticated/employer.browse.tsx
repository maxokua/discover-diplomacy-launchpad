import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { ProfileCard } from "@/components/profile-card";
import {
  marketplaceBrowse,
  toggleShortlist,
  employerStats,
} from "@/lib/marketplace.functions";
import {
  myPortalRoles,
  getEmployerCreditBalance,
} from "@/lib/payments.functions";
import { unlockCandidate } from "@/lib/unlock-flow.functions";
import { ChevronDown, Lock, Star, X, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employer/browse")({
  head: () => ({ meta: [{ title: "Browse Candidates | Discover Diplomacy" }] }),
  component: BrowsePage,
});

// ── Option lists (must mirror profile builder) ─────────────────────────────
const YEARS = ["0–1", "1–2", "3–5", "6–10", "11–15", "15+"];
const CAREER_STAGE = ["Entry-level", "Mid-level", "Senior", "Leadership"];
const DEGREE = ["Bachelor's", "Master's", "PhD", "Professional (JD/MD/etc.)", "Other"];
const MANAGEMENT = ["None", "Led 1–3 people", "Led 4–10 people", "Led 10+ people"];
const BUDGET = ["Under $100K", "$100K–$500K", "$500K–$2M", "$2M+", "Not applicable"];
const ORG_TYPES = [
  "NGO", "Multilateral Organization", "Government/Bilateral", "Think Tank",
  "Foundation", "Private Sector", "Academic/Research", "UN System", "Social Enterprise",
];
const FUNCTIONS = [
  "Research", "Monitoring & Evaluation", "Program Management", "Policy Analysis",
  "Communications", "Fundraising/Grants", "Data Analysis", "Advocacy",
  "Partnerships", "Operations", "Fieldwork", "Project Design",
];
const THEMES = [
  "Climate/Environment", "Development", "Trade/Economics", "Security/Conflict",
  "Human Rights", "Health", "Education", "Migration", "Governance", "Gender",
  "Tech Policy", "Humanitarian",
];
const TECH = [
  "Excel", "Stata", "R", "Python", "GIS", "SQL", "Salesforce", "Tableau",
  "SPSS", "Qualitative methods", "Quantitative methods",
];
const LANGUAGES = [
  "English", "Spanish", "French", "Arabic", "Mandarin Chinese", "Portuguese",
  "German", "Japanese", "Russian", "Swahili", "Hindi",
];
const PROFICIENCY = ["Beginner", "Intermediate", "Fluent", "Native"] as const;
const REGIONS = [
  "North America", "Latin America", "Europe", "Middle East/North Africa",
  "Sub-Saharan Africa", "South Asia", "East/Southeast Asia", "Oceania",
];
const ELIGIBILITY = ["United States", "European Union", "United Kingdom", "Canada", "Australia", "Other"];
const RELOCATION = ["Yes — anywhere", "Yes — select regions", "No / Remote only"];
const WORK_MODE = ["Remote", "Hybrid", "Onsite", "Open"];
const AVAILABILITY = ["Immediately", "2–4 weeks", "1–3 months", "3–6 months", "Flexible"];
const WORK_TYPE = ["Full-time", "Part-time", "Contract", "Consulting", "Internship/Fellowship"];
const ROLES = [
  "Analyst", "Officer", "Coordinator", "Specialist", "Advisor", "Consultant",
  "Manager", "Director", "Researcher", "Communications",
];
const SALARY = ["Under $40K", "$40–60K", "$60–80K", "$80–100K", "$100–130K", "$130K+", "Flexible"];
const CLEARANCE = ["None", "Public Trust", "Secret", "Top Secret", "TS/SCI", "Other country"];
const FELLOWSHIP = ["None", "Fulbright", "Rhodes/Marshall/Mitchell", "Truman/Pickering/Rangel", "Boren", "Other"];

type FilterState = {
  q: string;
  pile: "all" | "paid" | "free";
  sort: "match" | "recent" | "experience";
  career_stage: string[];
  years_experience: string[];
  years_intl: string[];
  highest_degree: string[];
  management_experience: string[];
  budget_responsibility: string[];
  org_types: string[];
  functional_skills: string[];
  primary_theme: string[];
  secondary_themes: string[];
  technical_skills: string[];
  languages: string[];
  min_language_level: (typeof PROFICIENCY)[number] | "";
  current_base: string[];
  work_eligibility: string[];
  relocation: string[];
  work_mode: string[];
  availability: string[];
  work_type: string[];
  roles_seeking: string[];
  target_sectors: string[];
  salary_expectation: string[];
  security_clearance: string[];
  fellowship_category: string[];
  ai_tags: string[];
};

const EMPTY_FILTERS: FilterState = {
  q: "", pile: "all", sort: "match",
  career_stage: [], years_experience: [], years_intl: [], highest_degree: [],
  management_experience: [], budget_responsibility: [],
  org_types: [], functional_skills: [], primary_theme: [], secondary_themes: [], technical_skills: [],
  languages: [], min_language_level: "",
  current_base: [], work_eligibility: [], relocation: [], work_mode: [], availability: [], work_type: [],
  roles_seeking: [], target_sectors: [], salary_expectation: [],
  security_clearance: [], fellowship_category: [], ai_tags: [],
};

type Row = Record<string, unknown> & {
  user_id: string;
  pile: "paid" | "free";
  shortlisted: boolean;
  anon_label: string;
  updated_at: string;
};

function BrowsePage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [verification, setVerification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [balance, setBalance] = useState<number | null>(null);
  const [stats, setStats] = useState<{ shortlistCount: number; unlockedThisMonth: number } | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<Row | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // Access gate
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
        setTier((b as { tier?: string | null }).tier ?? null);
      } catch {/* ignore */}
      try {
        const s = await employerStats();
        setStats(s);
      } catch {/* ignore */}
    })();
  }, []);

  // Debounced fetch on filter change
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      marketplaceBrowse({ data: { ...filters, log: true } as never })
        .then((r) => {
          if (cancelled) return;
          if ("error" in r) {
            if ("verified" in r && r.verified === false) {
              setVerification("pending");
            } else {
              toast.error(r.error);
            }
            setRows([]);
          } else {
            setRows(r.rows as Row[]);
          }
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [allowed, filters]);

  const activeChips = useMemo(() => collectChips(filters), [filters]);
  const paidCount = useMemo(() => rows.filter((r) => r.pile === "paid").length, [rows]);
  const freeCount = rows.length - paidCount;
  const isPaidEmployerTier = tier !== null && tier !== "free";

  const onToggleShortlist = useCallback(async (row: Row) => {
    const add = !row.shortlisted;
    setRows((rs) => rs.map((r) => (r.user_id === row.user_id ? { ...r, shortlisted: add } : r)));
    const r = await toggleShortlist({ data: { candidate_id: row.user_id, add } });
    if ("error" in r) {
      toast.error(r.error);
      setRows((rs) => rs.map((x) => (x.user_id === row.user_id ? { ...x, shortlisted: !add } : x)));
    } else if (add) {
      toast.success("Added to shortlist");
    }
  }, []);

  const saveNote = useCallback(async (row: Row, note: string) => {
    const r = await toggleShortlist({ data: { candidate_id: row.user_id, add: true, note } });
    if ("error" in r) toast.error(r.error);
    else toast.success("Note saved");
  }, []);

  const onUnlockClick = useCallback(
    (row: Row) => {
      const isPaid = tier !== null && tier !== "free";
      if (row.pile === "paid" && !isPaid) {
        toast.error("Member Pool candidates require a paid employer plan.");
        navigate({ to: "/employer/credits/checkout" });
        return;
      }
      if ((balance ?? 0) <= 0) {
        toast.error("You're out of credits.");
        navigate({ to: "/employer/credits/checkout" });
        return;
      }
      setUnlockTarget(row);
    },
    [tier, balance, navigate],
  );

  const confirmUnlock = useCallback(async () => {
    if (!unlockTarget) return;
    setUnlocking(true);
    try {
      const r = await unlockCandidate({ data: { candidate_id: unlockTarget.user_id } });
      if (!r.ok) {
        if (r.error === "no_credits" || r.error === "upgrade_required") {
          toast.error(("message" in r ? r.message : null) ?? "Couldn't unlock");
          setUnlockTarget(null);
          navigate({ to: "/employer/credits/checkout" });
          return;
        }
        toast.error(r.error ?? "Couldn't unlock");
        return;
      }
      if (typeof r.balance === "number") setBalance(r.balance);
      toast.success(r.already_unlocked ? "Already unlocked — opening profile." : "Unlocked.");
      const id = unlockTarget.user_id;
      setUnlockTarget(null);
      navigate({ to: "/employer/unlocked/$candidateId", params: { candidateId: id } });
    } finally {
      setUnlocking(false);
    }
  }, [unlockTarget, navigate]);

  if (allowed === null) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">Loading…</div>
      </SiteLayout>
    );
  }

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

  if (verification === "pending") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10">
          <h1 className="font-display text-3xl text-navy-deep">Verification pending</h1>
          <p className="mt-3 text-muted-foreground">
            Your employer account is being reviewed. We&apos;ll email you as soon as it&apos;s approved.
          </p>
        </div>
      </SiteLayout>
    );
  }

  const sidebar = (
    <FilterSidebar filters={filters} setFilters={setFilters} />
  );

  return (
    <SiteLayout>
      {/* Stats bar */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Employer Portal</div>
              <h1 className="mt-2 font-display text-3xl text-navy-deep lg:text-4xl">
                Browse candidates
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Anonymized previews show capability only. Unlock with a credit to see contact info and resume.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <Stat label="Credits" value={balance ?? "—"} />
              <Stat label="Unlocked / mo" value={stats?.unlockedThisMonth ?? "—"} />
              <Stat label="Shortlisted" value={stats?.shortlistCount ?? "—"} />
            </div>
          </div>
          {!isPaidEmployerTier && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-gilt/40 bg-gilt/10 px-4 py-3 text-sm text-navy-deep">
              <span>
                You&apos;re on the free tier. Upgrade to unlock Member Pool candidates and bulk credits.
              </span>
              <Link to="/employer/credits/checkout" className="font-semibold underline">
                Buy credits / upgrade
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:px-10">
          {/* Desktop sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">{sidebar}</aside>

          {/* Mobile filter trigger */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-2 border border-border bg-paper px-4 py-2 text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {loading ? "Searching…" : `${rows.length} candidate${rows.length === 1 ? "" : "s"} match`}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label className="text-muted-foreground">Sort</label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as FilterState["sort"] }))}
                  className="border border-border bg-paper px-2 py-1 text-sm"
                >
                  <option value="match">Best match</option>
                  <option value="recent">Most recently active</option>
                  <option value="experience">Most experienced</option>
                </select>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeChips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFilters((f) => clearChip(f, c))}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-paper px-2.5 py-1 text-xs text-navy-deep hover:bg-stone/40"
                  >
                    {c.label} <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-xs text-muted-foreground underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="border border-dashed border-border bg-paper p-10 text-center text-muted-foreground">
                Loading…
              </div>
            ) : rows.length === 0 ? (
              <div className="border border-dashed border-border bg-paper p-10 text-center text-muted-foreground">
                No candidates match these filters yet.
              </div>
            ) : (
              <>
                {paidCount > 0 && (
                  <PileHeader
                    label="Member Pool"
                    count={paidCount}
                    note="Compass & Envoy members — surfaced first."
                    accent
                  />
                )}
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {rows
                    .filter((r) => r.pile === "paid")
                    .map((r) => (
                      <PreviewCard
                        key={r.user_id}
                        row={r}
                        canUnlock={isPaidEmployerTier && (balance ?? 0) > 0}
                        upgradeNeeded={!isPaidEmployerTier}
                        onUnlock={onUnlockClick}
                        onToggleShortlist={onToggleShortlist}
                        onSaveNote={saveNote}
                      />
                    ))}
                </div>

                {freeCount > 0 && (
                  <PileHeader label="Public Pool" count={freeCount} note="Open to all verified employers." />
                )}
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {rows
                    .filter((r) => r.pile === "free")
                    .map((r) => (
                      <PreviewCard
                        key={r.user_id}
                        row={r}
                        canUnlock={(balance ?? 0) > 0}
                        upgradeNeeded={false}
                        onUnlock={onUnlockClick}
                        onToggleShortlist={onToggleShortlist}
                        onSaveNote={saveNote}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="flex-1 bg-navy-deep/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="ml-auto h-full w-[90%] max-w-sm overflow-y-auto bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-lg text-navy-deep">Filters</div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full rounded-sm bg-navy-deep px-4 py-2.5 text-sm font-medium uppercase tracking-wider text-paper"
            >
              See results
            </button>
          </div>
        </div>
      )}

      {/* Unlock confirmation modal */}
      {unlockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/50 p-4">
          <div className="w-full max-w-md border border-border bg-paper p-6">
            <div className="eyebrow">Confirm unlock</div>
            <h3 className="mt-2 font-display text-xl text-navy-deep">
              Unlock {unlockTarget.anon_label}?
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              This uses <strong className="text-navy-deep">1 credit</strong>. You&apos;ll be
              able to view their full profile and request a warm intro. Re-opening is free.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              You have <strong className="text-navy-deep">{balance ?? 0}</strong> credit
              {balance === 1 ? "" : "s"} remaining.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={unlocking}
                onClick={() => setUnlockTarget(null)}
                className="border border-border bg-paper px-4 py-2 text-xs font-medium uppercase tracking-wider text-navy-deep disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={unlocking}
                onClick={confirmUnlock}
                className="bg-navy-deep px-4 py-2 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
              >
                {unlocking ? "Unlocking…" : "Unlock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl text-navy-deep">{value}</div>
    </div>
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
    <div className="mb-3 mt-6 flex items-center gap-3 first:mt-0">
      {accent && <Star className="h-4 w-4 text-gilt" />}
      <div className="font-display text-xl text-navy-deep">{label}</div>
      <div className="text-xs text-muted-foreground">{count} · {note}</div>
    </div>
  );
}

// ── Preview card ───────────────────────────────────────────────────────────
function PreviewCard({
  row,
  canUnlock,
  upgradeNeeded,
  onUnlock,
  onToggleShortlist,
  onSaveNote,
}: {
  row: Row;
  canUnlock: boolean;
  upgradeNeeded: boolean;
  onUnlock: (r: Row) => void;
  onToggleShortlist: (r: Row) => void;
  onSaveNote: (r: Row, note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            row.pile === "paid"
              ? "bg-gilt/20 text-navy-deep"
              : "bg-stone text-navy-deep/80"
          }`}
        >
          {row.pile === "paid" ? "Member Pool" : "Public Pool"}
        </span>
        <button
          type="button"
          onClick={() => onToggleShortlist(row)}
          aria-label={row.shortlisted ? "Remove from shortlist" : "Add to shortlist"}
          className={`rounded-full border border-border bg-paper p-1 ${row.shortlisted ? "text-gilt" : "text-muted-foreground hover:text-navy-deep"}`}
        >
          <Star className="h-3.5 w-3.5" fill={row.shortlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <ProfileCard p={row as never} locked />
      <div className="mt-2 flex items-center justify-between gap-2 border border-t-0 border-border bg-paper px-4 py-3 text-xs">
        {canUnlock ? (
          <button
            type="button"
            onClick={() => onUnlock(row)}
            className="inline-flex items-center gap-1 font-semibold text-navy-deep underline"
          >
            <Lock className="h-3 w-3" /> Unlock — 1 credit
          </button>
        ) : upgradeNeeded ? (
          <Link to="/employer/credits/checkout" className="font-semibold text-navy-deep underline">
            Upgrade to unlock
          </Link>
        ) : (
          <Link to="/employer/credits/checkout" className="font-semibold text-navy-deep underline">
            Buy credits
          </Link>
        )}
        {row.shortlisted && (
          <button
            type="button"
            onClick={() => setNoteOpen((o) => !o)}
            className="text-muted-foreground underline"
          >
            {noteOpen ? "Close note" : "Private note"}
          </button>
        )}
      </div>
      {noteOpen && (
        <div className="border border-t-0 border-border bg-paper p-3">
          <textarea
            className="w-full border border-border bg-white p-2 text-xs"
            rows={3}
            placeholder="Notes only you can see"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onSaveNote(row, note)}
              className="rounded-sm bg-navy-deep px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-paper"
            >
              Save note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter sidebar ─────────────────────────────────────────────────────────
function FilterSidebar({
  filters,
  setFilters,
}: {
  filters: FilterState;
  setFilters: (fn: (f: FilterState) => FilterState) => void;
}) {
  const setField = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));
  const toggle = (k: keyof FilterState, v: string) =>
    setFilters((f) => {
      const arr = f[k] as string[];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...f, [k]: next } as FilterState;
    });

  return (
    <div className="space-y-2 border border-border bg-paper p-4">
      <input
        className="w-full border border-border bg-white px-3 py-2 text-sm"
        placeholder="Search…"
        value={filters.q}
        onChange={(e) => setField("q", e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Pool</label>
        <select
          value={filters.pile}
          onChange={(e) => setField("pile", e.target.value as FilterState["pile"])}
          className="flex-1 border border-border bg-white px-2 py-1.5 text-sm"
        >
          <option value="all">All pools</option>
          <option value="paid">Member Pool</option>
          <option value="free">Public Pool</option>
        </select>
      </div>

      <Group title="Experience" defaultOpen>
        <MultiBlock label="Career stage" options={CAREER_STAGE} values={filters.career_stage} onToggle={(v) => toggle("career_stage", v)} />
        <MultiBlock label="Years full-time" options={YEARS} values={filters.years_experience} onToggle={(v) => toggle("years_experience", v)} />
        <MultiBlock label="Years international" options={YEARS} values={filters.years_intl} onToggle={(v) => toggle("years_intl", v)} />
        <MultiBlock label="Highest degree" options={DEGREE} values={filters.highest_degree} onToggle={(v) => toggle("highest_degree", v)} />
        <MultiBlock label="Management" options={MANAGEMENT} values={filters.management_experience} onToggle={(v) => toggle("management_experience", v)} />
        <MultiBlock label="Budget responsibility" options={BUDGET} values={filters.budget_responsibility} onToggle={(v) => toggle("budget_responsibility", v)} />
      </Group>

      <Group title="Skills & themes">
        <MultiBlock label="Org types" options={ORG_TYPES} values={filters.org_types} onToggle={(v) => toggle("org_types", v)} />
        <MultiBlock label="Functions" options={FUNCTIONS} values={filters.functional_skills} onToggle={(v) => toggle("functional_skills", v)} />
        <MultiBlock label="Primary theme" options={THEMES} values={filters.primary_theme} onToggle={(v) => toggle("primary_theme", v)} />
        <MultiBlock label="Secondary themes" options={THEMES} values={filters.secondary_themes} onToggle={(v) => toggle("secondary_themes", v)} />
        <MultiBlock label="Technical" options={TECH} values={filters.technical_skills} onToggle={(v) => toggle("technical_skills", v)} />
      </Group>

      <Group title="Languages">
        <MultiBlock label="Languages" options={LANGUAGES} values={filters.languages} onToggle={(v) => toggle("languages", v)} />
        <div className="mt-2">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Min proficiency</label>
          <select
            value={filters.min_language_level}
            onChange={(e) =>
              setField("min_language_level", e.target.value as FilterState["min_language_level"])
            }
            className="mt-1 w-full border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Any</option>
            {PROFICIENCY.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </Group>

      <Group title="Location & logistics">
        <MultiBlock label="Based in" options={REGIONS} values={filters.current_base} onToggle={(v) => toggle("current_base", v)} />
        <MultiBlock label="Work eligibility" options={ELIGIBILITY} values={filters.work_eligibility} onToggle={(v) => toggle("work_eligibility", v)} />
        <MultiBlock label="Relocation" options={RELOCATION} values={filters.relocation} onToggle={(v) => toggle("relocation", v)} />
        <MultiBlock label="Work mode" options={WORK_MODE} values={filters.work_mode} onToggle={(v) => toggle("work_mode", v)} />
        <MultiBlock label="Availability" options={AVAILABILITY} values={filters.availability} onToggle={(v) => toggle("availability", v)} />
        <MultiBlock label="Work type" options={WORK_TYPE} values={filters.work_type} onToggle={(v) => toggle("work_type", v)} />
      </Group>

      <Group title="Goals">
        <MultiBlock label="Roles seeking" options={ROLES} values={filters.roles_seeking} onToggle={(v) => toggle("roles_seeking", v)} />
        <MultiBlock label="Target sectors" options={ORG_TYPES} values={filters.target_sectors} onToggle={(v) => toggle("target_sectors", v)} />
        <MultiBlock label="Salary expectation" options={SALARY} values={filters.salary_expectation} onToggle={(v) => toggle("salary_expectation", v)} />
        <MultiBlock label="Clearance" options={CLEARANCE} values={filters.security_clearance} onToggle={(v) => toggle("security_clearance", v)} />
        <MultiBlock label="Fellowship" options={FELLOWSHIP} values={filters.fellowship_category} onToggle={(v) => toggle("fellowship_category", v)} />
      </Group>
    </div>
  );
}

function Group({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-deep"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-3 pb-2">{children}</div>}
    </div>
  );
}

function MultiBlock({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const active = values.includes(o);
          return (
            <button
              type="button"
              key={o}
              onClick={() => onToggle(o)}
              className={`rounded-full border px-2 py-0.5 text-[11px] ${
                active
                  ? "border-navy-deep bg-navy-deep text-paper"
                  : "border-border bg-white text-navy-deep hover:border-navy-deep"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Chip helpers ───────────────────────────────────────────────────────────
type Chip = { key: string; label: string; field: keyof FilterState; value?: string };
function collectChips(f: FilterState): Chip[] {
  const out: Chip[] = [];
  if (f.q) out.push({ key: "q", label: `“${f.q}”`, field: "q" });
  if (f.pile !== "all") out.push({ key: "pile", label: `Pool: ${f.pile}`, field: "pile" });
  if (f.min_language_level) out.push({ key: "minlvl", label: `Min: ${f.min_language_level}`, field: "min_language_level" });
  const arrayFields: (keyof FilterState)[] = [
    "career_stage", "years_experience", "years_intl", "highest_degree",
    "management_experience", "budget_responsibility",
    "org_types", "functional_skills", "primary_theme", "secondary_themes", "technical_skills",
    "languages", "current_base", "work_eligibility", "relocation", "work_mode",
    "availability", "work_type", "roles_seeking", "target_sectors",
    "salary_expectation", "security_clearance", "fellowship_category", "ai_tags",
  ];
  for (const k of arrayFields) {
    const v = f[k];
    if (Array.isArray(v)) {
      for (const item of v) {
        out.push({ key: `${String(k)}:${item}`, label: item, field: k, value: item });
      }
    }
  }
  return out;
}
function clearChip(f: FilterState, c: Chip): FilterState {
  if (c.field === "q") return { ...f, q: "" };
  if (c.field === "pile") return { ...f, pile: "all" };
  if (c.field === "min_language_level") return { ...f, min_language_level: "" };
  const cur = f[c.field];
  if (Array.isArray(cur) && c.value) {
    return { ...f, [c.field]: cur.filter((x) => x !== c.value) } as FilterState;
  }
  return f;
}
