import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ─── Public lead intake ─────────────────────────────────────────────────────

const leadSchema = z.object({
  university_name: z.string().trim().min(2).max(200),
  contact_name: z.string().trim().min(2).max(100),
  contact_email: z.string().trim().email().max(254),
  contact_title: z.string().trim().max(120).optional().or(z.literal("")),
  department: z.string().trim().min(2).max(120),
  est_students: z.coerce.number().int().min(1).max(100000),
  funding_model: z.enum(["direct", "student_cost", "hybrid", "undecided"]),
  start_date_pref: z.string().trim().max(80).optional().or(z.literal("")),
  budget_cycle: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const submitUniversityLead = createServerFn({ method: "POST" })
  .inputValidator((data) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("university_leads").insert({
      ...data,
      contact_title: data.contact_title || null,
      start_date_pref: data.start_date_pref || null,
      budget_cycle: data.budget_cycle || null,
      notes: data.notes || null,
    });
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ─── Admin helpers ──────────────────────────────────────────────────────────

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const adminListUniversityLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("university_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return { error: error.message };
    return { leads: data ?? [] };
  });

export const adminUpdateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id: string; status: "new" | "contacted" | "qualified" | "won" | "lost" }) => {
      if (!/^[0-9a-f-]{36}$/i.test(d.id)) throw new Error("Invalid id");
      if (!["new", "contacted", "qualified", "won", "lost"].includes(d.status))
        throw new Error("Invalid status");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("university_leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ─── Cohort management (admin) ──────────────────────────────────────────────

const cohortSchema = z.object({
  university_name: z.string().trim().min(2).max(200),
  program_name: z.string().trim().max(200).optional().or(z.literal("")),
  contact_email: z.string().trim().email().max(254),
  admin_email: z.string().trim().email().max(254).optional().or(z.literal("")),
  funding_model: z.enum(["direct", "student_cost", "hybrid"]).default("direct"),
  monthly_rate_cents: z.coerce.number().int().min(0).max(1000000).default(2000),
  status: z
    .enum(["onboarding", "active", "paused", "ended"])
    .default("onboarding"),
  started_at: z.string().trim().optional().or(z.literal("")),
  renewal_at: z.string().trim().optional().or(z.literal("")),
});

export const adminCreateCohort = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => cohortSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve admin_user_id from admin_email (if provided)
    let admin_user_id: string | null = null;
    if (data.admin_email) {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("email", data.admin_email)
        .maybeSingle();
      admin_user_id = prof?.id ?? null;
      if (admin_user_id) {
        // Grant university_admin role
        await supabaseAdmin
          .from("user_roles")
          .upsert(
            { user_id: admin_user_id, role: "university_admin" as any },
            { onConflict: "user_id,role" },
          );
      }
    }

    const { data: row, error } = await supabaseAdmin
      .from("university_cohorts")
      .insert({
        university_name: data.university_name,
        program_name: data.program_name || null,
        contact_email: data.contact_email,
        admin_user_id,
        funding_model: data.funding_model,
        monthly_rate_cents: data.monthly_rate_cents,
        status: data.status,
        started_at: data.started_at || null,
        renewal_at: data.renewal_at || null,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    return { id: row.id };
  });

export const adminListCohorts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("university_cohorts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { error: error.message };
    return { cohorts: data ?? [] };
  });

// ─── Student roster (admin) ─────────────────────────────────────────────────

const rosterRow = z.object({
  email: z.string().trim().email().max(254),
  full_name: z.string().trim().max(200).optional().or(z.literal("")),
  graduation_year: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
});

export const adminBulkInviteStudents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      cohortId: string;
      rows: { email: string; full_name?: string; graduation_year?: number | null }[];
    }) => {
      if (!/^[0-9a-f-]{36}$/i.test(d.cohortId)) throw new Error("Invalid cohortId");
      if (!Array.isArray(d.rows) || d.rows.length === 0 || d.rows.length > 1000)
        throw new Error("Provide 1–1000 student rows");
      const rows = d.rows.map((r) => rosterRow.parse(r));
      return { cohortId: d.cohortId, rows };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const inserts = data.rows.map((r) => ({
      cohort_id: data.cohortId,
      email: r.email.toLowerCase(),
      full_name: r.full_name || null,
      graduation_year: r.graduation_year ?? null,
      status: "invited" as const,
    }));

    const { error, count } = await supabaseAdmin
      .from("university_cohort_members")
      .upsert(inserts, { onConflict: "cohort_id,email", count: "exact" });

    if (error) return { error: error.message };

    // Refresh student_count on the cohort
    const { count: total } = await supabaseAdmin
      .from("university_cohort_members")
      .select("id", { count: "exact", head: true })
      .eq("cohort_id", data.cohortId);
    await supabaseAdmin
      .from("university_cohorts")
      .update({ student_count: total ?? 0 })
      .eq("id", data.cohortId);

    return { invited: count ?? inserts.length };
  });

export const adminRemoveCohortMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { memberId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.memberId)) throw new Error("Invalid memberId");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("university_cohort_members")
      .update({ status: "removed", removed_at: new Date().toISOString() })
      .eq("id", data.memberId);
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ─── Cohort-admin view (for /university dashboard) ──────────────────────────

export const getMyCohort = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // RLS allows cohort admin to read their own cohort row(s)
    const { data: cohorts, error } = await context.supabase
      .from("university_cohorts")
      .select("*")
      .eq("admin_user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) return { error: error.message };
    return { cohorts: cohorts ?? [] };
  });

export const getCohortMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cohortId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.cohortId)) throw new Error("Invalid cohortId");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("university_cohort_members")
      .select("id, email, full_name, graduation_year, status, invited_at, activated_at")
      .eq("cohort_id", data.cohortId)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) return { error: error.message };
    return { members: rows ?? [] };
  });

export const getCohortEngagement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cohortId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.cohortId)) throw new Error("Invalid cohortId");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc(
      "university_cohort_engagement",
      { _cohort_id: data.cohortId },
    );
    if (error) return { error: error.message };
    const row = Array.isArray(rows) && rows.length ? rows[0] : null;
    return { engagement: row };
  });
