import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";

const search = z.object({ session_id: z.string().optional() });

export const Route = createFileRoute("/_authenticated/employer/credits/return")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Credits added | Discover Diplomacy" }] }),
  component: EmployerCreditsReturnPage,
});

function EmployerCreditsReturnPage() {
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Purchase complete</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Credits are being added
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your purchase was successful. Credits usually appear within a few seconds. You
            can return to the candidate pool now.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/employer/resumes"
              className="border border-navy-deep bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Back to candidates
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
