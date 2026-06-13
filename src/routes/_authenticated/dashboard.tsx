import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Discover Diplomacy" }] }),
  component: DashboardPage,
});

type Review = {
  id: string;
  status: string;
  target_role: string;
  created_at: string;
  amount_cents: number;
};

type Profile = { full_name: string | null; email: string | null };

function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const [{ data: prof }, { data: revs }] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", userData.user.id).single(),
        supabase
          .from("resume_reviews")
          .select("id, status, target_role, created_at, amount_cents")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (!mounted) return;
      setProfile(prof ?? { full_name: null, email: userData.user.email ?? null });
      setReviews((revs ?? []) as Review[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <SiteLayout>
      <PaymentTestModeBanner />
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Client Portal</div>
              <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-5xl">
                Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {profile?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="border border-border bg-paper px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Your Orders</div>
              <h2 className="mt-4 font-display text-2xl text-navy-deep lg:text-3xl">
                Resume reviews
              </h2>
            </div>
            <Link
              to="/resume-review"
              className="inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Start a new review — $25
            </Link>
          </div>

          <div className="mt-8 border border-border bg-paper">
            {loading ? (
              <div className="p-8 text-sm text-muted-foreground">Loading…</div>
            ) : reviews.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No orders yet. Start a resume review to get expert, ATS-tailored feedback.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {reviews.map((r) => (
                  <li key={r.id} className="grid gap-3 p-6 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-5">
                      <div className="font-display text-base text-navy-deep">{r.target_role}</div>
                      <div className="text-xs text-muted-foreground">
                        Ordered {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="md:col-span-3 text-xs uppercase tracking-wider text-emerald">
                      <StatusLabel status={r.status} />
                    </div>
                    <div className="md:col-span-2 text-sm text-navy-deep">
                      ${(r.amount_cents / 100).toFixed(2)}
                    </div>
                    <div className="md:col-span-2 md:text-right">
                      {r.status === "pending_payment" && (
                        <Link
                          to="/resume-review/checkout"
                          search={{ reviewId: r.id }}
                          className="text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
                        >
                          Complete payment →
                        </Link>
                      )}
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

function StatusLabel({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_payment: "Awaiting payment",
    paid: "Paid · queued",
    in_review: "In review",
    completed: "Completed",
    canceled: "Canceled",
  };
  return <span>{map[status] ?? status}</span>;
}
