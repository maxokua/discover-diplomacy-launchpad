import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const arrStr = z.array(z.string().max(60)).max(40).optional().default([]);

const filterSchema = z
  .object({
    q: z.string().trim().max(120).optional().default(""),
    pile: z.enum(["all", "paid", "free"]).default("all"),
    sort: z.enum(["match", "recent", "experience"]).default("match"),

    career_stage: arrStr,
    years_experience: arrStr,
    years_intl: arrStr,
    highest_degree: arrStr,
    management_experience: arrStr,
    budget_responsibility: arrStr,

    org_types: arrStr,
    functional_skills: arrStr,
    primary_theme: arrStr,
    secondary_themes: arrStr,
    technical_skills: arrStr,

    languages: arrStr,
    min_language_level: z.enum(["Beginner", "Intermediate", "Fluent", "Native"]).optional(),

    current_base: arrStr,
    work_eligibility: arrStr,
    relocation: arrStr,
    work_mode: arrStr,
    availability: arrStr,
    work_type: arrStr,

    roles_seeking: arrStr,
    target_sectors: arrStr,
    salary_expectation: arrStr,
    security_clearance: arrStr,
    fellowship_category: arrStr,

    ai_tags: arrStr,
    log: z.boolean().optional().default(false),
  })
  .strict();

const paidTiers = new Set(["compass", "envoy", "envoy_annual", "compass_annual"]);

function applyIn<T extends string>(q: ReturnType<typeof anyChain>, col: string, vals: T[]) {
  return vals.length ? q.in(col, vals as string[]) : q;
}
type anyChainT = ReturnType<typeof anyChain>;
function anyChain<T>(x: T): T {
  return x;
}

