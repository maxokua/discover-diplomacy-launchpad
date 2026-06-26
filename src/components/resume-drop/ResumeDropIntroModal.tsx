import { useState } from "react";
import { toast } from "sonner";
import { OrgSelector } from "./OrgSelector";
import { markIntroSeen, optInToResumeDrop } from "@/lib/resume-drop.functions";

type Step = "intro" | "configure" | "done";

export function ResumeDropIntroModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [visibility, setVisibility] = useState<"all" | "selected">("all");
  const [orgIds, setOrgIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function dismiss() {
    await markIntroSeen({});
    onClose();
  }

  async function save() {
    setBusy(true);
    try {
      const res = await optInToResumeDrop({ data: { visibility, orgIds } });
      if ("error" in res && res.error) throw new Error(res.error);
      toast.success("You're in the Member Pool. Welcome.");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/70 p-4">
      <div className="relative w-full max-w-2xl bg-paper shadow-xl">
        <div className="border-b border-border px-8 py-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
            Member Pool
          </div>
          <h2 className="mt-2 font-display text-2xl text-navy-deep lg:text-3xl">
            Get discovered by vetted employers.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join our Member Pool — employers unlock your profile with credits and we make the
            intro.
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-8 py-6">
          {step === "intro" && (
            <div className="space-y-4 text-sm text-navy-deep/90">
              <p>
                Your profile contains everything you want employers to see: your resume, target
                roles, languages, location, what you're looking for. When you opt in, members of
                verified organizations (governments, NGOs, think tanks, multilaterals, companies,
                foundations) can spend credits to unlock your profile and see your full materials.
              </p>
              <p>
                You're in complete control. See which organizations are searching. Choose to be
                discoverable to all of them — or just the ones you want. Opt out anytime.
              </p>
              <p>
                When an employer is interested, we send you an automated introduction. No spam, no
                going around us.
              </p>
              <p className="text-xs text-muted-foreground">
                <a href="/employers/resume-drop" className="underline" target="_blank" rel="noreferrer">
                  Learn more about the Member Pool
                </a>
              </p>
            </div>
          )}

          {step === "configure" && (
            <OrgSelector
              visibility={visibility}
              setVisibility={setVisibility}
              selectedIds={orgIds}
              setSelectedIds={setOrgIds}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-8 py-5">
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
          >
            Let me think about it
          </button>
          {step === "intro" ? (
            <button
              type="button"
              onClick={() => setStep("configure")}
              className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              I want to be discoverable
            </button>
          ) : (
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save & opt in"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
