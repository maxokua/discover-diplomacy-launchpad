import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createMembershipCheckout } from "@/lib/payments.functions";
import { SiteLayout } from "@/components/site-layout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/_authenticated/membership/checkout")({
  head: () => ({ meta: [{ title: "Start Membership — Discover Diplomacy" }] }),
  component: MembershipCheckoutPage,
});

function MembershipCheckoutPage() {
  const options = useMemo(
    () => ({
      fetchClientSecret: async () => {
        const result = await createMembershipCheckout({
          data: {
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
    [],
  );

  return (
    <SiteLayout>
      <PaymentTestModeBanner />
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Checkout</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Career Membership — $50/month
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Billed monthly. Cancel anytime from your dashboard.
          </p>
          <div className="mt-10">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link to="/dashboard">← Back to dashboard</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
