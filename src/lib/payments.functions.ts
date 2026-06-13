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

      // Ensure promo codes exist once. IHEARTMAX = 100% off, 25 redemptions.
      // IBELIEVE11 = 50% off, 50 redemptions.
      const ensurePromo = async (opts: {
        code: string;
        couponId: string;
        percentOff: number;
        name: string;
        maxRedemptions: number;
        duration: "forever" | "once";
      }) => {
        const existing = await stripe.promotionCodes.list({ code: opts.code, limit: 1 });
        if (existing.data.length) return;
        let couponId: string | undefined;
        const coupons = await stripe.coupons.list({ limit: 100 });
        const match = coupons.data.find(
          (c: any) => c.id === opts.couponId || c.name === opts.name,
        );
        if (match) {
          couponId = match.id;
        } else {
          const coupon = await stripe.coupons.create({
            id: opts.couponId,
            percent_off: opts.percentOff,
            duration: opts.duration,
            name: opts.name,
          });
          couponId = coupon.id;
        }
        await stripe.promotionCodes.create({
          coupon: couponId,
          code: opts.code,
          max_redemptions: opts.maxRedemptions,
        } as any);
      };

      try {
        await ensurePromo({
          code: "IHEARTMAX",
          couponId: "iheartmax_100",
          percentOff: 100,
          name: "IHEARTMAX 100% off",
          maxRedemptions: 25,
          duration: "forever",
        });
        await ensurePromo({
          code: "IBELIEVE11",
          couponId: "ibelieve11_50",
          percentOff: 50,
          name: "IBELIEVE11 50% off",
          maxRedemptions: 50,
          duration: "forever",
        });
      } catch (promoErr) {
        console.error("[membership] promo ensure failed", promoErr);
      }


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
        allow_promotion_codes: true,
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

// ─── Account / billing management ───────────────────────────────────────────

type PortalResult = { url: string } | { error: string };

export const createPortalSession = createServerFn({ method: "POST" })
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
  .handler(async ({ data, context }): Promise<PortalResult> => {
    try {
      const { data: sub } = await context.supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", context.userId)
        .eq("environment", data.environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!sub?.stripe_customer_id) return { error: "No billing account found." };

      const { createStripeClient } = await import("@/lib/stripe.server");
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id as string,
        return_url: data.returnUrl,
      });
      return { url: portal.url };
    } catch (error) {
      const { getStripeErrorMessage } = await import("@/lib/stripe.server");
      return { error: getStripeErrorMessage(error) };
    }
  });

export const cancelMembershipAtPeriodEnd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => {
    if (data.environment !== "sandbox" && data.environment !== "live")
      throw new Error("Invalid environment");
    return data;
  })
  .handler(async ({ data, context }) => {
    try {
      const { data: sub } = await context.supabase
        .from("subscriptions")
        .select("stripe_subscription_id, status")
        .eq("user_id", context.userId)
        .eq("environment", data.environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!sub?.stripe_subscription_id) return { error: "No active subscription." };
      if (!["active", "trialing", "past_due"].includes(sub.status as string))
        return { error: "Subscription isn't active." };

      const { createStripeClient } = await import("@/lib/stripe.server");
      const stripe = createStripeClient(data.environment);
      await stripe.subscriptions.update(sub.stripe_subscription_id as string, {
        cancel_at_period_end: true,
      });
      return { ok: true as const };
    } catch (error) {
      const { getStripeErrorMessage } = await import("@/lib/stripe.server");
      return { error: getStripeErrorMessage(error) };
    }
  });

export const resumeMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => {
    if (data.environment !== "sandbox" && data.environment !== "live")
      throw new Error("Invalid environment");
    return data;
  })
  .handler(async ({ data, context }) => {
    try {
      const { data: sub } = await context.supabase
        .from("subscriptions")
        .select("stripe_subscription_id")
        .eq("user_id", context.userId)
        .eq("environment", data.environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!sub?.stripe_subscription_id) return { error: "No subscription found." };

      const { createStripeClient } = await import("@/lib/stripe.server");
      const stripe = createStripeClient(data.environment);
      await stripe.subscriptions.update(sub.stripe_subscription_id as string, {
        cancel_at_period_end: false,
      });
      return { ok: true as const };
    } catch (error) {
      const { getStripeErrorMessage } = await import("@/lib/stripe.server");
      return { error: getStripeErrorMessage(error) };
    }
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { fullName: string }) => {
    const name = (data.fullName ?? "").trim();
    if (!name) throw new Error("Name is required");
    if (name.length > 100) throw new Error("Name too long");
    return { fullName: name };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ full_name: data.fullName })
      .eq("id", context.userId);
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ─── Reviewed resume delivery ───────────────────────────────────────────────

