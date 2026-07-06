import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { useWaitlist } from "@/components/waitlist-dialog";

const search = z.object({
  pack: z.enum(["single", "pack20"]).default("single"),
});

export const Route = createFileRoute("/_authenticated/employer/credits/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Join the employer waitlist | Discover Diplomacy" }] }),
  component: EmployerCreditsWaitlistPage,
});

function EmployerCreditsWaitlistPage() {
  const { open } = useWaitlist();

  useEffect(() => {
    open({ interest: "employer", title: "Join the employer waitlist" });
  }, [open]);

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Coming soon</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Employer credits open in waves.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Payments aren't live yet. Join the waitlist and we'll email you the moment credit
            purchases open.
          </p>
          <button
            type="button"
            onClick={() =>
              open({ interest: "employer", title: "Join the employer waitlist" })
            }
            className="mt-8 inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            Join the employer waitlist
          </button>
        </div>
      </section>
    </SiteLayout>
  );
}
