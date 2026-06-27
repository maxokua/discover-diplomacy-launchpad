import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listMyCandidateIntros,
  respondToIntro,
  getUnlockPrivacy,
  updateUnlockPrivacy,
} from "@/lib/unlock-flow.functions";

type Intro = {
  id: string;
  employer_user_id: string;
  reason: string | null;
  message: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  employer_label: string;
  reason_pretty: string;
};

export function IntrosInbox() {
  const [intros, setIntros] = useState<Intro[] | null>(null);
  const [privacy, setPrivacy] = useState<{
    share_email_on_unlock: boolean;
    notify_email_on_unlock: boolean;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const r = await listMyCandidateIntros();
    setIntros((r.rows ?? []) as Intro[]);
  }

  useEffect(() => {
    refresh();
    getUnlockPrivacy().then(setPrivacy);
  }, []);

  async function respond(id: string, accept: boolean) {
    setBusyId(id);
    try {
      const r = await respondToIntro({ data: { intro_id: id, accept } });
      if ("ok" in r && r.ok) {
        toast.success(accept ? "Intro accepted." : "Intro declined.");
        refresh();
      } else {
        toast.error("error" in r ? String(r.error) : "Couldn't respond");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function togglePrivacy(
    field: "share_email_on_unlock" | "notify_email_on_unlock",
    value: boolean,
  ) {
    if (!privacy) return;
    const prev = privacy;
    setPrivacy({ ...privacy, [field]: value });
    const r = await updateUnlockPrivacy({ data: { [field]: value } });
    if (!r.ok) {
      setPrivacy(prev);
      toast.error("Couldn't save preference");
    }
  }

  const pending = (intros ?? []).filter((i) => i.status === "pending");
  const others = (intros ?? []).filter((i) => i.status !== "pending");

  return (
    <div className="space-y-5">
      <div className="border border-border bg-paper p-5">
        <div className="eyebrow">Intro requests</div>
        <h3 className="mt-1 font-display text-xl text-navy-deep">Your inbox</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          When an employer unlocks your profile, they can request a warm intro.
          You decide whether to connect.
        </p>

        {intros === null ? (
          <div className="mt-4 text-sm text-muted-foreground">Loading…</div>
        ) : intros.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">
            No intro requests yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((i) => (
              <IntroRow
                key={i.id}
                intro={i}
                busy={busyId === i.id}
                onAccept={() => respond(i.id, true)}
                onDecline={() => respond(i.id, false)}
              />
            ))}
            {others.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted-foreground underline">
                  Previous requests ({others.length})
                </summary>
                <div className="mt-3 space-y-3">
                  {others.map((i) => (
                    <IntroRow key={i.id} intro={i} historical />
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {privacy && (
        <div className="border border-border bg-paper p-5">
          <div className="eyebrow">Unlock privacy</div>
          <h3 className="mt-1 font-display text-xl text-navy-deep">
            Who can see your email
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Default is closed: employers never see your raw contact until you
            accept an intro.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={privacy.share_email_on_unlock}
                onChange={(e) =>
                  togglePrivacy("share_email_on_unlock", e.target.checked)
                }
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="font-medium text-navy-deep">
                  Share my email automatically on unlock
                </span>
                <span className="block text-xs text-muted-foreground">
                  Employers who spend a credit will see your email immediately,
                  before any intro.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={privacy.notify_email_on_unlock}
                onChange={(e) =>
                  togglePrivacy("notify_email_on_unlock", e.target.checked)
                }
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="font-medium text-navy-deep">
                  Email me when an employer unlocks me
                </span>
                <span className="block text-xs text-muted-foreground">
                  In-app notifications stay on either way.
                </span>
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function IntroRow({
  intro,
  busy,
  onAccept,
  onDecline,
  historical,
}: {
  intro: Intro;
  busy?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  historical?: boolean;
}) {
  return (
    <div className="border border-border bg-white p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-navy-deep">
            {intro.employer_label}
          </div>
          <div className="text-xs text-muted-foreground">
            {intro.reason_pretty} ·{" "}
            {new Date(intro.created_at).toLocaleDateString()}
          </div>
        </div>
        <StatusPill status={intro.status} />
      </div>
      {intro.message && (
        <div className="mt-2 border-l-2 border-stone pl-3 text-xs italic text-muted-foreground">
          “{intro.message}”
        </div>
      )}
      {!historical && intro.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            className="rounded-sm bg-navy-deep px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-paper disabled:opacity-60"
          >
            Accept
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDecline}
            className="rounded-sm border border-border bg-paper px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-navy-deep disabled:opacity-60"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-stone text-navy-deep",
    accepted: "bg-gilt/30 text-navy-deep",
    connected: "bg-gilt/30 text-navy-deep",
    declined: "bg-stone text-muted-foreground",
    closed: "bg-stone text-muted-foreground",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? "bg-stone text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}