export const getReviewedResumeUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reviewId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.reviewId)) throw new Error("Invalid reviewId");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: review, error } = await context.supabase
      .from("resume_reviews")
      .select("user_id, reviewed_resume_path")
      .eq("id", data.reviewId)
      .single();
    if (error || !review) return { error: "Review not found" };
    if (review.user_id !== context.userId) {
      const { data: isAdmin } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (!isAdmin) return { error: "Forbidden" };
    }
    if (!review.reviewed_resume_path) return { error: "Not delivered yet" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(review.reviewed_resume_path as string, 60 * 10);
    if (signErr || !signed) return { error: signErr?.message ?? "Couldn't sign URL" };
    return { url: signed.signedUrl };
  });

// ─── Admin: list + deliver reviews ──────────────────────────────────────────

async function requireAdmin(context: any) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const adminListReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("resume_reviews")
      .select(
        "id, user_id, status, target_role, notes, resume_path, reviewed_resume_path, amount_cents, environment, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { error: error.message };
    return { reviews: data ?? [] };
  });

export const adminGetResumeUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reviewId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.reviewId)) throw new Error("Invalid reviewId");
    return data;
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: review } = await supabaseAdmin
      .from("resume_reviews")
      .select("resume_path, reviewed_resume_path")
      .eq("id", data.reviewId)
      .single();
    if (!review) return { error: "Not found" };
    const out: { originalUrl?: string; reviewedUrl?: string } = {};
    if (review.resume_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from("resumes")
        .createSignedUrl(review.resume_path as string, 600);
      if (signed) out.originalUrl = signed.signedUrl;
    }
    if (review.reviewed_resume_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from("resumes")
        .createSignedUrl(review.reviewed_resume_path as string, 600);
      if (signed) out.reviewedUrl = signed.signedUrl;
    }
    return out;
  });

export const adminCreateReviewedUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reviewId: string; filename: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.reviewId)) throw new Error("Invalid reviewId");
    if (!data.filename || typeof data.filename !== "string") throw new Error("Invalid filename");
    const ext = data.filename.toLowerCase().split(".").pop() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) throw new Error("Only PDF/DOC/DOCX allowed");
    return { reviewId: data.reviewId, ext };
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: review } = await supabaseAdmin
      .from("resume_reviews")
      .select("user_id")
      .eq("id", data.reviewId)
      .single();
    if (!review) return { error: "Not found" };
    const path = `${review.user_id}/reviewed/${data.reviewId}-${Date.now()}.${data.ext}`;
    const { data: upload, error } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUploadUrl(path);
    if (error || !upload) return { error: error?.message ?? "Couldn't create upload URL" };
    return { path, signedUrl: upload.signedUrl, token: upload.token };
  });

export const adminFinalizeReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      reviewId: string;
      reviewedPath?: string | null;
      status: "in_review" | "completed" | "canceled";
    }) => {
      if (!/^[0-9a-f-]{36}$/i.test(data.reviewId)) throw new Error("Invalid reviewId");
      if (!["in_review", "completed", "canceled"].includes(data.status))
        throw new Error("Invalid status");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { status: string; reviewed_resume_path?: string } = { status: data.status };
    if (data.reviewedPath) patch.reviewed_resume_path = data.reviewedPath;
    const { error } = await (supabaseAdmin
      .from("resume_reviews") as any)
      .update(patch)
      .eq("id", data.reviewId);
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ─── Coach + Employer portals ───────────────────────────────────────────────

type AppRole = "admin" | "coach" | "employer" | "moderator" | "user";

async function requireAnyRole(context: any, roles: AppRole[]) {
  for (const role of roles) {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: role,
    });
    if (data) return role;
  }
  throw new Error("Forbidden");
}


