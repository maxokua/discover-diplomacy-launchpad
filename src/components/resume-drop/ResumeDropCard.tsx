import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getResumeDropStatus,
  updateResumeDropOrgs,
  optInToResumeDrop,
} from "@/lib/resume-drop.functions";
import { OrgSelector } from "./OrgSelector";
import { OptOutDialog } from "./OptOutDialog";

type Status = Awaited<ReturnType<typeof getResumeDropStatus>>;

export function ResumeDropCard({
  status,
  onChanged,
}: {
  status: Status;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [optOutOpen, setOptOutOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [visibility, setVisibility] = useState<"all" | "selected">(status.visibility);
  const [orgIds, setOrgIds] = useState<string[]>(status.orgIds);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVisibility(status.visibility);
    setOrgIds(status.orgIds);
  }, [status]);

  async function saveOrgs() {
    setBusy(true);
    try {
      const r = await updateResumeDropOrgs({ data: { visibility, orgIds } });
      if ("error" in r && r.error) throw new Error(r.error);
      toast.success("Visibility updated");
      setEditing(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  async function rejoin() {
    setBusy(true);
    try {
      const r = await optInToResumeDrop({ data: { visibility: "all", orgIds: [] } });
      if ("error" in r && r.error) throw new Error(r.error);
      toast.success("You're discoverable again.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't rejoin");
    } finally {
      setBusy(false);
    }
  }

  const optedIn = status.status === "opted_in";

  return (
    <div className="border border-border bg-paper p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="eyebrow">Resume Drop</div>
          <h2 className="mt-2 font-display text-2xl text-navy-deep">
            {optedIn ? (
              <span className="flex items-center gap-2">
                <span className="text-emerald">✓</span> You're discoverable
              </span>
            ) : (
              "You're not in the Member Pool"
            )}
          </h2>
        </div>
        <button
          onClick={() => setHowOpen((v) => !v)}
          aria-label="How does this work if I get hired?"
          className="rounded-full border border-border bg-paper px-3 py-1 text-xs text-muted-foreground hover:bg-stone"
        >
          ? How does this work if I get hired?
        </button>
      </div>

      {howOpen && (
        <div className="mt-4 border border-border bg-stone/40 p-4 text-xs text-navy-deep/90">
          <strong>How does this work if I get hired?</strong>
          <p className="mt-2 text-muted-foreground">
            If an employer hires you after unlocking your profile through Discover Diplomacy, we
            take a small placement fee from the employer (not from you). This is how we sustain
            the platform, keep coaching affordable for members, and continue vetting. The employer
            also gets credits back as a thank you. You pay nothing — it's built into how employers
            use the platform.
          </p>
        </div>
      )}

      {optedIn ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Organizations that can see you"
              value={status.stats.visibleOrgCount.toString()}
              hint={status.visibility === "all" ? "All verified orgs" : "Cherry-picked"}
            />
            <Stat
              label="Unlocks this month"
              value={status.stats.unlocksThisMonth.toString()}
              emoji={status.stats.unlocksThisMonth > 0 ? "🔓" : undefined}
            />
            <Stat
              label="Employer intros"
              value={status.stats.introsReceived.toString()}
            />
          </div>

          {!editing ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setEditing(true)}
                className="border border-border bg-paper px-4 py-2 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
              >
                Edit who can see me
              </button>
              <button
                onClick={() => setOptOutOpen(true)}
                className="border border-red-700/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-red-700 hover:bg-red-50"
              >
                Opt out of Resume Drop
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <OrgSelector
                visibility={visibility}
                setVisibility={setVisibility}
                selectedIds={orgIds}
                setSelectedIds={setOrgIds}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={saveOrgs}
                  disabled={busy}
                  className="bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Save changes"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setVisibility(status.visibility);
                    setOrgIds(status.orgIds);
                  }}
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Join the Member Pool and verified employers can unlock your profile with credits. You
            stay in control of which organizations can see you, and can opt out anytime.
          </p>
          <button
            onClick={rejoin}
            disabled={busy}
            className="mt-5 bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
          >
            {busy ? "Joining…" : "Make me discoverable"}
          </button>
        </div>
      )}

      <OptOutDialog open={optOutOpen} onClose={() => setOptOutOpen(false)} onDone={onChanged} />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  emoji,
}: {
  label: string;
  value: string;
  hint?: string;
  emoji?: string;
}) {
  return (
    <div className="border border-border bg-stone/40 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl text-navy-deep">
        {value} {emoji && <span aria-hidden>{emoji}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
