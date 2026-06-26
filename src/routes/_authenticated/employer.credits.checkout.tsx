import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { z } from "zod";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createEmployerCreditsCheckout } from "@/lib/payments.functions";
import { SiteLayout } from "@/components/site-layout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const search = z.object({
  pack: z.enum(["single", "pack20"]).default("single"),
});

export const Route = createFileRoute("/_authenticated/employer/credits/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Buy employer credits | Discover Diplomacy" }] }),
  component: EmployerCreditsCheckoutPage,
});

const COPY = {
  single: { name: "1 credit", price: "$18", desc: "One profile unlock" },
  pack20: { name: "20 credits", price: "$300", desc: "Bundle (save $60)" },
} as const;

function EmployerCreditsCheckoutPage() {
  const { pack } = Route.useSearch() as { pack: "single" | "pack20" };
  const copy = COPY[pack];

  const options = useMemo(
    () => ({
      fetchClientSecret: async () => {
        const result = await createEmployerCreditsCheckout({
          data: {
            pack,
            environment: getStripeEnvironment(),
            returnUrl:
              window.location.origin +
              "/employer/credits/return?session_id={CHECKOUT_SESSION_ID}",
          },
        });
        if ("error" in result) throw new Error(result.error);
        if (!result.clientSecret) throw new Error("No client secret returned");
        return result.clientSecret;
      },
    }),
    [pack],
  );

  return (
    <SiteLayout>
      <PaymentTestModeBanner />
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Checkout</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            {copy.name} · {copy.price}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{copy.desc}. One-time purchase.</p>
          <div className="mt-10">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link to="/employer/resumes">← Back to candidate pool</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
