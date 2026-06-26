import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { toast } from "sonner";
import { getStripeEnvironment } from "@/lib/stripe";
import {
  createPortalSession,
  cancelMembershipAtPeriodEnd,
  resumeMembership,
  updateProfile,
  getReviewedResumeUrl,
} from "@/lib/payments.functions";
import { getResumeDropStatus } from "@/lib/resume-drop.functions";
import { ResumeDropCard } from "@/components/resume-drop/ResumeDropCard";
import { ResumeDropIntroModal } from "@/components/resume-drop/ResumeDropIntroModal";
import { NotificationsList } from "@/components/resume-drop/NotificationsBell";

type ResumeDropStatus = Awaited<ReturnType<typeof getResumeDropStatus>>;

export const Route = createFileRoute("/_authenticated/dashboard")({
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

type Profile = { full_name: string | null; email: string | null; service_tier: string | null };

type Sub = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id?: string | null;
  price_id?: string | null;
};

const ENVOY_CALENDLY_URL = "https://calendly.com/discoverdiplomacy/envoy-monthly-call";

function tierLabel(t: string | null | undefined) {
  if (t === "envoy") return "Envoy";
  if (t === "compass") return "Compass";
  return null;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [dropStatus, setDropStatus] = useState<ResumeDropStatus | null>(null);
  const [introOpen, setIntroOpen] = useState(false);

  async function loadDrop() {
    try {
      const s = await getResumeDropStatus({});
      setDropStatus(s);
      if (s.status === "opted_out" && !s.seenIntroAt) setIntroOpen(true);
    } catch {
      // ignore
    }
  }

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setUserId(userData.user.id);
    const env = getStripeEnvironment();
    const [{ data: prof }, { data: revs }, { data: subRow }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email, service_tier")
        .eq("id", userData.user.id)
        .single(),
      supabase
        .from("resume_reviews")
        .select("id, status, target_role, created_at, amount_cents, reviewed_resume_path")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("status, current_period_end, cancel_at_period_end, stripe_customer_id, price_id")
        .eq("user_id", userData.user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setProfile(
      (prof as Profile | null) ?? {
        full_name: null,
        email: userData.user.email ?? null,
        service_tier: null,
      },
    );
    setReviews((revs ?? []) as Review[]);
    setSub((subRow ?? null) as Sub | null);
    setNameInput((prof as Profile | null)?.full_name ?? "");
    setLoading(false);
  }

  useEffect(() => {
    load();
    loadDrop();
  }, []);

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

  // Tier derives from price_id on the active subscription (sandbox-safe).
  const tier: "compass" | "envoy" | null = useMemo(() => {
    if (!isActiveMember) return null;
    if (sub?.price_id === "envoy_monthly") return "envoy";
    if (sub?.price_id === "compass_monthly") return "compass";
    // Fallback to profile.service_tier (only set in live env by webhook)
    if (profile?.service_tier === "envoy" || profile?.service_tier === "compass") {
      return profile.service_tier as "compass" | "envoy";
    }
    return null;
  }, [isActiveMember, sub, profile]);

  async function signOutAndGo() {
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
    if (!window.confirm("Cancel your plan at the end of the current billing period?")) return;
    setBusy(true);
    try {
      const result = await cancelMembershipAtPeriodEnd({
        data: { environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      toast.success("Plan will end at the period end.");
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
      toast.success("Plan resumed.");
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
              <strong>Payment failed.</strong> Update your card to keep your plan before access
              ends.
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
              {tier && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
                  {tierLabel(tier)} plan · Active
                </div>
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
                onClick={signOutAndGo}
                className="border border-border bg-paper px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
              >
                Sign out
              </button>
            </div>
          </div>

          {editingName && (
            <form onSubmit={handleSaveName} className="mt-8 flex max-w-xl flex-col gap-4">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Full name
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-2 focus:ring-navy-deep"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="self-start bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Plan summary */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
          <div className="grid gap-6 border border-border bg-stone p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="eyebrow">Your plan</div>
              {loading ? (
                <div className="mt-3 text-sm text-muted-foreground">Loading…</div>
              ) : tier ? (
                <>
                  <h2 className="mt-3 font-display text-2xl text-navy-deep">
                    {tierLabel(tier)} · {tier === "envoy" ? "$150/month" : "$20/month"}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {showCanceledBanner
                      ? `Access ends ${new Date(sub!.current_period_end!).toLocaleDateString()}. You've canceled but keep access until then.`
                      : sub?.current_period_end
                        ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()}.`
                        : "Thanks for being here."}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-3 font-display text-2xl text-navy-deep">
                    Choose a plan to get started.
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Compass at $20/mo for self-directed job hunters. Envoy at $150/mo for
                    hands-on coaching. Month-to-month, cancel anytime.
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              {!tier && (
                <Link
                  to="/services"
                  className="bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Compare plans
                </Link>
              )}
            </div>
          </div>

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
                  Resume plan
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
              {tier === "compass" && (
                <Link
                  to="/services"
                  className="border border-emerald/40 bg-emerald/5 px-4 py-2 font-medium uppercase tracking-wider text-emerald hover:bg-emerald/10"
                >
                  Upgrade to Envoy
                </Link>
              )}
              {tier === "envoy" && (
                <Link
                  to="/services"
                  className="border border-border bg-paper px-4 py-2 font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
                >
                  Switch to Compass
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tier-gated features */}
      {tier && (
        <section className="border-b border-border bg-paper">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="eyebrow">What's included for you</div>
            <h2 className="mt-3 font-display text-2xl text-navy-deep lg:text-3xl">
              Your {tierLabel(tier)} benefits
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Weekly opportunities feed"
                desc="50 hand-curated global affairs roles from every region, delivered every week."
                cta={{ label: "Open the feed", href: "https://discoverdiplomacy.substack.com" }}
              />
              <FeatureCard
                title="Resource library"
                desc="Federal, UN/multilateral, and private-sector resume templates, cover-letter examples, and outreach scripts."
                cta={{ label: "Browse resources", href: "https://discoverdiplomacy.substack.com" }}
              />
              <FeatureCard
                title="Monthly resume review"
                desc="One async resume review per month, returned in 3–5 days."
                cta={{ label: "Submit review", to: "/resume-review" }}
              />

              {tier === "envoy" ? (
                <>
                  <FeatureCard
                    title="5 tailored resumes / month"
                    desc="Resume tailored to up to 5 target roles each month."
                    cta={{ label: "Submit a target role", to: "/contact" }}
                  />
                  <FeatureCard
                    title="LinkedIn rewrite & optimization"
                    desc="Full profile rewrite plus ongoing optimization for your target field."
                    cta={{ label: "Request rewrite", to: "/contact" }}
                  />
                  <FeatureCard
                    title="Company & role research"
                    desc="Deep research on your target employers, hiring patterns, and decision-makers."
                    cta={{ label: "Request research", to: "/contact" }}
                  />
                  <FeatureCard
                    title="Async coach access"
                    desc="Message your coach directly with replies within ~48 hours."
                    cta={{ label: "Message coach", to: "/contact" }}
                  />
                  <FeatureCard
                    title="Monthly 1:1 video call"
                    desc="One 30–45 min coaching call per month, booked via Calendly."
                    cta={{ label: "Book your call", href: ENVOY_CALENDLY_URL }}
                  />
                  <FeatureCard
                    title="Tailored interview prep"
                    desc="Prep tailored to your specific target roles and employers."
                    cta={{ label: "Request prep", to: "/contact" }}
                  />
                </>
              ) : (
                <FeatureCard
                  locked
                  title="Envoy-only features"
                  desc="5 tailored resumes/mo, LinkedIn rewrite, company research, coach messaging, monthly 1:1 call, and tailored interview prep."
                  cta={{ label: "Upgrade to Envoy · $150/mo", to: "/services" }}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Resume Drop (Member Pool) */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {dropStatus ? (
                <ResumeDropCard status={dropStatus} onChanged={loadDrop} />
              ) : (
                <div className="border border-border bg-paper p-8 text-sm text-muted-foreground">
                  Loading Resume Drop status…
                </div>
              )}
            </div>
            <div>
              <NotificationsList />
            </div>
          </div>
        </div>
      </section>

      {/* Resume reviews (always available) */}
      <section className="bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Your Orders</div>
              <h2 className="mt-4 font-display text-2xl text-navy-deep lg:text-3xl">
                Expert Resume Reviews
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                A one-time, line-by-line review by a coach. Available to anyone, with or without
                a plan.
              </p>
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
                No reviews yet. Submit a resume to get expert, ATS-tailored feedback in 3–5 days.
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

      <ResumeDropIntroModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        onSaved={loadDrop}
      />
    </SiteLayout>
  );
}

function FeatureCard({
  title,
  desc,
  cta,
  locked,
}: {
  title: string;
  desc: string;
  cta: { label: string; to?: string; href?: string };
  locked?: boolean;
}) {
  return (
    <div
      className={
        "border p-6 " +
        (locked ? "border-dashed border-border bg-stone" : "border-border bg-stone")
      }
    >
      <div className="font-display text-lg text-navy-deep">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">
        {cta.to ? (
          <Link
            to={cta.to}
            className="text-xs font-medium uppercase tracking-wider text-navy-deep underline-offset-4 hover:underline"
          >
            {cta.label} →
          </Link>
        ) : (
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium uppercase tracking-wider text-navy-deep underline-offset-4 hover:underline"
          >
            {cta.label} →
          </a>
        )}
      </div>
    </div>
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