export const coachListClients = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAnyRole(context, ["coach", "admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reviews, error } = await supabaseAdmin
      .from("resume_reviews")
      .select("id, user_id, target_role, notes, status, created_at")
      .in("status", ["paid", "in_review", "pending_payment"])
      .eq("visible_to_coaches", true)
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) return { error: error.message };
    const userIds = Array.from(new Set((reviews ?? []).map((r) => r.user_id)));
    let profilesById: Record<string, { full_name: string | null; email: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      profilesById = Object.fromEntries(
        (profs ?? []).map((p) => [p.id as string, { full_name: p.full_name, email: p.email }]),
      );
    }
    const clients = (reviews ?? []).map((r) => ({
      id: r.id as string,
      user_id: r.user_id as string,
      target_role: r.target_role as string,
      notes: (r.notes as string | null) ?? null,
      status: r.status as string,
      created_at: r.created_at as string,
      full_name: profilesById[r.user_id as string]?.full_name ?? null,
      email: profilesById[r.user_id as string]?.email ?? null,
    }));
    return { clients };
  });

export const employerListResumes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAnyRole(context, ["employer", "admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reviews, error } = await supabaseAdmin
      .from("resume_reviews")
      .select(
        "id, user_id, target_role, status, resume_path, reviewed_resume_path, created_at",
      )
      .eq("visible_to_employers", true)
      .in("status", ["paid", "in_review", "completed"])
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) return { error: error.message };
    const userIds = Array.from(new Set((reviews ?? []).map((r) => r.user_id)));
    let profilesById: Record<string, { full_name: string | null; email: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      profilesById = Object.fromEntries(
        (profs ?? []).map((p) => [p.id as string, { full_name: p.full_name, email: p.email }]),
      );
    }
    const resumes = (reviews ?? [])
      .filter((r) => r.resume_path || r.reviewed_resume_path)
      .map((r) => ({
        id: r.id as string,
        user_id: r.user_id as string,
        target_role: r.target_role as string,
        status: r.status as string,
        has_reviewed: !!r.reviewed_resume_path,
        created_at: r.created_at as string,
        full_name: profilesById[r.user_id as string]?.full_name ?? null,
        email: profilesById[r.user_id as string]?.email ?? null,
      }));
    return { resumes };
  });

export const updateReviewVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    reviewId: string;
    visibleToEmployers?: boolean;
    visibleToCoaches?: boolean;
  }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.reviewId)) throw new Error("Invalid reviewId");
    return data;
  })
  .handler(async ({ data, context }) => {
    const update: { visible_to_employers?: boolean; visible_to_coaches?: boolean } = {};
    if (typeof data.visibleToEmployers === "boolean")
      update.visible_to_employers = data.visibleToEmployers;
    if (typeof data.visibleToCoaches === "boolean")
      update.visible_to_coaches = data.visibleToCoaches;
    if (!Object.keys(update).length) return { ok: true };
    const { error } = await context.supabase
      .from("resume_reviews")
      .update(update)
      .eq("id", data.reviewId)
      .eq("user_id", context.userId);
    if (error) return { error: error.message };
    return { ok: true };
  });

export const employerGetResumeUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reviewId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.reviewId)) throw new Error("Invalid reviewId");
    return data;
  })
  .handler(async ({ data, context }) => {
    await requireAnyRole(context, ["employer", "admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: review } = await supabaseAdmin
      .from("resume_reviews")
      .select("resume_path, reviewed_resume_path")
      .eq("id", data.reviewId)
      .single();
    if (!review) return { error: "Not found" };
    const path = (review.reviewed_resume_path ?? review.resume_path) as string | null;
    if (!path) return { error: "No file" };
    const { data: signed } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(path, 600);
    if (!signed) return { error: "Couldn't sign URL" };
    return { url: signed.signedUrl };
  });

export const myPortalRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const checks = await Promise.all(
      (["admin", "coach", "employer"] as const).map(async (role) => {
        const { data } = await context.supabase.rpc("has_role", {
          _user_id: context.userId,
          _role: role,
        });
        return [role, !!data] as const;
      }),
    );
    return Object.fromEntries(checks) as { admin: boolean; coach: boolean; employer: boolean };
  });

