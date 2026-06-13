import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Discover Diplomacy" },
      { name: "description", content: "Briefings on international careers — coming soon." },
      { property: "og:title", content: "Insights — Discover Diplomacy" },
      { property: "og:description", content: "Briefings on international careers — coming soon." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center px-6 py-24 lg:px-10 lg:py-32">
          <Reveal>
            <div className="eyebrow">Insights</div>
            <h1 className="mt-5 max-w-3xl font-display text-4xl text-navy-deep lg:text-6xl">
              Briefings on building an international career — coming soon.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              We're putting together a quarterly briefing series for students, professionals, and
              university career offices. Check back shortly.
            </p>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
