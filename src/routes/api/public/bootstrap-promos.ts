import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";

const PROMOS = [
  {
    code: "IHEARTMAX",
    couponId: "iheartmax_100",
    percentOff: 100,
    name: "IHEARTMAX 100% off",
    maxRedemptions: 1,
    duration: "forever" as const,
  },
  {
    code: "IBELIEVE11",
    couponId: "ibelieve11_50",
    percentOff: 50,
    name: "IBELIEVE11 50% off",
    maxRedemptions: 50,
    duration: "forever" as const,
  },
];

async function ensurePromo(stripe: any, opts: (typeof PROMOS)[number]) {
  const existing = await stripe.promotionCodes.list({ code: opts.code, limit: 100 });
  const activeMatch = existing.data.find(
    (p: any) => p.active && p.max_redemptions === opts.maxRedemptions,
  );
  if (activeMatch) return { code: opts.code, status: "ok", id: activeMatch.id };

  // Deactivate any existing active codes with same string but wrong config
  for (const p of existing.data) {
    if (p.active) await stripe.promotionCodes.update(p.id, { active: false });
  }

  // Reuse coupon if it exists, else create it
  let couponId: string | undefined;
  try {
    const c = await stripe.coupons.retrieve(opts.couponId);
    if (c && !c.deleted) couponId = c.id;
  } catch {
    // not found
  }
  if (!couponId) {
    const coupon = await stripe.coupons.create({
      id: opts.couponId,
      percent_off: opts.percentOff,
      duration: opts.duration,
      name: opts.name,
    });
    couponId = coupon.id;
  }

  const created = await stripe.promotionCodes.create({
    coupon: couponId,
    code: opts.code,
    max_redemptions: opts.maxRedemptions,
  });
  return { code: opts.code, status: "created", id: created.id };
}

async function runForEnv(env: StripeEnv) {
  try {
    const stripe = createStripeClient(env);
    const results = [];
    for (const p of PROMOS) {
      try {
        results.push(await ensurePromo(stripe, p));
      } catch (e: any) {
        results.push({ code: p.code, status: "error", error: e?.raw?.message ?? e?.message ?? String(e) });
      }
    }
    return { env, results };
  } catch (e: any) {
    return { env, error: e?.message ?? String(e) };
  }
}

export const Route = createFileRoute("/api/public/bootstrap-promos")({
  server: {
    handlers: {
      GET: async () => {
        const [sandbox, live] = await Promise.all([runForEnv("sandbox"), runForEnv("live")]);
        return new Response(JSON.stringify({ sandbox, live }, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
