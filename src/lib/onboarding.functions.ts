import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnswersSchema = z
  .object({
    q1_stage: z.string().max(80).optional().default(""),
    q2_sector: z.string().max(120).optional().default(""),
    q3_function: z.string().max(80).optional().default(""),
    q4_issues: z.array(z.string().max(80)).max(5).optional().default([]),
    q5_location: z.string().max(80).optional().default(""),
    q6_tradeoff: z.string().max(80).optional().default(""),
    q7_timeline: z.string().max(60).optional().default(""),
    q8_skills: z.array(z.string().max(80)).max(8).optional().default([]),
    q9_work_auth: z.string().max(80).optional().default(""),
    q10_obstacle: z.string().max(120).optional().default(""),
  })
  .strict();

export type DashboardProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: "free" | "compass" | "envoy";
  dashboard_role: "candidate" | "employer" | "university";
  onboarding_complete: boolean;
  assessment_answers: z.infer<typeof AnswersSchema> | null;
  archetype: string | null;
};

/** Fetches the current user's dashboard-relevant profile. */
export const getDashboardProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardProfile> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, plan, dashboard_role, onboarding_complete, assessment_answers, archetype",
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return {
        id: userId,
        full_name: null,
        email: null,
        plan: "free",
        dashboard_role: "candidate",
        onboarding_complete: false,
        assessment_answers: null,
        archetype: null,
      };
    }
    return data as DashboardProfile;
  });

/** Attempts to import prior assessment answers by matching on email. */
export const importPriorAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims?.email as string | undefined)?.toLowerCase().trim();
    if (!email) return { imported: false as const };
    const { data: lead } = await supabase
      .from("assessment_leads")
      .select("answers, plan")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!lead || !lead.answers) return { imported: false as const };
    return {
      imported: true as const,
      answers: lead.answers,
      archetype: (lead.plan as { archetype?: string } | null)?.archetype ?? null,
    };
  });

/** Saves onboarding answers + marks complete or defers. */
export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        answers: AnswersSchema,
        archetype: z.string().max(80).nullable().optional(),
        complete: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        assessment_answers: data.answers,
        archetype: data.archetype ?? null,
        onboarding_complete: data.complete,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Reads the per-user 90-day plan checkbox state. */
export const getPlanProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("plan_task_progress")
      .select("phase, task_index, checked")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []) as { phase: "p1" | "p2" | "p3"; task_index: number; checked: boolean }[];
  });

/** Toggles a single 90-day plan checkbox. */
export const togglePlanTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        phase: z.enum(["p1", "p2", "p3"]),
        task_index: z.number().int().min(0).max(19),
        checked: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("plan_task_progress").upsert(
      {
        user_id: userId,
        phase: data.phase,
        task_index: data.task_index,
        checked: data.checked,
      },
      { onConflict: "user_id,phase,task_index" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
