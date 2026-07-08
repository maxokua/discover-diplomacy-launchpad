import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";

const search = z.object({
  pack: z.enum(["single", "pack20"]).default("single"),
});

export const Route = createFileRoute("/_authenticated/employer/credits/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Employer credits | Discover Diplomacy" }] }),
  component: EmployerCreditsPage,
});

function EmployerCreditsPage() {
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
          <div className="eyebrow">Coming soon</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Employer credits open in waves.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Self-serve credit purchases aren't live yet. Reach out and we'll set up your
            account directly.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            Contact us
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
