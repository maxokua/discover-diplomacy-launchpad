import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";
import { coachListClients, myPortalRoles } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/coach/clients")({
  head: () => ({
    meta: [{ title: "Coach Portal · Clients | Discover Diplomacy" }],
  }),
  component: CoachClientsPage,
});

type Client = {
  id: string;
  user_id: string;
  target_role: string;
  notes: string | null;
  status: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
};

function CoachClientsPage() {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [rows, setRows] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const roles = await myPortalRoles();
        if (!roles.coach && !roles.admin) {
          setAllowed(false);
          return;
        }
        setAllowed(true);
        const result = await coachListClients();
        if ("error" in result) toast.error(result.error);
        else setRows(result.clients as Client[]);
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          <h1 className="font-display text-3xl text-navy-deep">Coach access only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This page is for approved coaches. If you'd like to coach with us, apply on the{" "}
            <Link to="/coaches" className="underline">coaches page</Link>.
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Coach portal</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Clients you can volunteer to coach
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Browse current members and the roles they're targeting. To claim a client, email{" "}
            <a className="underline" href="mailto:coaches@discoverdiplomacy.com">
              coaches@discoverdiplomacy.com
            </a>{" "}
            with the client's name and the role they're pursuing.
          </p>

          <div className="mt-10 border border-border bg-paper">
            {loading ? (
              <div className="p-8 text-sm text-muted-foreground">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No active clients right now. Check back soon.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((r) => (
                  <li key={r.id} className="grid gap-3 p-6 lg:grid-cols-12 lg:items-start">
                    <div className="lg:col-span-4">
                      <div className="font-display text-base text-navy-deep">
                        {r.full_name || "Member"}
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
                    <div className="lg:col-span-3 text-sm text-muted-foreground">
                      {r.notes ? (
                        <span className="line-clamp-3">{r.notes}</span>
                      ) : (
                        <span className="text-muted-foreground/60">No notes</span>
                      )}
                    </div>
                    <div className="lg:col-span-1 text-right text-xs uppercase tracking-wider text-muted-foreground">
                      {r.status}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Coaching is volunteer-based and not guaranteed to result in employment. By coaching
            you agree to handle client information confidentially.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
