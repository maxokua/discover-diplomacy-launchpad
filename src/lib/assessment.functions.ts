import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createHash } from "node:crypto";
import { z } from "zod";

const AnswersSchema = z.object({
  name: z.string().max(80).optional().default(""),
  q1_stage: z.string().min(1).max(80),
  q2_sector: z.string().min(1).max(120),
  q3_work: z.string().min(1).max(80),
  q4_issues: z.array(z.string().max(80)).max(2),
  q5_location: z.string().min(1).max(80),
  q6_tradeoff: z.string().min(1).max(80),
  q7_timeline: z.string().min(1).max(60),
  q8_have: z.array(z.string().max(80)).max(8),
  q9_authorization: z.enum([
    "U.S. citizen",
    "Green card or work-authorized",
    "International student (visa)",
    "Prefer not to say",
  ]),
  q10_blocker: z.string().min(1).max(120),
});

const PathSchema = z.object({
  title: z.string().max(80),
  archetypeKey: z.string().max(80).optional(),
  why: z.string().max(500),
  exampleRoles: z.array(z.string().max(80)).min(2).max(5),
  exampleEmployers: z.array(z.string().max(80)).min(2).max(6),
  directoryHref: z.string().max(200).optional(),
});

const PlanSchema = z.object({
  archetype: z.string().max(80),
  archetypeKey: z.string().max(80).optional(),
  summary: z.string().max(600),
  primary: PathSchema,
  adjacent: z.array(PathSchema).length(2),
  days0to30: z.array(z.string().max(200)).min(1).max(5),
  days30to60: z.array(z.string().max(200)).min(1).max(5),
  days60to90: z.array(z.string().max(200)).min(1).max(5),
});

export type AssessmentPlan = z.infer<typeof PlanSchema>;
export type AssessmentAnswers = z.infer<typeof AnswersSchema>;

const InputSchema = z.object({
  email: z.string().email().max(254),
  consentNewsletter: z.boolean().default(true),
  answers: AnswersSchema,
  plan: PlanSchema,
});

/**
 * Persists the assessment lead and emails the plan. This function is
 * deliberately failure-tolerant: the plan itself is computed client-side,
 * so the visitor's results must render even if the database, secrets, or
 * email pipeline are unavailable. Raw infrastructure errors (missing env
 * vars, connection failures) are logged server-side only — never thrown
 * back to the visitor.
 */
export const generateAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const plan = data.plan;
    const normalizedEmail = data.email.toLowerCase().trim();

    let persisted = false;
    let emailed = false;

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Per-IP rate limit
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

      if (rawIp !== "unknown") {
        const { count: ipCount, error: countError } = await supabaseAdmin
          .from("assessment_leads")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .gte("created_at", oneHourAgo);
        if (countError) throw countError;
        if ((ipCount ?? 0) >= 5) {
          // Deliberate, visitor-safe message — not an infra detail.
          throw new Error(
            "You've hit the hourly limit for assessments from this network. Please try again later.",
          );
        }
      }

      // Persist lead
      const { error: insertError } = await supabaseAdmin.from("assessment_leads").insert({
        email: normalizedEmail,
        name: data.answers.name || null,
        answers: data.answers,
        plan,
        recommended_tier: "Compass",
        consent_newsletter: data.consentNewsletter,
        ip_hash: ipHash,
      });
      if (insertError) throw insertError;
      persisted = true;
    } catch (err) {
      // Rate-limit errors must reach the visitor; everything else is logged only.
      if (err instanceof Error && err.message.includes("hourly limit")) throw err;
      console.error("[assessment] Failed to persist assessment lead", err);
    }

    if (persisted) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { sendInternalTransactionalEmail } = await import(
          "./email/send-internal.server"
        );
        await sendInternalTransactionalEmail({
          templateName: "assessment-plan",
          recipientEmail: normalizedEmail,
          idempotencyKey: `assessment-${normalizedEmail}-${today}`,
          templateData: {
            name: data.answers.name || undefined,
            summary: plan.summary,
            paths: [plan.primary, ...plan.adjacent].map((p) => ({
              title: p.title,
              why: p.why,
              exampleRoles: p.exampleRoles,
              exampleEmployers: p.exampleEmployers,
            })),
            days0to30: plan.days0to30,
            days30to60: plan.days30to60,
            days60to90: plan.days60to90,
            networkingStrategy: [],
            resumeUpdates: [],
            recommendedTier: "Career Membership",
            tierRationale:
              "Compass is where this plan gets tracked, updated, and paired with the tools you'll actually use.",
            consultationUrl: "https://discoverdiplomacy.org/pricing",
          },
        });
        emailed = true;
      } catch (err) {
        console.error("[assessment] Failed to send plan email", err);
      }
    }

    return { plan, ok: true, persisted, emailed };
  });
