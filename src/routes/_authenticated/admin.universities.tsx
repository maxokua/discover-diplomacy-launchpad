import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListUniversityLeads,
  adminUpdateLeadStatus,
  adminListCohorts,
  adminCreateCohort,
  adminBulkInviteStudents,
} from "@/lib/universities.functions";

export const Route = createFileRoute("/_authenticated/admin/universities")({
  head: () => ({
    meta: [{ title: "Admin · Universities | Discover Diplomacy" }],
  }),
  component: AdminUniversitiesPage,
});

type Lead = {
  id: string;
  university_name: string;
  contact_name: string;
  contact_email: string;
  contact_title: string | null;
  department: string;
  est_students: number;
  funding_model: string;
  start_date_pref: string | null;
  budget_cycle: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

type Cohort = {
  id: string;
  university_name: string;
  program_name: string | null;
  contact_email: string;
  student_count: number;
  monthly_rate_cents: number;
  funding_model: string;
  status: string;
  renewal_at: string | null;
  created_at: string;
};

const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

function AdminUniversitiesPage() {
  const listLeads = useServerFn(adminListUniversityLeads);
  const setStatus = useServerFn(adminUpdateLeadStatus);
  const listCohorts = useServerFn(adminListCohorts);
  const createCohort = useServerFn(adminCreateCohort);
  const bulkInvite = useServerFn(adminBulkInviteStudents);

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"leads" | "cohorts">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [creating, setCreating] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: ud } = await supabase.auth.getUser();
      if (!ud.user) return setAllowed(false);
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: ud.user.id,
        _role: "admin",
      });
      setAllowed(!!isAdmin);
      if (!isAdmin) return;
      const [l, c] = await Promise.all([listLeads(), listCohorts()]);
      if (!("error" in l)) setLeads(l.leads as Lead[]);
      if (!("error" in c)) setCohorts(c.cohorts as Cohort[]);
    })();
  }, [listLeads, listCohorts]);

  async function changeStatus(id: string, status: (typeof LEAD_STATUSES)[number]) {
    const res = await setStatus({ data: { id, status } });
    if ("error" in res) return toast.error(res.error);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function handleCreate(form: FormData) {
    setCreating(true);
    try {
      const raw = Object.fromEntries(form.entries());
      const res = await createCohort({ data: raw as any });
      if ("error" in res) throw new Error(res.error);
      toast.success("Cohort created");
      const c = await listCohorts();
      if (!("error" in c)) setCohorts(c.cohorts as Cohort[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create cohort");
    } finally {
      setCreating(false);
    }
  }

  async function handleBulkInvite(cohortId: string, csv: string) {
    try {
      const lines = csv
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const rowSchema = z.object({
        email: z.string().email(),
        full_name: z.string().optional(),
        graduation_year: z.number().int().optional().nullable(),
      });
      const rows = lines.map((line) => {
        const [email, full_name, gradStr] = line.split(",").map((s) => s.trim());
        const graduation_year = gradStr ? parseInt(gradStr, 10) : null;
        return rowSchema.parse({
          email,
          full_name: full_name || undefined,
          graduation_year: Number.isFinite(graduation_year) ? graduation_year : null,
        });
      });
      const res = await bulkInvite({ data: { cohortId, rows } });
      if ("error" in res) throw new Error(res.error);
      toast.success(`Invited ${res.invited} students`);
      setInviteTarget(null);
      const c = await listCohorts();
      if (!("error" in c)) setCohorts(c.cohorts as Cohort[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not invite students");
    }
  }

  if (allowed === null) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-6 py-20 text-sm text-muted-foreground lg:px-10">
          Checking permissions…
        </div>
      </SiteLayout>
    );
  }
  if (!allowed) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
          <h1 className="font-display text-2xl text-navy-deep">Forbidden</h1>
          <p className="mt-3 text-muted-foreground">
            Admin access required.{" "}
            <Link to="/dashboard" className="underline">
              Return to dashboard
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
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
          <div className="eyebrow">Admin</div>
          <h1 className="mt-3 font-display text-3xl text-navy-deep lg:text-4xl">
            Universities
          </h1>
          <div className="mt-6 inline-flex border border-border">
            {(["leads", "cohorts"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 text-xs font-medium uppercase tracking-wider ${
                  tab === t
                    ? "bg-navy-deep text-paper"
                    : "bg-paper text-navy-deep hover:bg-stone"
                }`}
              >
                {t === "leads" ? `Leads (${leads.length})` : `Cohorts (${cohorts.length})`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {tab === "leads" && (
        <section className="bg-stone">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
            <div className="border border-border bg-paper">
              {leads.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No leads yet.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {leads.map((l) => (
                    <li key={l.id} className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="font-display text-lg text-navy-deep">
                            {l.university_name}{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                              · {l.department}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-navy-deep/80">
                            {l.contact_name}
                            {l.contact_title && ` (${l.contact_title})`} ·{" "}
                            <a
                              href={`mailto:${l.contact_email}`}
                              className="underline-offset-4 hover:underline"
                            >
                              {l.contact_email}
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            ~{l.est_students} students · funding: {l.funding_model}
                            {l.start_date_pref && ` · start: ${l.start_date_pref}`}
                            {l.budget_cycle && ` · budget: ${l.budget_cycle}`}
                          </div>
                          {l.notes && (
                            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm text-navy-deep/80">
                              {l.notes}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">
                            Received {new Date(l.created_at).toLocaleString()}
                          </div>
                        </div>
                        <select
                          value={l.status}
                          onChange={(e) =>
                            changeStatus(l.id, e.target.value as (typeof LEAD_STATUSES)[number])
                          }
                          className="border border-border bg-paper px-3 py-2 text-xs uppercase tracking-wider text-navy-deep"
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === "cohorts" && (
        <section className="bg-stone">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
            <details className="mb-8 border border-border bg-paper">
              <summary className="cursor-pointer p-5 text-xs font-medium uppercase tracking-wider text-navy-deep">
                + Create cohort
              </summary>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate(new FormData(e.currentTarget));
                }}
                className="grid gap-4 border-t border-border p-6 md:grid-cols-2"
              >
                <AdminField label="University name" name="university_name" required />
                <AdminField label="Program name" name="program_name" />
                <AdminField label="Contact email" name="contact_email" type="email" required />
                <AdminField
                  label="Admin email (existing DD account)"
                  name="admin_email"
                  type="email"
                />
                <AdminSelect
                  label="Funding model"
                  name="funding_model"
                  options={["direct", "student_cost", "hybrid"]}
                  defaultValue="direct"
                />
                <AdminField
                  label="Rate (cents/student/mo)"
                  name="monthly_rate_cents"
                  type="number"
                  defaultValue="2000"
                />
                <AdminField label="Start date" name="started_at" type="date" />
                <AdminField label="Renewal date" name="renewal_at" type="date" />
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center bg-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
                  >
                    {creating ? "Creating…" : "Create cohort"}
                  </button>
                </div>
              </form>
            </details>

            <div className="border border-border bg-paper">
              {cohorts.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No cohorts yet.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {cohorts.map((c) => (
                    <li key={c.id} className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="font-display text-lg text-navy-deep">
                            {c.university_name}
                          </div>
                          {c.program_name && (
                            <div className="text-sm text-muted-foreground">
                              {c.program_name}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">
                            {c.student_count} students · ${(c.monthly_rate_cents / 100).toFixed(0)}
                            /student · {c.funding_model} · {c.status}
                            {c.renewal_at && ` · renews ${c.renewal_at}`}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Contact: {c.contact_email}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setInviteTarget(inviteTarget === c.id ? null : c.id)
                          }
                          className="border border-navy-deep px-4 py-2 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-navy-deep hover:text-paper"
                        >
                          {inviteTarget === c.id ? "Cancel" : "Bulk invite"}
                        </button>
                      </div>

                      {inviteTarget === c.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const ta = (
                              e.currentTarget.elements.namedItem("csv") as HTMLTextAreaElement
                            ).value;
                            handleBulkInvite(c.id, ta);
                          }}
                          className="mt-4 border-t border-border pt-4"
                        >
                          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
                            CSV: email,full_name,graduation_year (one per line)
                          </label>
                          <textarea
                            name="csv"
                            rows={6}
                            required
                            placeholder="jane@university.edu,Jane Doe,2026
john@university.edu,John Smith,2025"
                            className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep outline-none focus:border-navy-deep"
                          />
                          <button
                            type="submit"
                            className="mt-3 inline-flex items-center bg-emerald px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-emerald/90"
                          >
                            Invite students
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function AdminField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full border border-border bg-paper px-4 py-2.5 text-sm text-navy-deep outline-none focus:border-navy-deep"
      />
    </div>
  );
}

function AdminSelect({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-deep">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full border border-border bg-paper px-4 py-2.5 text-sm text-navy-deep outline-none focus:border-navy-deep"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
