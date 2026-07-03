import { createFileRoute } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/dashboard/dashboard-shell";

export const Route = createFileRoute("/_authenticated/dashboard/opportunities")({
  head: () => ({ meta: [{ title: "Opportunities | Discover Diplomacy" }] }),
  component: () => (
    <ScaffoldPage
      title="Opportunities"
      description="This is where the live job board lives — filtered to your archetype, work authorization, and location. Every posting shows the deadline, the actual hiring org, and what your resume needs to look like to be competitive. No résumé black holes."
    />
  ),
});
