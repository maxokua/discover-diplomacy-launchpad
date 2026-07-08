import { useCallback } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import {
  createSubscriptionCheckout,
  createResumeReviewCheckout,
} from "@/lib/payments.functions";

type SubscriptionProps = {
  kind: "subscription";
  tier: "compass" | "envoy";
  cadence?: "monthly" | "annual";
  returnUrl: string;
};

type ResumeReviewProps = {
  kind: "resume_review";
  reviewId: string;
  returnUrl: string;
};

type Props = SubscriptionProps | ResumeReviewProps;

export function StripeEmbeddedCheckout(props: Props) {
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const environment = getStripeEnvironment();
    let result: { clientSecret: string } | { error: string };
    if (props.kind === "subscription") {
      result = await createSubscriptionCheckout({
        data: {
          tier: props.tier,
          cadence: props.cadence ?? "monthly",
          returnUrl: props.returnUrl,
          environment,
        },
      });
    } else {
      result = await createResumeReviewCheckout({
        data: {
          reviewId: props.reviewId,
          returnUrl: props.returnUrl,
          environment,
        },
      });
    }
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe did not return a client secret");
    return result.clientSecret;
  }, [props]);

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
