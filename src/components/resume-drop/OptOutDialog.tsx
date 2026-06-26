import { useState } from "react";
import { toast } from "sonner";
import { optOutOfResumeDrop } from "@/lib/resume-drop.functions";

export function OptOutDialog({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  async function confirm() {
    setBusy(true);
    try {
      const r = await optOutOfResumeDrop({});
      if ("error" in r && r.error) throw new Error(r.error);
      toast.success("Resume Drop paused. You can rejoin anytime.");
      onDone();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't pause");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/70 p-4">
      <div className="w-full max-w-md bg-paper p-6 shadow-xl">
        <h3 className="font-display text-xl text-navy-deep">Pause Resume Drop?</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          You'll no longer be discoverable by employers. Your profile stays private. You can
          rejoin anytime from your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={onClose}
            className="text-xs font-medium uppercase tracking-wider text-navy-deep hover:underline"
          >
            Never mind, keep me discoverable
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="border border-red-700 bg-red-700 px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-red-800 disabled:opacity-60"
          >
            {busy ? "Pausing…" : "Yes, pause Resume Drop"}
          </button>
        </div>
      </div>
    </div>
  );
}
