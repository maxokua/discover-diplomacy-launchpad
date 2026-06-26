import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const optInSchema = z.object({
  visibility: z.enum(["all", "selected"]),
  orgIds: z.array(z.string().uuid()).max(500).default([]),
});

const updateOrgsSchema = optInSchema;

const requestAccessSchema = z.object({
  organization_name: z.string().trim().min(2).max(200),
  organization_website: z.string().trim().min(4).max(300),
  organization_type: z.string().trim().min(1).max(64),
  hq_country: z.string().trim().min(1).max(120),
  contact_full_name: z.string().trim().min(2).max(160),
  contact_title: z.string().trim().min(1).max(160),
  contact_work_email: z.string().trim().email().max(254),
  contact_phone: z.string().trim().max(60).optional().default(""),
  contact_linkedin: z.string().trim().min(10).max(300),
  hiring_roles: z.string().trim().min(10).max(5000),
  target_hires: z.number().int().min(0).max(10000).optional(),
  hiring_timeline: z.string().trim().max(120).optional().default(""),
  why_us: z.string().trim().min(10).max(5000),
  acknowledged_terms: z.literal(true),
});

export const getResumeDropStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: row }, { data: orgRows }, { data: unlocks }, { data: intros }] =
      await Promise.all([
        supabase.from("member_resume_drop").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("member_resume_drop_orgs").select("org_id").eq("user_id", userId),
        supabase
          .from("resume_unlocks")
          .select("id, unlocked_at")
          .eq("member_id", userId),
        supabase.from("employer_intros").select("id").eq("member_id", userId),
      ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const unlocksThisMonth =
      (unlocks ?? []).filter((u) => u.unlocked_at && u.unlocked_at >= monthStart).length;

    // Count of orgs the member is discoverable to.
    let visibleOrgCount = 0;
    if (row?.status === "opted_in") {
      if (row.visibility === "all") {
        const { count } = await supabase
          .from("organizations")
          .select("id", { count: "exact", head: true })
          .eq("verification_status", "verified");
        visibleOrgCount = count ?? 0;
      } else {
        visibleOrgCount = (orgRows ?? []).length;
      }
    }

    return {
      status: (row?.status ?? "opted_out") as "opted_in" | "opted_out",
      visibility: (row?.visibility ?? "all") as "all" | "selected",
      seenIntroAt: row?.seen_intro_at ?? null,
      optedInAt: row?.opted_in_at ?? null,
      orgIds: (orgRows ?? []).map((r) => r.org_id),
      stats: {
        unlocksThisMonth,
        totalUnlocks: (unlocks ?? []).length,
        introsReceived: (intros ?? []).length,
        visibleOrgCount,
      },
    };
  });

export const markIntroSeen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase
      .from("member_resume_drop")
      .upsert(
        { user_id: userId, seen_intro_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    return { ok: true };
  });

export const optInToResumeDrop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => optInSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const now = new Date().toISOString();
    const { error: upErr } = await supabase.from("member_resume_drop").upsert(
      {
        user_id: userId,
        status: "opted_in",
        visibility: data.visibility,
        opted_in_at: now,
        seen_intro_at: now,
      },
      { onConflict: "user_id" },
    );
    if (upErr) return { error: upErr.message };

    // Reset org selections
    await supabase.from("member_resume_drop_orgs").delete().eq("user_id", userId);
    if (data.visibility === "selected" && data.orgIds.length > 0) {
      const rows = data.orgIds.map((org_id) => ({ user_id: userId, org_id }));
      const { error: insErr } = await supabase.from("member_resume_drop_orgs").insert(rows);
      if (insErr) return { error: insErr.message };
    }
    return { ok: true as const };
  });

