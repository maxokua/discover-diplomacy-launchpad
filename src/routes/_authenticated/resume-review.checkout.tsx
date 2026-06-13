import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { z } from "zod";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createResumeReviewCheckout } from "@/lib/payments.functions";
import { SiteLayout } from "@/components/site-layout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const search = z.object({ reviewId: z.string().uuid() });

export const Route = createFileRoute("/_authenticated/resume-review/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Checkout — Discover Diplomacy" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { reviewId } = Route.useSearch();

  const options = useMemo(
    () => ({
      fetchClientSecret: async () => {
        const result = await createResumeReviewCheckout({
          data: {
            reviewId,
            environment: getStripeEnvironment(),
            returnUrl: window.location.origin + "/resume-review/return?session_id={CHECKOUT_SESSION_ID}",
          },
        });
        if ("error" in result) throw new Error(result.error);
        if (!result.clientSecret) throw new Error("No client secret returned");
        return result.clientSecret;
      },
    }),
    [reviewId],
  );

  return (
    <SiteLayout>
      <PaymentTestModeBanner />
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Checkout</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Expert Resume Review — $25
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your order will be queued the moment payment completes.
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
