import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const langProf = z.object({
  lang: z.string().trim().min(1).max(60),
  level: z.enum(["Beginner", "Intermediate", "Fluent", "Native"]),
});

// All fields optional so the client can patch one screen / one field at a time.
const patchSchema = z
  .object({
    // legacy
    headline: z.string().trim().max(180).nullable().optional(),
    bio: z.string().trim().max(2000).nullable().optional(),
    visibility: z.enum(["public", "hidden"]).optional(),

    // experience & seniority
    years_experience: z.string().max(20).nullable().optional(),
    years_intl: z.string().max(20).nullable().optional(),
    career_stage: z
      .enum(["Entry-level", "Mid-level", "Senior", "Leadership"])
      .nullable()
      .optional(),
    highest_degree: z.string().max(40).nullable().optional(),
    management_experience: z.string().max(40).nullable().optional(),
    budget_responsibility: z.string().max(40).nullable().optional(),

    // what you do
    org_types: z.array(z.string().max(60)).max(20).optional(),
    functional_skills: z.array(z.string().max(60)).max(5).optional(),
    primary_theme: z.string().max(60).nullable().optional(),
    secondary_themes: z.array(z.string().max(60)).max(3).optional(),

    // technical & languages
    technical_skills: z.array(z.string().max(60)).max(30).optional(),
    language_proficiencies: z.array(langProf).max(20).optional(),

    // location & logistics
    current_base: z.string().max(60).nullable().optional(),
    work_eligibility: z.array(z.string().max(60)).max(20).optional(),
    relocation: z.string().max(60).nullable().optional(),
    relocation_regions: z.array(z.string().max(60)).max(20).optional(),
    work_mode: z.string().max(40).nullable().optional(),
    availability: z.string().max(40).nullable().optional(),
    work_type: z.array(z.string().max(40)).max(10).optional(),

    // goals & credentials
    roles_seeking: z.array(z.string().max(60)).max(3).optional(),
    target_sectors: z.array(z.string().max(60)).max(20).optional(),
    salary_expectation: z.string().max(40).nullable().optional(),
    security_clearance: z.string().max(60).nullable().optional(),
    fellowship_category: z.string().max(60).nullable().optional(),
    internship_count: z.string().max(40).nullable().optional(),

    // status
    profile_completion_percent: z.number().int().min(0).max(100).optional(),
    profile_status: z.enum(["draft", "complete", "published"]).optional(),
    include_in_resume_drop: z.boolean().optional(),
  })
  .strict();

export const getMyCandidateProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { error: error.message } as const;
    return { profile: data } as const;
  });

export const patchCandidateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => patchSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const payload = { user_id: userId, ...data };
    const { error } = await supabase
      .from("candidate_profiles")
      .upsert(payload, { onConflict: "user_id" });
    if (error) return { error: error.message } as const;
    return { ok: true } as const;
  });

// Kept for backward compatibility with any older callers.
export const upsertCandidateProfile = patchCandidateProfile;

const browseSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  pile: z.enum(["all", "paid", "free"]).default("all"),
  career_stage: z.string().trim().max(40).optional().default(""),
  primary_theme: z.string().trim().max(60).optional().default(""),
  current_base: z.string().trim().max(60).optional().default(""),
});

export const browseCandidates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => browseSchema.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r) => r.role));
    if (!roleSet.has("employer") && !roleSet.has("admin")) {
      return { error: "Employer access required" } as const;
    }

    let q = supabase
      .from("candidate_profiles")
      .select("*")
      .eq("visibility", "public")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (data.career_stage) q = q.eq("career_stage", data.career_stage);
    if (data.primary_theme) q = q.eq("primary_theme", data.primary_theme);
    if (data.current_base) q = q.eq("current_base", data.current_base);

    const { data: rows, error } = await q;
    if (error) return { error: error.message } as const;

    const userIds = (rows ?? []).map((r) => r.user_id);
    if (userIds.length === 0) return { rows: [] } as const;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, service_tier")
      .in("id", userIds);
    const tierById = new Map((profiles ?? []).map((p) => [p.id, p.service_tier]));

    const paidTiers = new Set(["compass", "envoy", "envoy_annual", "compass_annual"]);
    let merged = (rows ?? []).map((r) => {
      const tier = tierById.get(r.user_id) ?? null;
      return {
        ...r,
        pile: tier && paidTiers.has(tier) ? ("paid" as const) : ("free" as const),
        tier,
      };
    });

    if (data.pile !== "all") merged = merged.filter((r) => r.pile === data.pile);

    if (data.q) {
      const needle = data.q.toLowerCase();
      merged = merged.filter((r) =>
        [
          r.primary_theme,
          r.career_stage,
          ...(r.functional_skills ?? []),
          ...(r.target_sectors ?? []),
          ...(r.roles_seeking ?? []),
        ]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(needle)),
      );
    }

    merged.sort((a, b) => (a.pile === b.pile ? 0 : a.pile === "paid" ? -1 : 1));

    return { rows: merged } as const;
  });
