import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { useWaitlist } from "@/components/waitlist-dialog";

const search = z.object({ reviewId: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/resume-review/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Join the Resume Review waitlist | Discover Diplomacy" }] }),
  component: ResumeReviewWaitlistPage,
});

function ResumeReviewWaitlistPage() {
  const { open } = useWaitlist();

  useEffect(() => {
    open({ interest: "resume_review", title: "Join the Resume Review waitlist" });
  }, [open]);

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Coming soon</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Expert Resume Review opens in waves.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Payments aren't live yet. Join the waitlist and we'll email you the moment reviews
            open for purchase.
          </p>
          <button
            type="button"
            onClick={() =>
              open({ interest: "resume_review", title: "Join the Resume Review waitlist" })
            }
            className="mt-8 inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            Join the Resume Review waitlist
          </button>
        </div>
      </section>
    </SiteLayout>
  );
}
