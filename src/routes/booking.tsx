import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";

const Cal = lazy(() => import("@calcom/embed-react"));

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book a call — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Schedule a 60-minute conversation with Discover Diplomacy about your path into international affairs.",
      },
      { property: "og:title", content: "Book a call — Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Schedule a 60-minute conversation about your path into international affairs.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://discoverdiplomacy.org/booking" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Book a call — Discover Diplomacy" },
      {
        name: "twitter:description",
        content:
          "Schedule a 60-minute conversation about your path into international affairs.",
      },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/booking" }],
  }),
  component: BookingPage,
});

function BookingPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="text-center">
            <Reveal as="div" className="eyebrow">
              Advisory call
            </Reveal>
            <Reveal as="h1" delay={80} className="mt-6">
              Book a call
            </Reveal>
            <Reveal
              as="p"
              delay={160}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
            >
              A 60-minute conversation about your path into international affairs.
            </Reveal>
          </div>

          <Reveal delay={240} className="mt-12">
            <CalendarEmbed />
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

function CalendarEmbed() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-full min-h-[700px] animate-pulse rounded-lg border border-border bg-stone"
        aria-label="Loading booking calendar"
      />
    );
  }

  return (
    <div className="w-full min-h-[700px] overflow-hidden rounded-lg border border-border bg-paper">
      <Suspense
        fallback={
          <div
            className="w-full min-h-[700px] animate-pulse rounded-lg border border-border bg-stone"
            aria-label="Loading booking calendar"
          />
        }
      >
        <Cal
          calLink="discoverdiplomacy/meet-with-max"
          style={{ width: "100%", height: "700px", minHeight: "700px" }}
        />
      </Suspense>
    </div>
  );
}
