import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const search = z.object({ reviewId: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/resume-review/checkout")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Checkout · Resume Review | Discover Diplomacy" }] }),
  component: ResumeReviewCheckoutPage,
});

function ResumeReviewCheckoutPage() {
  const { reviewId } = Route.useSearch();
  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/resume-review/return?session_id={CHECKOUT_SESSION_ID}`
      : "/resume-review/return?session_id={CHECKOUT_SESSION_ID}";

  return (
    <SiteLayout>
      <PaymentTestModeBanner />
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Checkout · $25</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
            Expert Resume Review
          </h1>
          {!reviewId ? (
            <p className="mt-6 text-sm text-muted-foreground">
              We couldn't find your review order.{" "}
              <Link to="/resume-review" className="underline">
                Start a new one
              </Link>
              .
            </p>
          ) : (
            <div className="mt-8">
              <StripeEmbeddedCheckout
                kind="resume_review"
                reviewId={reviewId}
                returnUrl={returnUrl}
              />
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
