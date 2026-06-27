import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { ProfileCard } from "@/components/profile-card";
import { getUnlockedCandidate, requestIntro } from "@/lib/unlock-flow.functions";

export const Route = createFileRoute(
  "/_authenticated/employer/unlocked/$candidateId",
)({
  head: () => ({ meta: [{ title: "Candidate Profile | Discover Diplomacy" }] }),
  component: UnlockedProfilePage,
});

const REASONS = [
  { value: "open_role_exploratory", label: "Open role — exploratory" },
  { value: "open_role_active", label: "Open role — actively hiring" },
  { value: "pipeline", label: "Building a pipeline" },
  { value: "specific_project", label: "Specific project" },
] as const;

type Data = Extract<
  Awaited<ReturnType<typeof getUnlockedCandidate>>,
  { ok: true }
>;

function UnlockedProfilePage() {
  const { candidateId } = useParams({
    from: "/_authenticated/employer/unlocked/$candidateId",
  });
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; msg: string }
    | { kind: "ok"; d: Data }
  >({ kind: "loading" });
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>(
    "open_role_exploratory",
  );
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    const r = await getUnlockedCandidate({ data: { candidate_id: candidateId } });
    if (r.ok) setState({ kind: "ok", d: r as Data });
    else setState({ kind: "error", msg: r.error ?? "Couldn't load profile" });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  async function submitIntro() {
    setSending(true);
    try {
      const r = await requestIntro({
        data: { candidate_id: candidateId, reason, message },
      });
      if ("ok" in r && r.ok) {
        toast.success(
          "ok" in r && (r as { reused?: boolean }).reused
            ? "An intro is already in progress."
            : "Intro request sent. We'll notify you when they respond.",
        );
        setMessage("");
        load();
      } else {
        toast.error("error" in r ? String(r.error) : "Couldn't send");
      }
    } finally {
      setSending(false);
    }
  }

  if (state.kind === "loading") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">Loading…</div>
      </SiteLayout>
    );
  }

  if (state.kind === "error") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
          <h1 className="font-display text-2xl text-navy-deep">
            {state.msg === "not_unlocked"
              ? "You haven't unlocked this candidate yet."
              : "Couldn't load this profile."}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            <Link to="/employer/browse" className="underline">Back to browse</Link>
          </p>
        </div>
      </SiteLayout>
    );
  }

  const { profile, contact, intro, unlocked_at } = state.d;
  const introStatus = intro?.status ?? null;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <Link to="/employer/unlocked" className="underline">
              ← My unlocked candidates
            </Link>
            <span>
              Unlocked {new Date(unlocked_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep">
            Candidate #
            {String(profile.user_id).replace(/-/g, "").slice(-4).toUpperCase()}
          </h1>
        </div>
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-3 lg:px-10">
          <div className="lg:col-span-2">
            <ProfileCard p={profile as never} />
          </div>

          <aside className="space-y-5">
            <div className="border border-border bg-paper p-5">
              <div className="eyebrow">Connect through DD</div>
              <h2 className="mt-2 font-display text-xl text-navy-deep">
                Request a warm intro
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                All intros run through the platform. The candidate is notified and
                can accept or decline. No raw contact is shared without their
                consent.
              </p>

              {introStatus === "pending" && (
                <div className="mt-4 border border-gilt/40 bg-gilt/10 p-3 text-xs text-navy-deep">
                  Your intro request is pending. We&apos;ll notify you when the
                  candidate responds.
                </div>
              )}
              {introStatus === "declined" && (
                <div className="mt-4 border border-border bg-stone p-3 text-xs text-muted-foreground">
                  This candidate isn&apos;t available right now.
                </div>
              )}

              {(!introStatus || introStatus === "declined" || introStatus === "closed") && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Reason
                    </label>
                    <select
                      value={reason}
                      onChange={(e) =>
                        setReason(e.target.value as typeof reason)
                      }
                      className="mt-1 w-full border border-border bg-white px-2 py-2 text-sm"
                    >
                      {REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Optional note (max 800 chars)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 800))}
                      rows={3}
                      className="mt-1 w-full border border-border bg-white p-2 text-sm"
                      placeholder="e.g., We're hiring a program officer for a climate finance portfolio…"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={submitIntro}
                    className="w-full rounded-sm bg-navy-deep px-4 py-2.5 text-sm font-medium uppercase tracking-wider text-paper disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Request intro"}
                  </button>
                </div>
              )}

              {(introStatus === "accepted" || introStatus === "connected") && (
                <div className="mt-4 space-y-2 border border-gilt/40 bg-gilt/10 p-3 text-xs">
                  <div className="font-semibold text-navy-deep">
                    Intro accepted — you can connect now.
                  </div>
                  {contact.email ? (
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-semibold text-navy-deep underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      Candidate prefers to be contacted through the platform.
                      We&apos;ll route your first message to them.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border border-border bg-paper p-5 text-xs text-muted-foreground">
              <div className="eyebrow">Privacy</div>
              <p className="mt-2">
                Candidate contact info is mediated by Discover Diplomacy. Email is
                visible only when the candidate has opted in or accepted your
                intro request.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
