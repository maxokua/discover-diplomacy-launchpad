import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const search = z.object({
  tier: z.enum(["compass", "envoy"]).default("compass"),
  cadence: z.enum(["monthly", "annual"]).default("monthly"),
});

export const Route = createFileRoute("/_authenticated/membership/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Checkout | Discover Diplomacy" }] }),
  component: MembershipCheckoutPage,
});

function MembershipCheckoutPage() {
  const { tier, cadence } = Route.useSearch();
  const label = tier === "envoy" ? "Envoy" : "Compass";
  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/membership/return?session_id={CHECKOUT_SESSION_ID}`
      : "/membership/return?session_id={CHECKOUT_SESSION_ID}";

  return (
    <SiteLayout>
      <PaymentTestModeBanner />
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Checkout</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Join {label}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Secure payment via Stripe. You can cancel any time from your dashboard.
          </p>
          <div className="mt-8">
            <StripeEmbeddedCheckout
              kind="subscription"
              tier={tier}
              cadence={cadence}
              returnUrl={returnUrl}
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
