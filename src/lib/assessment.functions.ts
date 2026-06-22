import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
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
  summary: z.string(),
  paths: z
    .array(
      z.object({
        title: z.string(),
        why: z.string(),
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
  recommendedTier: z.enum(["Free Resources", "Resume Review", "Career Membership", "CEO Coaching"]),
  tierRationale: z.string(),
});

export type AssessmentPlan = z.infer<typeof PlanSchema>;

export const generateAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service not configured");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const system = `You are a senior career advisor at Discover Diplomacy, a career advisory practice for students and early-career professionals pursuing diplomacy, international policy, multilateral institutions, development, and global business. You write like a mentor: clear, specific, no fluff, no clichés, no emojis. Reference real organizations (State Department, USAID, World Bank, IMF, UN, NATO, OECD, IFC, IRC, Mercy Corps, CSIS, Brookings, CFR, Atlantic Council, McKinsey Public Sector, EY-Parthenon, etc.) where relevant. Be honest about tradeoffs (clearance timelines, salary realities, geographic constraints).`;

    const userPrompt = `Generate a personalized career plan based on this assessment.

Name: ${data.answers.name || "(not provided)"}
Career interests: ${data.answers.interests.join(", ")}
Current stage: ${data.answers.stage}
Main blocker: ${data.answers.blocker}
Non-negotiables: ${data.answers.nonNegotiables.join(", ") || "(none specified)"}
Strengths / background: ${data.answers.strengths || "(not provided)"}
Network strength: ${data.answers.network}

Produce:
- A 2-sentence summary spoken directly to the person.
- 3 distinct, well-matched career path recommendations (title, 1-sentence "why this fits you", 2-4 example role titles, 3-6 example employers).
- A 90-day action plan split into 0-30 / 30-60 / 60-90 day buckets, each with 3-5 concrete actions.
- 3-5 networking moves tailored to their stage and network strength.
- 3-5 resume updates specific to their target paths.
- A recommended Discover Diplomacy offering: "Free Resources" (still exploring), "Resume Review" (resume is the blocker), "Career Membership" (need ongoing structure + community), or "CEO Coaching" (senior transition / high stakes). Include a one-sentence rationale.`;

    let plan: AssessmentPlan;
    try {
      const result = await generateText({
        model,
        system,
        prompt: userPrompt,
        experimental_output: Output.object({ schema: PlanSchema }),
      });
      plan = result.experimental_output;
    } catch (err) {
      console.error("AI generation failed", err);
      throw new Error("We couldn't generate your plan right now. Please try again in a moment.");
    }

    // Persist lead + send plan email via admin client (bypasses RLS)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("assessment_leads").insert({
        email: data.email,
        name: data.answers.name || null,
        answers: data.answers,
        plan,
        recommended_tier: plan.recommendedTier,
        consent_newsletter: data.consentNewsletter,
      });
    } catch (err) {
      console.error("Failed to persist assessment lead", err);
    }

    // Fire the plan email (best-effort — failure does not block the user)
    try {
      const { sendInternalTransactionalEmail } = await import("./email/send-internal.server");
      await sendInternalTransactionalEmail({
        templateName: "assessment-plan",
        recipientEmail: data.email,
        idempotencyKey: `assessment-${data.email.toLowerCase()}-${Date.now()}`,
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
