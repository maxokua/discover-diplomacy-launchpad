import { createFileRoute } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/dashboard/dashboard-shell";

export const Route = createFileRoute("/_authenticated/dashboard/resume-drop")({
  head: () => ({ meta: [{ title: "Resume Drop | Discover Diplomacy" }] }),
  component: () => (
    <ScaffoldPage
      title="Resume Drop"
      description="Opt in and vetted employers can browse an anonymized version of your profile — sector, function, location, skills, no name or contact. If they want to reach you, they pay to unlock and you decide whether to accept the intro. You stay in control the entire time."
    />
  ),
});
