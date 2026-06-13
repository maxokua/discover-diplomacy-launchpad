import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { Check } from "lucide-react";

const search = z.object({ session_id: z.string().optional() });

export const Route = createFileRoute("/_authenticated/resume-review/return")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Order received | Discover Diplomacy" }] }),
  component: ReturnPage,
});

function ReturnPage() {
  const { session_id } = Route.useSearch();
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-28 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-emerald">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-8 font-display text-3xl text-navy-deep lg:text-5xl">
            {session_id ? "Payment received." : "Order received."}
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            An expert reviewer will be in touch within 3–5 business days with a tailored,
            line-by-line revision optimized for ATS.
          </p>
          <div className="mt-10">
            <Link
              to="/dashboard"
              className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
