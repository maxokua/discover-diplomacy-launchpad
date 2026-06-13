import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { toast } from "sonner";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import {
  createCoachingCallCheckout,
  createPortalSession,
  cancelMembershipAtPeriodEnd,
  resumeMembership,
  updateProfile,
  getReviewedResumeUrl,
} from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: (s: Record<string, unknown>): { coaching?: string } => ({
    coaching: typeof s.coaching === "string" ? s.coaching : undefined,
  }),
  head: () => ({ meta: [{ title: "Dashboard | Discover Diplomacy" }] }),
  component: DashboardPage,
});

type Review = {
  id: string;
  status: string;
  target_role: string;
  created_at: string;
  amount_cents: number;
  reviewed_resume_path: string | null;
};

type Profile = { full_name: string | null; email: string | null };

type Sub = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id?: string | null;
};

function DashboardPage() {
  const navigate = useNavigate();
  const { coaching } = Route.useSearch();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [callOpen, setCallOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Re-fetch helper so we can refresh after cancel / resume / profile edit.
  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setUserId(userData.user.id);
    const env = getStripeEnvironment();
    const [{ data: prof }, { data: revs }, { data: subRow }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", userData.user.id).single(),
      supabase
        .from("resume_reviews")
        .select("id, status, target_role, created_at, amount_cents, reviewed_resume_path")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("status, current_period_end, cancel_at_period_end, stripe_customer_id")
        .eq("user_id", userData.user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setProfile(prof ?? { full_name: null, email: userData.user.email ?? null });
    setReviews((revs ?? []) as Review[]);
    setSub((subRow ?? null) as Sub | null);
    setNameInput(prof?.full_name ?? "");
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    load().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Surface coaching-call return state once.
  useEffect(() => {
    if (coaching === "success") {
      toast.success("Payment received, we'll email you a scheduling link shortly.");
      navigate({ to: "/dashboard", replace: true });
    }
  }, [coaching, navigate]);

  const isActiveMember = useMemo(() => {
    if (!sub) return false;
    if (["active", "trialing", "past_due"].includes(sub.status)) return true;
    if (
      sub.status === "canceled" &&
      sub.current_period_end &&
      new Date(sub.current_period_end) > new Date()
    )
      return true;
    return false;
  }, [sub]);

  // Re-create options whenever the panel opens so we never reuse a stale
  // client secret from a previous open/close cycle.
  const callOptions = useMemo(
    () => ({
      fetchClientSecret: async () => {
        const result = await createCoachingCallCheckout({
          data: {
            environment: getStripeEnvironment(),
            returnUrl: window.location.origin + "/dashboard?coaching=success",
          },
        });
        if ("error" in result) throw new Error(result.error);
        if (!result.clientSecret) throw new Error("No client secret returned");
        return result.clientSecret;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callOpen],
  );

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  async function openBillingPortal() {
    setBusy(true);
    try {
      const result = await createPortalSession({
        data: {
          environment: getStripeEnvironment(),
          returnUrl: window.location.origin + "/dashboard",
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't open billing portal");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel your membership at the end of the current period?")) return;
    setBusy(true);
    try {
      const result = await cancelMembershipAtPeriodEnd({
        data: { environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      toast.success("Membership will end at the period end.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel");
    } finally {
      setBusy(false);
    }
  }

  async function handleResume() {
    setBusy(true);
    try {
      const result = await resumeMembership({ data: { environment: getStripeEnvironment() } });
      if ("error" in result) throw new Error(result.error);
      toast.success("Membership resumed.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't resume");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await updateProfile({ data: { fullName: nameInput } });
      if ("error" in result) throw new Error(result.error);
      toast.success("Profile updated");
      setEditingName(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update");
    } finally {
      setBusy(false);
    }
  }

  async function downloadReviewed(reviewId: string) {
    try {
      const result = await getReviewedResumeUrl({ data: { reviewId } });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't fetch file");
    }
  }

  const showPastDueBanner = sub?.status === "past_due";
  const showCanceledBanner =
    sub?.cancel_at_period_end && sub?.current_period_end && isActiveMember;

  return (
    <SiteLayout>
      <PaymentTestModeBanner />

      {showPastDueBanner && (
        <div className="border-b border-amber-300 bg-amber-50 px-6 py-3 text-sm text-amber-900">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 lg:px-4">
            <span>
              <strong>Payment failed.</strong> Update your card to keep your membership before
              access ends.
            </span>
            <button
              onClick={openBillingPortal}
              disabled={busy}
              className="border border-amber-900 bg-amber-900 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-amber-50 hover:opacity-90 disabled:opacity-60"
            >
              Update payment method
            </button>
          </div>
        </div>
      )}

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <div className="eyebrow">Client Portal</div>
              <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-5xl">
                Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">{profile?.email}</p>
              {userId && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userId);
                    toast.success("User ID copied to clipboard");
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-navy-deep"
                  title="Click to copy"
                >
                  <span>ID: {userId}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditingName((v) => !v)}
                className="border border-border bg-paper px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
              >
                {editingName ? "Close" : "Edit profile"}
              </button>
              <button
                onClick={signOut}
                className="border border-border bg-paper px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
              >
                Sign out
              </button>
            </div>
          </div>

          {editingName && (
            <form
              onSubmit={handleSaveName}
              className="mt-6 grid max-w-xl gap-3 border border-border bg-stone p-5 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                  Full name
                </label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  To change your email, contact careers@discoverdiplomacy.org.
                </p>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="self-end bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Membership */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
          <div className="grid gap-6 border border-border bg-stone p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="eyebrow">Career Membership</div>
              {loading ? (
                <div className="mt-3 text-sm text-muted-foreground">Loading…</div>
              ) : isActiveMember ? (
                <>
                  <h2 className="mt-3 font-display text-2xl text-navy-deep">
                    You're an active member.
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {showCanceledBanner
                      ? `Access ends ${new Date(sub!.current_period_end!).toLocaleDateString()}, you've canceled but still have member access until then.`
                      : sub?.current_period_end
                      ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()}.`
                      : "Thanks for being here."}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-3 font-display text-2xl text-navy-deep">
                    Join the Career Membership · $50/month.
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tailored resume for 5 target jobs, LinkedIn review, research, outreach,
                    interview prep, applications, and the global opportunities Substack with 50
                    opportunities weekly. Month to month, cancel anytime.
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              {isActiveMember ? (
                <>
                  <button
                    onClick={() => setCallOpen((v) => !v)}
                    className="bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                  >
                    {callOpen ? "Close" : "Book 30-min CEO call · $25"}
                  </button>
                </>
              ) : (
                <Link
                  to="/membership/checkout"
                  className="bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Start membership · $50/mo
                </Link>
              )}
            </div>
          </div>

          {/* Member billing actions */}
          {isActiveMember && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={openBillingPortal}
                disabled={busy}
                className="border border-border bg-paper px-4 py-2 font-medium uppercase tracking-wider text-navy-deep hover:bg-stone disabled:opacity-60"
              >
                Manage billing & invoices
              </button>
              {sub?.cancel_at_period_end ? (
                <button
                  onClick={handleResume}
                  disabled={busy}
                  className="border border-border bg-paper px-4 py-2 font-medium uppercase tracking-wider text-navy-deep hover:bg-stone disabled:opacity-60"
                >
                  Resume membership
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={busy}
                  className="border border-border bg-paper px-4 py-2 font-medium uppercase tracking-wider text-navy-deep hover:bg-stone disabled:opacity-60"
                >
                  Cancel at period end
                </button>
              )}
            </div>
          )}

          {isActiveMember && callOpen && (
            <div className="mt-6 border border-border bg-paper p-6">
              <div className="eyebrow">30-min CEO Coaching Call · $25</div>
              <p className="mt-2 text-sm text-muted-foreground">
                One-time add-on. After payment we'll email you a scheduling link.
              </p>
              <div className="mt-6">
                <EmbeddedCheckoutProvider stripe={getStripe()} options={callOptions}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </div>
          )}
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
              Start a new review · $25
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
                      {r.status === "completed" && r.reviewed_resume_path && (
                        <button
                          onClick={() => downloadReviewed(r.id)}
                          className="text-sm font-medium text-navy-deep underline-offset-4 hover:underline"
                        >
                          Download reviewed resume ↓
                        </button>
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
