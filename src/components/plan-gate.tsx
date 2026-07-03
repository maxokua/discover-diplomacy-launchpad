import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

type Plan = "free" | "compass" | "envoy";

type Props = {
  currentPlan: Plan;
  requires: "compass" | "envoy";
  unlockLine: string;
  children: ReactNode; // preview content shown to free users (and to entitled users, full-fidelity)
};

/**
 * PlanGate — renders the real feature preview for everyone. If the user is
 * not entitled, adds a single unlock line and an upgrade CTA. Never a
 * generic paywall wall.
 *
 * NOTE: This is UI only. Actual plan enforcement MUST happen in server
 * functions / RLS. Hiding UI is not enforcement.
 */
export function PlanGate({ currentPlan, requires, unlockLine, children }: Props) {
  const rank = { free: 0, compass: 1, envoy: 2 } as const;
  const entitled = rank[currentPlan] >= rank[requires];

  if (entitled) return <>{children}</>;

  const label = requires === "envoy" ? "Envoy" : "Compass";

  return (
    <div className="space-y-4">
      <div className="pointer-events-none opacity-70">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gilt/40 bg-gilt/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gilt" />
          <p className="text-sm text-navy-deep">
            <span className="font-medium">{label} unlocks:</span> {unlockLine}
          </p>
        </div>
        <Link
          to="/pricing"
          className="whitespace-nowrap rounded-md bg-navy-deep px-4 py-2 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy-deep/90"
        >
          Upgrade to {label}
        </Link>
      </div>
    </div>
  );
}
