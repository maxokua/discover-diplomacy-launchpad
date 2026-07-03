import { createFileRoute } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/dashboard/dashboard-shell";

export const Route = createFileRoute("/_authenticated/dashboard/resume-studio")({
  head: () => ({ meta: [{ title: "Resume Studio | Discover Diplomacy" }] }),
  component: () => (
    <ScaffoldPage
      title="Resume Studio"
      description="Upload your resume, get a fast expert-designed score across five dimensions, and see line-by-line rewrite suggestions calibrated to your target roles. No generic AI polish — every recommendation is anchored in what hiring managers in your archetype actually look for."
    />
  ),
});
