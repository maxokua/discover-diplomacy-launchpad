import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { useWaitlist, type WaitlistInterest } from "@/components/waitlist-dialog";

const search = z.object({
  tier: z.enum(["compass", "envoy"]).default("compass"),
  cadence: z.enum(["monthly", "annual"]).default("monthly"),
});

export const Route = createFileRoute("/_authenticated/membership/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Join the waitlist | Discover Diplomacy" }] }),
  component: MembershipWaitlistPage,
});

function MembershipWaitlistPage() {
  const { tier } = Route.useSearch() as { tier: "compass" | "envoy" };
  const { open } = useWaitlist();
  const interest: WaitlistInterest = tier;
  const label = tier === "envoy" ? "Envoy" : "Compass";

  useEffect(() => {
    open({ interest, title: `Join the ${label} waitlist` });
  }, [open, interest, label]);

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Coming soon</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            {label} opens in waves.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Payments aren't live yet. Join the waitlist and we'll email you the moment {label}{" "}
            is available.
          </p>
          <button
            type="button"
            onClick={() => open({ interest, title: `Join the ${label} waitlist` })}
            className="mt-8 inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            Join the {label} waitlist
          </button>
        </div>
      </section>
    </SiteLayout>
  );
}
