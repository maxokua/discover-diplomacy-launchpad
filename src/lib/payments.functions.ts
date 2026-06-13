import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StripeEnv = "sandbox" | "live";

type CheckoutResult = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: any,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createResumeReviewCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      reviewId: string;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!/^[0-9a-f-]{36}$/i.test(data.reviewId)) throw new Error("Invalid reviewId");
      if (!data.returnUrl || typeof data.returnUrl !== "string")
        throw new Error("Invalid returnUrl");
      if (data.environment !== "sandbox" && data.environment !== "live")
        throw new Error("Invalid environment");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { createStripeClient } = await import("@/lib/stripe.server");

      const { data: review, error: reviewError } = await context.supabase
        .from("resume_reviews")
        .select("id, user_id, status")
        .eq("id", data.reviewId)
        .single();
      if (reviewError || !review) throw new Error("Review not found");
      if (review.user_id !== context.userId) throw new Error("Forbidden");

      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: ["resume_review_25"] });
      if (!prices.data.length) throw new Error("Price not configured");
      const stripePrice = prices.data[0];

      const email = (context.claims as { email?: string } | undefined)?.email;
      const customerId = await resolveOrCreateCustomer(stripe, {
        email,
        userId: context.userId,
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: "Expert Resume Review" },
        metadata: { userId: context.userId, reviewId: data.reviewId },
        automatic_tax: { enabled: true },
      });

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("resume_reviews")
        .update({ stripe_session_id: session.id, environment: data.environment })
        .eq("id", data.reviewId);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      const { getStripeErrorMessage } = await import("@/lib/stripe.server");
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createMembershipCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { returnUrl: string; environment: StripeEnv }) => {
      if (!data.returnUrl || typeof data.returnUrl !== "string")
        throw new Error("Invalid returnUrl");
      if (data.environment !== "sandbox" && data.environment !== "live")
        throw new Error("Invalid environment");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { createStripeClient } = await import("@/lib/stripe.server");

      // Prevent duplicate active memberships
      const { data: existing } = await context.supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", context.userId)
        .eq("environment", data.environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (
        existing &&
        ["active", "trialing", "past_due"].includes(existing.status as string)
      ) {
        return { error: "You already have an active membership." };
      }

      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: ["career_membership_monthly"] });
      if (!prices.data.length) throw new Error("Price not configured");
      const stripePrice = prices.data[0];

      const email = (context.claims as { email?: string } | undefined)?.email;
      const customerId = await resolveOrCreateCustomer(stripe, {
        email,
        userId: context.userId,
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        metadata: { userId: context.userId },
        subscription_data: { metadata: { userId: context.userId } },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      const { getStripeErrorMessage } = await import("@/lib/stripe.server");
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createCoachingCallCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { returnUrl: string; environment: StripeEnv }) => {
      if (!data.returnUrl || typeof data.returnUrl !== "string")
        throw new Error("Invalid returnUrl");
      if (data.environment !== "sandbox" && data.environment !== "live")
        throw new Error("Invalid environment");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { createStripeClient } = await import("@/lib/stripe.server");

      // Members only
      const { data: sub } = await context.supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", context.userId)
        .eq("environment", data.environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const isMember =
        !!sub &&
        (["active", "trialing"].includes(sub.status as string) ||
          (sub.status === "canceled" &&
            sub.current_period_end &&
            new Date(sub.current_period_end as string) > new Date()));
      if (!isMember) {
        return { error: "The CEO coaching call is an add-on for active members." };
      }

      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: ["ceo_coaching_call_30"] });
      if (!prices.data.length) throw new Error("Price not configured");
      const stripePrice = prices.data[0];

      const email = (context.claims as { email?: string } | undefined)?.email;
      const customerId = await resolveOrCreateCustomer(stripe, {
        email,
        userId: context.userId,
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: "30-Minute CEO Coaching Call" },
        metadata: { userId: context.userId, kind: "ceo_coaching_call" },
        automatic_tax: { enabled: true },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      const { getStripeErrorMessage } = await import("@/lib/stripe.server");
      return { error: getStripeErrorMessage(error) };
    }
  });
