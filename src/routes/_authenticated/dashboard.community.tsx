import { createFileRoute } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/dashboard/dashboard-shell";

export const Route = createFileRoute("/_authenticated/dashboard/community")({
  head: () => ({ meta: [{ title: "Community | Discover Diplomacy" }] }),
  component: () => (
    <ScaffoldPage
      title="Community"
      description="A serious, moderated members' space — no bots, no recruiters cold-DMing, no motivational nonsense. Peers in your archetype and a step or two ahead, plus outreach scripts and referral threads you can actually use."
    />
  ),
});
