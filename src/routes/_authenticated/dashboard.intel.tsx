import { createFileRoute } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/dashboard/dashboard-shell";

export const Route = createFileRoute("/_authenticated/dashboard/intel")({
  head: () => ({ meta: [{ title: "Intel Library | Discover Diplomacy" }] }),
  component: () => (
    <ScaffoldPage
      title="Intel Library"
      description="The Wednesday briefing, sector guides, employer teardowns, and interview breakdowns — all organized by archetype so you're never reading noise. This is where you stop scrolling LinkedIn and start actually learning the field."
    />
  ),
});
