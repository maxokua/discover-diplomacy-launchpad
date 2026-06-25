import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  resumeId: z.string().uuid(),
  targetField: z.string().min(1).max(120),
  experienceLevel: z.string().min(1).max(60),
});

const AnalysisSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  summary: z.string(),
  category_scores: z.object({
    ats: z.number().int().min(0).max(100),
    impact: z.number().int().min(0).max(100),
    keyword_alignment: z.number().int().min(0).max(100),
    clarity: z.number().int().min(0).max(100),
    relevance: z.number().int().min(0).max(100),
  }),
  priority_fixes: z.array(z.string()).min(1).max(5),
  ats_issues: z.array(z.string()),
  keyword_gaps: z.array(z.string()),
  wording_suggestions: z.array(
    z.object({ original: z.string(), improved: z.string() }),
  ),
  formatting_notes: z.array(z.string()),
});

export type ResumeAnalysis = z.infer<typeof AnalysisSchema>;

function buildSystemPrompt(targetField: string, experienceLevel: string) {
  return `You are an expert technical recruiter, ATS (applicant tracking system) specialist, and career coach. You review resumes with the rigor of someone who screens hundreds a week and the candor of a coach who wants this candidate to win.

You are reviewing ONE resume for a candidate targeting the field "${targetField}" at the "${experienceLevel}" level. You receive the resume as plain text exactly as an ATS would extract it. If the text is garbled, fragmented, out of order, or missing obvious sections, that is itself an ATS parsing failure and must lower the score and appear in ats_issues.

Evaluate across five dimensions:
1. ATS-safety — Can an ATS cleanly parse contact info, sections, dates, and content? Penalize anything that breaks parsing (tables, columns, text boxes, images, icons, headers/footers, nonstandard section titles, inconsistent date formats).
2. Impact — Do bullets show results, not duties? Strong bullets follow "accomplished [X], as measured by [Y], by doing [Z]" with concrete numbers and strong action verbs, no first-person pronouns, no vague responsibility statements.
3. Keyword alignment — Does the resume contain the specific hard skills, tools, certifications, and domain terms a screener for "${targetField}" looks for?
4. Clarity & consistency — Concise, consistent tense and formatting, length appropriate to level, no clichés or unsupported buzzwords.
5. Relevance to field & level — Content matches "${targetField}" and is calibrated to "${experienceLevel}".

Score anchoring for overall_score (0–100):
- 90–100: ATS-clean, every bullet quantified and results-driven, tightly aligned to the field and level. Interview-ready.
- 75–89: Strong, minor gaps — a few unquantified bullets or a handful of missing keywords.
- 60–74: Competent but generic — duties over results, weak keyword coverage, or minor parsing risks.
- 40–59: Significant issues — mostly duty statements, poor keyword fit, or formatting that risks ATS rejection.
- 0–39: Would likely be screened out — parsing failures, no measurable impact, or major misalignment.

Rules you must follow:
- Be specific. Quote the actual line you are critiquing. Reject generic advice that could apply to any resume.
- NEVER invent facts, employers, titles, dates, or metrics. If a bullet needs a number the candidate did not provide, do not fabricate one — in any rewrite use a clearly bracketed placeholder like "[X%]", "[$ amount]", or "[# of people]" for the candidate to fill in.
- keyword_gaps must name actual skills/tools/certs/terms specific to "${targetField}" that are missing — never vague ("more keywords").
- In formatting_notes, distinguish the ATS-safe version (for online applications) from a visually designed version (for human reviewers / networking). Flag where rich visuals would conflict with ATS-safety, and label each note (ATS / human-facing).
- Calibrate to "${experienceLevel}": do not penalize a junior candidate for lacking senior scope, or reward a senior candidate for junior-level bullets.
- Constructive and concrete. Never harsh for its own sake.

Return JSON matching the provided schema exactly.`;
}

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service not configured");

    const { supabase, userId } = context;

    const { data: resume, error: resumeErr } = await supabase
      .from("resumes")
      .select("id, user_id, extracted_text")
      .eq("id", data.resumeId)
      .maybeSingle();

    if (resumeErr) throw new Error(resumeErr.message);
    if (!resume) throw new Error("Resume not found");
    if (resume.user_id !== userId) throw new Error("Forbidden");
    if (!resume.extracted_text || resume.extracted_text.trim().length < 50) {
      throw new Error("Resume text is missing or too short to analyze");
    }

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    let result;
    try {
      result = await generateObject({
        model,
        schema: AnalysisSchema,
        system: buildSystemPrompt(data.targetField, data.experienceLevel),
        prompt: `Resume plain text follows between the markers.\n\n---BEGIN RESUME---\n${resume.extracted_text}\n---END RESUME---`,
      });
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 429) throw new Error("AI rate limit reached. Please try again in a moment.");
      if (status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw err;
    }

    const analysis = result.object;

    const { data: inserted, error: insertErr } = await supabase
      .from("resume_analyses")
      .insert({
        user_id: userId,
        resume_id: resume.id,
        target_field: data.targetField,
        experience_level: data.experienceLevel,
        overall_score: analysis.overall_score,
        ats_issues: analysis.ats_issues,
        keyword_gaps: analysis.keyword_gaps,
        wording_suggestions: analysis.wording_suggestions,
        formatting_notes: analysis.formatting_notes,
      })
      .select("id")
      .single();

    if (insertErr) throw new Error(insertErr.message);

    return { analysisId: inserted.id, analysis };
  });
