import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const inputSchema = z.object({
  surface: z.enum(["after_screen_2", "after_screen_5"]),
  selections: z
    .object({
      career_stage: z.string().nullish(),
      years_experience: z.string().nullish(),
      primary_theme: z.string().nullish(),
      secondary_themes: z.array(z.string()).optional(),
      functional_skills: z.array(z.string()).optional(),
      org_types: z.array(z.string()).optional(),
      roles_seeking: z.array(z.string()).optional(),
      target_sectors: z.array(z.string()).optional(),
      current_base: z.string().nullish(),
    })
    .strict(),
  asked_questions: z.array(z.string()).max(10).optional().default([]),
});

const SYSTEM_PROMPT = `You are helping enrich a professional profile for an international-affairs talent marketplace. You will receive a candidate's selected attributes. Return ONE follow-up question that adds genuinely useful hiring signal NOT already captured.

STRICT RULES:
- Respond with ONLY valid JSON, no preamble, no markdown, no backticks.
- Format: {"question": "...", "options": ["...", "...", "..."]}
- 3 to 5 options. Options must be short, mutually exclusive, tappable labels (1-5 words).
- NEVER ask for identifying information: no employer names, school names, cities, exact job titles, dates, or anything that could identify the person.
- Only ask about ABSTRACTED capability (focus areas, methods, scope, specialization).
- If their answers already cover everything useful, return: {"question": null, "options": []}
- Tailor to seniority: do not ask entry-level candidates about large-scale leadership; do not ask senior candidates basic questions.`;

function stripFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export const generateProfileFollowup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { question: null as string | null, options: [] as string[] };

    const started = Date.now();
    const userMsg = [
      data.selections.primary_theme && `Primary theme: ${data.selections.primary_theme}.`,
      data.selections.secondary_themes?.length &&
        `Secondary themes: ${data.selections.secondary_themes.join(", ")}.`,
      data.selections.functional_skills?.length &&
        `Functions: ${data.selections.functional_skills.join(", ")}.`,
      data.selections.org_types?.length && `Org types: ${data.selections.org_types.join(", ")}.`,
      data.selections.career_stage && `Career stage: ${data.selections.career_stage}.`,
      data.selections.years_experience && `Years experience: ${data.selections.years_experience}.`,
      data.selections.roles_seeking?.length &&
        `Roles seeking: ${data.selections.roles_seeking.join(", ")}.`,
      data.selections.target_sectors?.length &&
        `Target sectors: ${data.selections.target_sectors.join(", ")}.`,
      data.selections.current_base && `Based in: ${data.selections.current_base}.`,
      data.asked_questions.length && `Already asked: ${data.asked_questions.join(" | ")}.`,
    ]
      .filter(Boolean)
      .join(" ");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = "google/gemini-3-flash-preview";

    let parsed: { question: string | null; options: string[] } = {
      question: null,
      options: [],
    };
    let raw = "";
    let ok = true;
    let errMsg: string | null = null;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const { text } = await generateText({
        model: gateway(model),
        system: SYSTEM_PROMPT,
        prompt: userMsg || "No selections yet.",
        abortSignal: ctrl.signal,
      });
      clearTimeout(timer);
      raw = text;
      const cleaned = stripFences(text);
      const obj = JSON.parse(cleaned);
      if (
        obj &&
        (typeof obj.question === "string" || obj.question === null) &&
        Array.isArray(obj.options) &&
        obj.options.every((o: unknown) => typeof o === "string")
      ) {
        const opts = (obj.options as string[])
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.length <= 60)
          .slice(0, 5);
        if (obj.question && opts.length >= 3) {
          parsed = { question: String(obj.question).slice(0, 160), options: opts };
        }
      }
    } catch (e) {
      ok = false;
      errMsg = e instanceof Error ? e.message : String(e);
    }

    // Best-effort log; do not block on failure.
    try {
      await context.supabase.from("ai_logs").insert({
        user_id: context.userId,
        surface: `profile.${data.surface}`,
        input_summary: data.selections as never,
        output: { raw: raw.slice(0, 800), parsed } as never,
        model,
        ok,
        error: errMsg,
        duration_ms: Date.now() - started,
      });
    } catch {
      // ignore
    }

    return parsed;
  });

const saveSchema = z.object({
  question: z.string().trim().min(1).max(200),
  answer: z.string().trim().min(1).max(80),
  surface: z.string().trim().max(40),
});

export const saveProfileFollowupAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => saveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("candidate_profiles")
      .select("ai_followups")
      .eq("user_id", userId)
      .maybeSingle();
    const existing = Array.isArray(row?.ai_followups) ? (row!.ai_followups as unknown[]) : [];
    const filtered = existing.filter(
      (e) => !(e && typeof e === "object" && (e as { question?: string }).question === data.question),
    );
    const next = [
      ...filtered,
      {
        question: data.question,
        answer: data.answer,
        surface: data.surface,
        at: new Date().toISOString(),
      },
    ];
    const { error } = await supabase
      .from("candidate_profiles")
      .upsert(
        { user_id: userId, ai_followups: next as never },
        { onConflict: "user_id" },
      );
    if (error) return { error: error.message } as const;
    return { ok: true } as const;
  });

const sigSchema = z.object({ signature: z.string().min(1).max(200) });

export const updateAiCoreSignature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => sigSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("candidate_profiles")
      .upsert(
        { user_id: context.userId, ai_core_signature: data.signature },
        { onConflict: "user_id" },
      );
    if (error) return { error: error.message } as const;
    return { ok: true } as const;
  });
