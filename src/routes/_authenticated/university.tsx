import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import {
  getMyCohort,
  getCohortMembers,
  getCohortEngagement,
} from "@/lib/universities.functions";

export const Route = createFileRoute("/_authenticated/university")({
  head: () => ({
    meta: [{ title: "University Portal | Discover Diplomacy" }],
  }),
  component: UniversityPortal,
});

type Cohort = {
  id: string;
  university_name: string;
  program_name: string | null;
  status: string;
  student_count: number;
  monthly_rate_cents: number;
  funding_model: string;
  started_at: string | null;
  renewal_at: string | null;
};

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  graduation_year: number | null;
  status: string;
  invited_at: string;
  activated_at: string | null;
};

type Engagement = {
  total_members: number;
  active_members: number;
  graduated_members: number;
  resumes_uploaded: number;
  resume_analyses: number;
  resume_reviews: number;
  resume_drop_optins: number;
};

function UniversityPortal() {
  const myCohort = useServerFn(getMyCohort);
  const fetchMembers = useServerFn(getCohortMembers);
  const fetchEngagement = useServerFn(getCohortEngagement);

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await myCohort();
      if ("error" in res) {
        toast.error(res.error);
        setLoading(false);
        return;
      }
      if (!res.cohorts.length) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      setCohorts(res.cohorts as Cohort[]);
      setActiveId(res.cohorts[0].id);
      setLoading(false);
    })();
  }, [myCohort]);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const [m, e] = await Promise.all([
        fetchMembers({ data: { cohortId: activeId } }),
        fetchEngagement({ data: { cohortId: activeId } }),
      ]);
      if ("error" in m) toast.error(m.error);
      else setMembers(m.members as Member[]);
      if ("error" in e) toast.error(e.error);
      else setEngagement(e.engagement as Engagement | null);
    })();
  }, [activeId, fetchMembers, fetchEngagement]);

  const active = cohorts.find((c) => c.id === activeId) ?? null;

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-6 py-20 text-sm text-muted-foreground lg:px-10">
          Loading your university portal…
        </div>
      </SiteLayout>
    );
  }

  if (unauthorized) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
          <div className="eyebrow">University Portal</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            No cohort is linked to your account.
          </h1>
          <p className="mt-4 text-muted-foreground">
            If your program has signed up with Discover Diplomacy and you should have access,
            email{" "}
            <a
              href="mailto:hello@discoverdiplomacy.org"
              className="font-medium text-navy-deep underline-offset-4 hover:underline"
            >
              hello@discoverdiplomacy.org
            </a>{" "}
            and we'll link your account. To explore the program, visit{" "}
            <Link
              to="/universities"
              className="font-medium text-navy-deep underline-offset-4 hover:underline"
            >
              the universities page
            </Link>
            .
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">University Portal</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            {active?.university_name}
          </h1>
          {active?.program_name && (
            <p className="mt-2 text-sm text-muted-foreground">{active.program_name}</p>
          )}

          {cohorts.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {cohorts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`border px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${
                    c.id === activeId
                      ? "border-navy-deep bg-navy-deep text-paper"
                      : "border-border bg-paper text-navy-deep hover:bg-stone"
                  }`}
                >
                  {c.university_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cohort summary */}
      <section className="border-b border-border bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
          <div className="grid gap-px border border-border bg-border md:grid-cols-4">
            <Stat label="Status" value={active?.status ?? "—"} />
            <Stat label="Roster size" value={String(active?.student_count ?? 0)} />
            <Stat
              label="Monthly rate"
              value={`$${((active?.monthly_rate_cents ?? 0) / 100).toFixed(0)}/student`}
            />
            <Stat label="Renewal" value={active?.renewal_at ?? "—"} />
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Engagement</div>
          <h2 className="mt-3 font-display text-2xl text-navy-deep lg:text-3xl">
            How your students are using Discover Diplomacy
          </h2>
          <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
            <Stat label="Total" value={String(engagement?.total_members ?? 0)} />
            <Stat label="Active" value={String(engagement?.active_members ?? 0)} accent />
            <Stat label="Graduated" value={String(engagement?.graduated_members ?? 0)} />
            <Stat label="Resumes" value={String(engagement?.resumes_uploaded ?? 0)} />
            <Stat label="Analyses" value={String(engagement?.resume_analyses ?? 0)} />
            <Stat label="Reviews" value={String(engagement?.resume_reviews ?? 0)} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Aggregated engagement only. Individual student data is private.
          </p>
        </div>
      </section>

      {/* Roster */}
      <section className="bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Roster</div>
              <h2 className="mt-3 font-display text-2xl text-navy-deep lg:text-3xl">
                {members.length} student{members.length === 1 ? "" : "s"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Need to add or remove students? Email{" "}
                <a
                  href="mailto:hello@discoverdiplomacy.org"
                  className="font-medium text-navy-deep underline-offset-4 hover:underline"
                >
                  hello@discoverdiplomacy.org
                </a>{" "}
                and we'll update the cohort within 24 hours.
              </p>
            </div>
          </div>
          <div className="mt-8 border border-border bg-paper">
            {members.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No students on the roster yet. Send us your list to get started.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="grid gap-3 p-5 md:grid-cols-12 md:items-center"
                  >
                    <div className="md:col-span-5">
                      <div className="font-display text-sm text-navy-deep">
                        {m.full_name || m.email}
                      </div>
                      {m.full_name && (
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      )}
                    </div>
                    <div className="md:col-span-2 text-xs text-muted-foreground">
                      Class of {m.graduation_year ?? "—"}
                    </div>
                    <div className="md:col-span-3 text-xs uppercase tracking-wider">
                      <StatusLabel s={m.status} />
                    </div>
                    <div className="md:col-span-2 text-xs text-muted-foreground md:text-right">
                      {m.activated_at
                        ? `Active since ${new Date(m.activated_at).toLocaleDateString()}`
                        : `Invited ${new Date(m.invited_at).toLocaleDateString()}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-paper p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-display text-2xl ${
          accent ? "text-emerald" : "text-navy-deep"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusLabel({ s }: { s: string }) {
  const map: Record<string, { l: string; c: string }> = {
    invited: { l: "Invited", c: "text-muted-foreground" },
    active: { l: "Active", c: "text-emerald" },
    graduated: { l: "Graduated", c: "text-navy-deep" },
    removed: { l: "Removed", c: "text-muted-foreground" },
  };
  const v = map[s] ?? { l: s, c: "text-navy-deep" };
  return <span className={v.c}>{v.l}</span>;
}
