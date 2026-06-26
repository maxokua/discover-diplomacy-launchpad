import { createFileRoute, Link } from "@tanstack/react-router";

// /membership is kept as a redirect entry point to the unified /services page,
// which now hosts both Compass and Envoy plans.
export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Plans | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Two plans — Compass at $20/mo (or $192/yr) and Envoy at $150/mo (or $1,440/yr) — plus a one-time $25 Expert Resume Review. Cancel anytime.",
      },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/services" }],
  }),
  component: MembershipRedirect,
});

function MembershipRedirect() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-navy-deep">We've moved.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Our plans live on the Services page now.
        </p>
        <Link
          to="/services"
          className="mt-8 inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
        >
          See plans
        </Link>
      </div>
    </div>
  );
}
