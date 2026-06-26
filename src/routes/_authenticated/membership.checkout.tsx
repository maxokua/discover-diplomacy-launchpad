import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { z } from "zod";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createSubscriptionCheckout } from "@/lib/payments.functions";
import { SiteLayout } from "@/components/site-layout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const search = z.object({
  tier: z.enum(["compass", "envoy"]).default("compass"),
  cadence: z.enum(["monthly", "annual"]).default("monthly"),
});

export const Route = createFileRoute("/_authenticated/membership/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Start your plan | Discover Diplomacy" }] }),
  component: MembershipCheckoutPage,
});

const COPY = {
  compass: { name: "Compass", monthly: "$20 / month", annual: "$192 / year (save $48)" },
  envoy: { name: "Envoy", monthly: "$150 / month", annual: "$1,440 / year (save $360)" },
} as const;

function MembershipCheckoutPage() {
  const { tier, cadence } = Route.useSearch() as {
    tier: "compass" | "envoy";
    cadence: "monthly" | "annual";
  };
  const copy = COPY[tier];
  const price = cadence === "annual" ? copy.annual : copy.monthly;


  const options = useMemo(
    () => ({
      fetchClientSecret: async () => {
        const result = await createSubscriptionCheckout({
          data: {
            tier,
            cadence,
            environment: getStripeEnvironment(),
            returnUrl:
              window.location.origin +
              "/membership/return?session_id={CHECKOUT_SESSION_ID}",
          },
        });
        if ("error" in result) throw new Error(result.error);
        if (!result.clientSecret) throw new Error("No client secret returned");
        return result.clientSecret;
      },
    }),
    [tier, cadence],
  );

  return (
    <SiteLayout>
      <PaymentTestModeBanner />
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Checkout</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            {copy.name} · {price}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Billed {cadence}. Cancel anytime from your dashboard.
          </p>
          <div className="mt-10">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link to="/services">← Compare plans</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