export const updateResumeDropOrgs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => updateOrgsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error: upErr } = await supabase
      .from("member_resume_drop")
      .update({ visibility: data.visibility })
      .eq("user_id", userId);
    if (upErr) return { error: upErr.message };

    await supabase.from("member_resume_drop_orgs").delete().eq("user_id", userId);
    if (data.visibility === "selected" && data.orgIds.length > 0) {
      const rows = data.orgIds.map((org_id) => ({ user_id: userId, org_id }));
      const { error: insErr } = await supabase.from("member_resume_drop_orgs").insert(rows);
      if (insErr) return { error: insErr.message };
    }
    return { ok: true as const };
  });

export const optOutOfResumeDrop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("member_resume_drop")
      .upsert(
        { user_id: userId, status: "opted_out", opted_out_at: now },
        { onConflict: "user_id" },
      );
    if (error) return { error: error.message };
    return { ok: true as const };
  });

const listOrgsSchema = z.object({
  search: z.string().trim().max(120).optional().default(""),
  category: z
    .enum(["all", "government", "ngo", "think_tank", "multilateral", "company", "foundation", "other"])
    .optional()
    .default("all"),
  limit: z.number().int().min(1).max(200).optional().default(60),
});

export const listOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => listOrgsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("organizations")
      .select("id, name, slug, category, logo_url")
      .eq("verification_status", "verified")
      .order("name", { ascending: true })
      .limit(data.limit);
    if (data.category !== "all") q = q.eq("category", data.category);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) return { error: error.message, organizations: [] };
    return { organizations: rows ?? [] };
  });

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { error: error.message, notifications: [] };
    return { notifications: data ?? [] };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ============ ADMIN: ORGS ============
const adminOrgSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/),
  category: z.enum(["government", "ngo", "think_tank", "multilateral", "company", "foundation", "other"]),
  logo_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  website: z.string().trim().url().max(500).optional().or(z.literal("")),
  verification_status: z.enum(["pending", "verified", "rejected"]),
});

export const adminListOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) return { error: "Forbidden", organizations: [] };
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { error: error.message, organizations: [] };
    return { organizations: data ?? [] };
  });

export const adminUpsertOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => adminOrgSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) return { error: "Forbidden" };
    const payload = {
      name: data.name,
      slug: data.slug,
      category: data.category,
      logo_url: data.logo_url || null,
      website: data.website || null,
      verification_status: data.verification_status,
    };
    const { error } = data.id
      ? await supabase.from("organizations").update(payload).eq("id", data.id)
      : await supabase.from("organizations").insert(payload);
    if (error) return { error: error.message };
    return { ok: true as const };
  });

export const adminDeleteOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) return { error: "Forbidden" };
    const { error } = await supabase.from("organizations").delete().eq("id", data.id);
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ============ PUBLIC: REQUEST EMPLOYER ACCESS ============
export const requestEmployerAccess = createServerFn({ method: "POST" })
  .inputValidator((d) => requestAccessSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("employer_applications").insert({
      organization_name: data.organization_name,
      organization_website: data.organization_website,
      organization_type: data.organization_type,
      hq_country: data.hq_country,
      contact_full_name: data.contact_full_name,
      contact_title: data.contact_title,
      contact_work_email: data.contact_work_email,
      contact_phone: data.contact_phone || null,
      contact_linkedin: data.contact_linkedin,
      hiring_roles: data.hiring_roles,
      target_hires: data.target_hires ?? null,
      hiring_timeline: data.hiring_timeline || null,
      why_us: data.why_us,
      acknowledged_terms: data.acknowledged_terms,
      source: "resume_drop",
    });
    if (error) return { error: error.message };
    return { ok: true as const };
  });

// ============ PLACEMENT FEES (public) ============
export const getPlacementFees = createServerFn({ method: "GET" }).handler(async () => {
  const defaults = {
    alacarte_fee_cents: 120000,
    alacarte_credits_back: 3,
    starter_fee_cents: 70000,
    starter_credits_back: 4,
    professional_fee_cents: 50000,
    professional_credits_back: 5,
  };
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("placement_fee_config").select("*").maybeSingle();
    return { fees: data ?? defaults };
  } catch {
    return { fees: defaults };
  }
});
