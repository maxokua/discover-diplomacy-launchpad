import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/_authenticated/membership/return")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Welcome to the Membership — Discover Diplomacy" }] }),
  component: MembershipReturn,
});

function MembershipReturn() {
  const { session_id } = Route.useSearch();
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="eyebrow">Welcome aboard</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-5xl">
            {session_id ? "You're in. Let's get to work." : "Your session couldn't be found."}
          </h1>
          {session_id ? (
            <>
              <p className="mt-5 text-muted-foreground">
                Your Career Membership is active. Head to your dashboard to upload your documents
                and tell us the 5 jobs you want us to tailor your materials for.
              </p>
              <div className="mt-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Go to dashboard →
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-5 text-muted-foreground">
              <Link to="/membership" className="underline">
                Try again
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