export const marketplaceBrowse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r) => r.role));
    const isEmployer = roleSet.has("employer") || roleSet.has("admin");
    if (!isEmployer) return { error: "Employer access required", verified: false } as const;

    // Base query: opted-in candidates only
    let q = supabase
      .from("candidate_profiles")
      .select("*")
      .eq("include_in_resume_drop", true)
      .eq("visibility", "public")
      .limit(300);

    q = applyIn(q as anyChainT, "career_stage", data.career_stage);
    q = applyIn(q as anyChainT, "years_experience", data.years_experience);
    q = applyIn(q as anyChainT, "years_intl", data.years_intl);
    q = applyIn(q as anyChainT, "highest_degree", data.highest_degree);
    q = applyIn(q as anyChainT, "management_experience", data.management_experience);
    q = applyIn(q as anyChainT, "budget_responsibility", data.budget_responsibility);
    q = applyIn(q as anyChainT, "primary_theme", data.primary_theme);
    q = applyIn(q as anyChainT, "current_base", data.current_base);
    q = applyIn(q as anyChainT, "relocation", data.relocation);
    q = applyIn(q as anyChainT, "work_mode", data.work_mode);
    q = applyIn(q as anyChainT, "availability", data.availability);
    q = applyIn(q as anyChainT, "salary_expectation", data.salary_expectation);
    q = applyIn(q as anyChainT, "security_clearance", data.security_clearance);
    q = applyIn(q as anyChainT, "fellowship_category", data.fellowship_category);

    // Array-contains-any
    const arrayFilters: Array<[string, string[]]> = [
      ["org_types", data.org_types],
      ["functional_skills", data.functional_skills],
      ["secondary_themes", data.secondary_themes],
      ["technical_skills", data.technical_skills],
      ["work_eligibility", data.work_eligibility],
      ["work_type", data.work_type],
      ["roles_seeking", data.roles_seeking],
      ["target_sectors", data.target_sectors],
    ];
    for (const [col, vals] of arrayFilters) {
      if (vals.length) q = q.overlaps(col, vals);
    }

    q = q.order("updated_at", { ascending: false });
    const { data: rows, error } = await q;
    if (error) return { error: error.message } as const;

    // Tier (pile) lookup
    const userIds = (rows ?? []).map((r) => r.user_id);
    let tierById = new Map<string, string | null>();
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, service_tier")
        .in("id", userIds);
      tierById = new Map((profiles ?? []).map((p) => [p.id, p.service_tier]));
    }

    const levelRank = { Beginner: 1, Intermediate: 2, Fluent: 3, Native: 4 } as const;
    const minLevel = data.min_language_level ? levelRank[data.min_language_level] : 0;

    let merged = (rows ?? []).map((r) => {
      const tier = tierById.get(r.user_id) ?? null;
      const pile = tier && paidTiers.has(tier) ? ("paid" as const) : ("free" as const);
      return { ...r, pile, tier };
    });

    // Language filter (jsonb language_proficiencies)
    if (data.languages.length) {
      merged = merged.filter((r) => {
        const langs = Array.isArray(r.language_proficiencies)
          ? (r.language_proficiencies as Array<{ lang: string; level: string }>)
          : [];
        return data.languages.every((wanted) =>
          langs.some(
            (l) =>
              l.lang === wanted &&
              (!minLevel || (levelRank[l.level as keyof typeof levelRank] ?? 0) >= minLevel),
          ),
        );
      });
    }

    // AI tag filter (ai_followups answers)
    if (data.ai_tags.length) {
      merged = merged.filter((r) => {
        const tags = Array.isArray(r.ai_followups)
          ? (r.ai_followups as Array<{ answer?: string }>)
          : [];
        const answerSet = new Set(tags.map((t) => t.answer).filter(Boolean) as string[]);
        return data.ai_tags.some((t) => answerSet.has(t));
      });
    }

    // Pile filter
    if (data.pile !== "all") merged = merged.filter((r) => r.pile === data.pile);

    // Free-text q across abstracted fields
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

    // Sort
    const yearsRank = (y: string | null) => {
      if (!y) return 0;
      if (y.includes("15+")) return 6;
      if (y.includes("11")) return 5;
      if (y.includes("6")) return 4;
      if (y.includes("3")) return 3;
      if (y.includes("1")) return 2;
      return 1;
    };
    if (data.sort === "experience") {
      merged.sort((a, b) => yearsRank(b.years_experience) - yearsRank(a.years_experience));
    } else if (data.sort === "recent") {
      merged.sort((a, b) =>
        String(b.updated_at).localeCompare(String(a.updated_at)),
      );
    } else {
      // Best-match: paid pile first, then most recently updated
      merged.sort((a, b) =>
        a.pile === b.pile
          ? String(b.updated_at).localeCompare(String(a.updated_at))
          : a.pile === "paid"
            ? -1
            : 1,
      );
    }

    // Shortlist set
    const { data: shortlists } = await supabase
      .from("employer_shortlists")
      .select("candidate_id")
      .eq("employer_id", userId);
    const shortlisted = new Set((shortlists ?? []).map((s) => s.candidate_id));

    const result = merged.map((r) => ({
      ...r,
      shortlisted: shortlisted.has(r.user_id),
      // Stable anonymous label
      anon_label: `Candidate #${String(r.user_id).replace(/-/g, "").slice(-4).toUpperCase()}`,
    }));

    // Filter analytics (best-effort; only when client opts in)
    if (data.log) {
      try {
        const { log: _log, ...filtersOnly } = data;
        await supabase.from("filter_usage_log").insert({
          employer_id: userId,
          filters: filtersOnly as never,
          result_count: result.length,
        });
      } catch {
        // ignore
      }
    }

    return { rows: result, verified: true, count: result.length } as const;
  });

const shortlistSchema = z.object({
  candidate_id: z.string().uuid(),
  add: z.boolean(),
  note: z.string().max(2000).optional(),
});

export const toggleShortlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => shortlistSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.add) {
      const { error } = await supabase
        .from("employer_shortlists")
        .delete()
        .eq("employer_id", userId)
        .eq("candidate_id", data.candidate_id);
      if (error) return { error: error.message } as const;
      return { ok: true } as const;
    }
    const { error } = await supabase
      .from("employer_shortlists")
      .upsert(
        {
          employer_id: userId,
          candidate_id: data.candidate_id,
          note: data.note ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "employer_id,candidate_id" },
      );
    if (error) return { error: error.message } as const;
    return { ok: true } as const;
  });

export const employerStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: shortCount } = await supabase
      .from("employer_shortlists")
      .select("id", { count: "exact", head: true })
      .eq("employer_id", userId);
    const since = new Date();
    since.setDate(1);
    const { count: unlockedMonth } = await supabase
      .from("employer_credit_ledger")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("reason", "unlock")
      .gte("created_at", since.toISOString());
    return {
      shortlistCount: (shortCount as unknown as { count?: number })?.count ?? 0,
      unlockedThisMonth: unlockedMonth ?? 0,
    };
  });
