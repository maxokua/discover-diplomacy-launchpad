import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";
import {
  employerListResumes,
  employerGetResumeUrl,
  myPortalRoles,
  getEmployerCreditBalance,
} from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/_authenticated/employer/resumes")({
  head: () => ({
    meta: [{ title: "Employer Portal · Resumes | Discover Diplomacy" }],
  }),
  component: EmployerResumesPage,
});

type Resume = {
  id: string;
  user_id: string;
  target_role: string;
  status: string;
  has_reviewed: boolean;
  created_at: string;
  full_name: string | null;
  email: string | null;
};

function EmployerResumesPage() {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  async function refreshBalance() {
    try {
      const b = await getEmployerCreditBalance();
      setBalance(b.balance);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const roles = await myPortalRoles();
        if (!roles.employer && !roles.admin) {
          setAllowed(false);
          return;
        }
        setAllowed(true);
        setIsAdmin(!!roles.admin);
        const [result] = await Promise.all([employerListResumes(), refreshBalance()]);
        if ("error" in result) toast.error(result.error);
        else setRows(result.resumes as Resume[]);
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function openResume(id: string) {
    setBusyId(id);
    try {
      const r = await employerGetResumeUrl({
        data: { reviewId: id, environment: getStripeEnvironment() },
      });
      if ("error" in r) {
        if ("needsCredits" in r && r.needsCredits) {
          toast.error("Out of credits. Buy more to unlock this candidate.");
        } else {
          throw new Error(r.error);
        }
        return;
      }
      window.open(r.url, "_blank", "noopener,noreferrer");
      refreshBalance();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't open resume");
    } finally {
      setBusyId(null);
    }
  }


  if (allowed === null) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-sm text-muted-foreground">
          Checking access…
        </div>
      </SiteLayout>
    );
  }

  if (!allowed) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="font-display text-3xl text-navy-deep">Employer access only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This portal is for verified employers. To request access, see the{" "}
            <Link to="/employers" className="underline">employers page</Link>.
          </p>
        </div>
      </SiteLayout>
    );
  }

  const filtered = query
    ? rows.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.target_role.toLowerCase().includes(q) ||
          (r.full_name ?? "").toLowerCase().includes(q) ||
          (r.email ?? "").toLowerCase().includes(q)
        );
      })
    : rows;

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Employer portal</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Candidate resumes
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Browse and download resumes from members who consented to employer review. To
            connect with a candidate, email{" "}
            <a className="underline" href="mailto:hello@discoverdiplomacy.org">
              hello@discoverdiplomacy.org
            </a>{" "}
            with the candidate's name.
          </p>

          {!isAdmin && (
            <div className="mt-8 grid gap-4 border border-border bg-cream/30 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="eyebrow">Unlock credits</div>
                <div className="mt-2 font-display text-2xl text-navy-deep">
                  Balance:{" "}
                  <span className="text-emerald">
                    {balance === null ? "…" : balance}
                  </span>{" "}
                  credit{balance === 1 ? "" : "s"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Each unique candidate unlock costs 1 credit. Re-opening a resume you've
                  already unlocked is free.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/employer/credits/checkout"
                  search={{ pack: "single" }}
                  className="border border-navy-deep px-4 py-2 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-navy-deep hover:text-paper"
                >
                  Buy 1 · $18
                </Link>
                <Link
                  to="/employer/credits/checkout"
                  search={{ pack: "pack20" }}
                  className="border border-navy-deep bg-navy-deep px-4 py-2 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Buy 20-pack · $300
                </Link>
              </div>
            </div>
          )}


          <div className="mt-8">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, email, or target role…"
              className="w-full max-w-md border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
            />
          </div>

          <div className="mt-6 border border-border bg-paper">
            {loading ? (
              <div className="p-8 text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No resumes match your filter.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((r) => (
                  <li key={r.id} className="grid gap-3 p-6 lg:grid-cols-12 lg:items-center">
                    <div className="lg:col-span-4">
                      <div className="font-display text-base text-navy-deep">
                        {r.full_name || "Candidate"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.email || "Email withheld"}
                      </div>
                    </div>
                    <div className="lg:col-span-4">
                      <div className="text-xs uppercase tracking-wider text-emerald">
                        Target role
                      </div>
                      <div className="mt-1 text-sm text-navy-deep">{r.target_role}</div>
                    </div>
                    <div className="lg:col-span-2 text-xs uppercase tracking-wider text-muted-foreground">
                      {r.has_reviewed ? "Reviewed copy" : "Original"}
                    </div>
                    <div className="lg:col-span-2 lg:text-right">
                      <button
                        disabled={busyId === r.id}
                        onClick={() => openResume(r.id)}
                        className="border border-navy-deep bg-navy-deep px-4 py-2 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
                      >
                        {busyId === r.id ? "Opening…" : "Open resume"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Candidate materials are confidential. Do not redistribute. Discover Diplomacy makes
            no representation about a candidate's qualifications and does not guarantee fit,
            availability, or hire.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
