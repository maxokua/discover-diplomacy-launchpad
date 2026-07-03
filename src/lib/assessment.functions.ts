import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createHash } from "node:crypto";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const AnswersSchema = z.object({
  interests: z.array(z.string()).min(1).max(6),
  stage: z.string().min(1).max(60),
  blocker: z.string().min(1).max(60),
  nonNegotiables: z.array(z.string()).max(8),
  strengths: z.string().max(600).optional().default(""),
  network: z.string().min(1).max(60),
  name: z.string().max(80).optional().default(""),
});

const InputSchema = z.object({
  email: z.string().email().max(254),
  consentNewsletter: z.boolean().default(true),
  answers: AnswersSchema,
});

const PlanSchema = z.object({
  summary: z.string().describe("Two sentences spoken directly to the person."),
  paths: z
    .array(
      z.object({
        title: z.string().describe("Short career path title"),
        why: z.string().describe("One sentence on why this path fits this person"),
        exampleRoles: z.array(z.string()).min(2).max(5),
        exampleEmployers: z.array(z.string()).min(3).max(8),
      }),
    )
    .length(3),
  ninetyDayPlan: z.object({
    days0to30: z.array(z.string()).min(3).max(6),
    days30to60: z.array(z.string()).min(3).max(6),
    days60to90: z.array(z.string()).min(3).max(6),
  }),
  networkingStrategy: z.array(z.string()).min(3).max(6),
  resumeUpdates: z.array(z.string()).min(3).max(6),
  recommendedTier: z.enum(["Free Resources", "Resume Review", "Career Membership"]),
  tierRationale: z.string().describe("One sentence justifying the recommended tier."),
});

export type AssessmentPlan = z.infer<typeof PlanSchema>;

export const generateAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service not configured");

    const normalizedEmail = data.email.toLowerCase().trim();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // ── Per-IP rate limit ──────────────────────────────────────────────────
    // Prevents an anonymous caller from spraying "career plan" emails to a
    // list of arbitrary addresses by cycling the recipient email. Hashed so
    // we never persist a raw client IP.
    const req = getRequest();
    const rawIp =
      req?.headers.get("cf-connecting-ip") ||
      req?.headers.get("x-real-ip") ||
      (req?.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
      "unknown";
    const ipHash = createHash("sha256")
      .update(`${rawIp}|${process.env.SUPABASE_URL ?? ""}`)
      .digest("hex");

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    if (ipHash && rawIp !== "unknown") {
      const { count: ipCount } = await supabaseAdmin
        .from("assessment_leads")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", oneHourAgo);
      if ((ipCount ?? 0) >= 3) {
        throw new Error(
          "You've hit the hourly limit for assessments from this network. Please try again later.",
        );
      }
    }

    // ── Per-email rate limit ───────────────────────────────────────────────
    // Refuse to spend AI credits or queue another email if the same address
    // already received an assessment in the last hour. Returns the cached
    // plan so the UI still works for the legitimate user.
    const { data: recent } = await supabaseAdmin
      .from("assessment_leads")
      .select("plan, created_at")
      .eq("email", normalizedEmail)
      .gte("created_at", oneHourAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.plan) {
      return { plan: recent.plan as AssessmentPlan, cached: true };
    }


    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("openai/gpt-5-mini");

    const system = `You are a senior career advisor at Discover Diplomacy, a career advisory practice for students and early-career professionals pursuing diplomacy, international policy, multilateral institutions, development, and global business. You write like a mentor: clear, specific, no fluff, no clichés, no emojis. Reference real organizations (State Department, USAID, World Bank, IMF, UN, NATO, OECD, IFC, IRC, Mercy Corps, CSIS, Brookings, CFR, Atlantic Council, McKinsey Public Sector, EY-Parthenon, etc.) where relevant. Be honest about tradeoffs (clearance timelines, salary realities, geographic constraints).`;

    const userPrompt = `Generate a personalized career plan based on this assessment. Return JSON exactly matching the provided schema — use the EXACT field names from the schema (camelCase). Do not invent or rename keys.

Person:
- Name: ${data.answers.name || "(not provided)"}
- Career interests: ${data.answers.interests.join(", ")}
- Current stage: ${data.answers.stage}
- Main blocker: ${data.answers.blocker}
- Non-negotiables: ${data.answers.nonNegotiables.join(", ") || "(none specified)"}
- Strengths / background: ${data.answers.strengths || "(not provided)"}
- Network strength: ${data.answers.network}

Required output:
- "summary": 2 sentences, direct address.
- "paths": exactly 3 distinct paths. Each has "title", "why" (1 sentence), "exampleRoles" (2–4 titles), "exampleEmployers" (3–6 real orgs).
- "ninetyDayPlan": object with "days0to30", "days30to60", "days60to90" — each an array of 3–5 concrete actions.
- "networkingStrategy": 3–5 specific moves tailored to their stage + network.
- "resumeUpdates": 3–5 specific edits.
- "recommendedTier": one of "Free Resources" (still exploring), "Resume Review" (resume is the blocker), or "Career Membership" (need ongoing structure + community).
- "tierRationale": 1 sentence.`;

    let plan: AssessmentPlan;
    try {
      const { object } = await generateObject({
        model,
        schema: PlanSchema,
        system,
        prompt: userPrompt,
      });
      plan = object;
    } catch (err) {
      console.error("AI generation failed", err);
      throw new Error("We couldn't generate your plan right now. Please try again in a moment.");
    }


    // Persist lead + send plan email via admin client (bypasses RLS)
    try {
      await supabaseAdmin.from("assessment_leads").insert({
        email: normalizedEmail,
        name: data.answers.name || null,
        answers: data.answers,
        plan,
        recommended_tier: plan.recommendedTier,
        consent_newsletter: data.consentNewsletter,
        ip_hash: ipHash,
      });
    } catch (err) {
      console.error("Failed to persist assessment lead", err);
    }

    // Fire the plan email (best-effort — failure does not block the user).
    // Idempotency key is stable per email per day so repeated calls collapse
    // to a single queued send instead of flooding the recipient.
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { sendInternalTransactionalEmail } = await import("./email/send-internal.server");
      await sendInternalTransactionalEmail({
        templateName: "assessment-plan",
        recipientEmail: normalizedEmail,
        idempotencyKey: `assessment-${normalizedEmail}-${today}`,
        templateData: {
          name: data.answers.name || undefined,
          summary: plan.summary,
          paths: plan.paths,
          days0to30: plan.ninetyDayPlan.days0to30,
          days30to60: plan.ninetyDayPlan.days30to60,
          days60to90: plan.ninetyDayPlan.days60to90,
          networkingStrategy: plan.networkingStrategy,
          resumeUpdates: plan.resumeUpdates,
          recommendedTier: plan.recommendedTier,
          tierRationale: plan.tierRationale,
          consultationUrl: "https://discoverdiplomacy.org/contact",
        },
      });
    } catch (err) {
      console.error("Failed to send plan email", err);
    }

    return { plan };
  });
