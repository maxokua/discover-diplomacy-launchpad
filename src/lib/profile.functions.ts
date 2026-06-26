import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const languageSchema = z.object({
  lang: z.string().trim().min(1).max(60),
  level: z.enum(["Basic", "Conversational", "Professional", "Native"]),
});

const educationSchema = z.object({
  school: z.string().trim().min(1).max(160),
  degree: z.string().trim().max(160).optional().default(""),
  year: z.string().trim().max(20).optional().default(""),
});

const upsertSchema = z.object({
  headline: z.string().trim().max(180).optional().default(""),
  bio: z.string().trim().max(2000).optional().default(""),
  target_roles: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  skills: z.array(z.string().trim().min(1).max(60)).max(40).default([]),
  languages: z.array(languageSchema).max(15).default([]),
  regions: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  sectors: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  experience_level: z
    .enum(["Student", "Entry", "Early career", "Mid-career", "Senior"])
    .nullable()
    .optional(),
  education: z.array(educationSchema).max(10).default([]),
  visibility: z.enum(["public", "hidden"]).default("public"),
});

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

export const upsertCandidateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const payload = {
      user_id: userId,
      headline: data.headline || null,
      bio: data.bio || null,
      target_roles: data.target_roles,
      skills: data.skills,
      languages: data.languages,
      regions: data.regions,
      sectors: data.sectors,
      experience_level: data.experience_level ?? null,
      education: data.education,
      visibility: data.visibility,
    };
    const { error } = await supabase
      .from("candidate_profiles")
      .upsert(payload, { onConflict: "user_id" });
    if (error) return { error: error.message } as const;
    return { ok: true } as const;
  });

const browseSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  pile: z.enum(["all", "paid", "free"]).default("all"),
  skill: z.string().trim().max(60).optional().default(""),
  region: z.string().trim().max(60).optional().default(""),
  sector: z.string().trim().max(60).optional().default(""),
});

export const browseCandidates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => browseSchema.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Gate: only employer or admin
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
      .select(
        "user_id, headline, target_roles, skills, languages, regions, sectors, experience_level, education, updated_at",
      )
      .eq("visibility", "public")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (data.skill) q = q.contains("skills", [data.skill]);
    if (data.region) q = q.contains("regions", [data.region]);
    if (data.sector) q = q.contains("sectors", [data.sector]);

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

    if (data.pile !== "all") {
      merged = merged.filter((r) => r.pile === data.pile);
    }

    if (data.q) {
      const needle = data.q.toLowerCase();
      merged = merged.filter((r) =>
        [r.headline, ...(r.target_roles ?? []), ...(r.skills ?? [])]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(needle)),
      );
    }

    // Sort: paid pile first
    merged.sort((a, b) => (a.pile === b.pile ? 0 : a.pile === "paid" ? -1 : 1));

    return { rows: merged } as const;
  });
