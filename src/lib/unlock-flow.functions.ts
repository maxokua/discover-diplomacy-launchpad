import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const paidEmployerTiers = new Set(["starter", "professional"]);
const paidMemberTiers = new Set(["compass", "envoy", "compass_annual", "envoy_annual"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function employerLabel(supabase: any, userId: string): Promise<string> {
  try {
    const { data: prof } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    const email = (prof?.email as string | null) ?? null;
    if (!email) return "A verified employer";
    const { data } = await supabase
      .from("employer_applications")
      .select("organization_name, status")
      .eq("contact_work_email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data?.organization_name as string | null) || "A verified employer";
  } catch {
    return "A verified employer";
  }
}

async function employerLabels(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userIds: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!userIds.length) return out;
  try {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    const emailToId = new Map<string, string>();
    for (const p of profs ?? []) {
      if (p.email) emailToId.set(String(p.email).toLowerCase(), p.id);
    }
    const emails = Array.from(emailToId.keys());
    if (!emails.length) return out;
    const { data: apps } = await supabase
      .from("employer_applications")
      .select("contact_work_email, organization_name")
      .in("contact_work_email", emails);
    for (const a of apps ?? []) {
      const uid = emailToId.get(String(a.contact_work_email).toLowerCase());
      if (uid && !out.has(uid)) out.set(uid, a.organization_name);
    }
  } catch {/* ignore */}
  return out;
}

// ── 1) UNLOCK ────────────────────────────────────────────────────────────────
export const unlockCandidate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ candidate_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Gate: must be employer/admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r) => r.role));
    if (!roleSet.has("employer") && !roleSet.has("admin")) {
      return { ok: false as const, error: "Employer access required" };
    }

    // Gate: Member Pool requires paid employer tier
    const [{ data: empProfile }, { data: candProfile }] = await Promise.all([
      supabase
        .from("profiles")
        .select("service_tier")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("candidate_profiles")
        .select("user_id")
        .eq("user_id", data.candidate_id)
        .eq("include_in_resume_drop", true)
        .maybeSingle(),
    ]);

    if (!candProfile) {
      return { ok: false as const, error: "Candidate not available" };
    }

    const employerTier = (empProfile?.service_tier as string | null) ?? null;
    const isPaidEmployer = !!employerTier && paidEmployerTiers.has(employerTier);

    const { data: candTierRow } = await supabase
      .from("profiles")
      .select("service_tier")
      .eq("id", data.candidate_id)
      .maybeSingle();
    const candTier = (candTierRow?.service_tier as string | null) ?? null;
    const isMemberPool = !!candTier && paidMemberTiers.has(candTier);

    if (isMemberPool && !isPaidEmployer) {
      return {
        ok: false as const,
        error: "upgrade_required",
        message: "Member Pool candidates require a paid employer plan.",
      };
    }

    // Atomic, idempotent unlock via RPC
    const env = process.env.NODE_ENV === "production" ? "live" : "test";
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("unlock_candidate", {
      _candidate_id: data.candidate_id,
      _env: env,
    });
    if (rpcErr) return { ok: false as const, error: rpcErr.message };

    const r = rpcRes as {
      ok: boolean;
      already_unlocked?: boolean;
      unlock_id?: string;
      balance?: number;
      error?: string;
    };

    if (!r?.ok) {
      if (r?.error === "no_credits") {
        return {
          ok: false as const,
          error: "no_credits",
          message: "You're out of credits. Buy more to unlock this candidate.",
        };
      }
      return { ok: false as const, error: r?.error ?? "unlock_failed" };
    }

    // Notify candidate on a fresh unlock only.
    if (!r.already_unlocked) {
      const label = await employerLabel(supabase, userId);
      try {
        await supabase.from("notifications").insert({
          user_id: data.candidate_id,
          kind: "unlock",
          title: "An employer unlocked your profile",
          body: `${label} can now see your full profile and may request an intro.`,
          link: "/dashboard",
        });
      } catch {/* best-effort */}
    }

    return {
      ok: true as const,
      already_unlocked: !!r.already_unlocked,
      unlock_id: r.unlock_id!,
      balance: r.balance ?? 0,
    };
  });

// ── 2) FULL VIEW (employer) ──────────────────────────────────────────────────
export const getUnlockedCandidate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ candidate_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: unlock } = await supabase
      .from("resume_unlocks")
      .select("id, unlocked_at")
      .eq("employer_user_id", userId)
      .eq("member_id", data.candidate_id)
      .order("unlocked_at", { ascending: false })
      .maybeSingle();

    if (!unlock) {
      return { ok: false as const, error: "not_unlocked" };
    }

    const { data: profile, error } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", data.candidate_id)
      .maybeSingle();
    if (error) return { ok: false as const, error: error.message };
    if (!profile) return { ok: false as const, error: "not_found" };

    // Only expose email if the candidate has opted in.
    let email: string | null = null;
    if ((profile as unknown as { share_email_on_unlock?: boolean }).share_email_on_unlock) {
      const { data: cand } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", data.candidate_id)
        .maybeSingle();
      email = (cand?.email as string | null) ?? null;
    }

    // Any existing intro for this pair (latest)
    const { data: intro } = await supabase
      .from("employer_intros")
      .select("id, status, reason, created_at, responded_at")
      .eq("employer_user_id", userId)
      .eq("member_id", data.candidate_id)
      .order("created_at", { ascending: false })
      .maybeSingle();

    return {
      ok: true as const,
      profile,
      unlocked_at: unlock.unlocked_at,
      contact: { email },
      intro,
    };
  });

// ── 3) LIST UNLOCKED (employer) ──────────────────────────────────────────────
export const listUnlockedCandidates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: unlocks } = await supabase
      .from("resume_unlocks")
      .select("id, member_id, unlocked_at")
      .eq("employer_user_id", userId)
      .order("unlocked_at", { ascending: false })
      .limit(200);

    const ids = (unlocks ?? []).map((u) => u.member_id);
    if (!ids.length) return { rows: [] as Array<Record<string, string | number | boolean | null>> };

    const [{ data: profiles }, { data: intros }] = await Promise.all([
      supabase.from("candidate_profiles").select("*").in("user_id", ids),
      supabase
        .from("employer_intros")
        .select("member_id, status")
        .eq("employer_user_id", userId)
        .in("member_id", ids),
    ]);

    const introBy = new Map<string, string>();
    for (const i of intros ?? []) {
      if (!introBy.has(i.member_id)) introBy.set(i.member_id, i.status);
    }

    const profileBy = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const rows: Array<Record<string, unknown>> = [];
    for (const u of unlocks ?? []) {
      const p = profileBy.get(u.member_id);
      if (!p) continue;
      rows.push({
        ...(p as Record<string, unknown>),
        unlocked_at: u.unlocked_at,
        intro_status: introBy.get(u.member_id) ?? null,
        anon_label: `Candidate #${String(u.member_id).replace(/-/g, "").slice(-4).toUpperCase()}`,
      });
    }
    return { rows: rows as unknown as Array<Record<string, string | number | boolean | null>> };
  });

// ── 4) REQUEST INTRO (employer) ──────────────────────────────────────────────
const REASONS = [
  "open_role_exploratory",
  "open_role_active",
  "pipeline",
  "specific_project",
] as const;

export const requestIntro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        candidate_id: z.string().uuid(),
        reason: z.enum(REASONS),
        message: z.string().trim().max(800).optional().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Must already be unlocked
    const { data: unlock } = await supabase
      .from("resume_unlocks")
      .select("id")
      .eq("employer_user_id", userId)
      .eq("member_id", data.candidate_id)
      .maybeSingle();
    if (!unlock) return { ok: false as const, error: "not_unlocked" };

    // Reuse open intro if one already exists
    const { data: existing } = await supabase
      .from("employer_intros")
      .select("id, status")
      .eq("employer_user_id", userId)
      .eq("member_id", data.candidate_id)
      .in("status", ["pending", "accepted", "connected"])
      .maybeSingle();
    if (existing) {
      return { ok: true as const, intro_id: existing.id, status: existing.status, reused: true };
    }

    const { data: inserted, error } = await supabase
      .from("employer_intros")
      .insert({
        employer_user_id: userId,
        member_id: data.candidate_id,
        unlock_id: unlock.id,
        reason: data.reason,
        message: data.message || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };

    const label = await employerLabel(supabase, userId);
    try {
      await supabase.from("notifications").insert({
        user_id: data.candidate_id,
        kind: "intro_request",
        title: `${label} would like an intro`,
        body: data.message
          ? `Reason: ${prettyReason(data.reason)} — “${data.message.slice(0, 180)}”`
          : `Reason: ${prettyReason(data.reason)}. Accept or decline from your dashboard.`,
        link: "/dashboard",
      });
    } catch {/* best-effort */}

    return { ok: true as const, intro_id: inserted.id, status: "pending" as const };
  });

function prettyReason(r: string) {
  switch (r) {
    case "open_role_exploratory": return "Open role — exploratory";
    case "open_role_active": return "Open role — actively hiring";
    case "pipeline": return "Building a pipeline";
    case "specific_project": return "Specific project";
    default: return r;
  }
}

// ── 5) RESPOND TO INTRO (candidate) ──────────────────────────────────────────
export const respondToIntro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({ intro_id: z.string().uuid(), accept: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: intro } = await supabase
      .from("employer_intros")
      .select("id, member_id, employer_user_id, status")
      .eq("id", data.intro_id)
      .maybeSingle();
    if (!intro) return { ok: false as const, error: "not_found" };
    if (intro.member_id !== userId) return { ok: false as const, error: "forbidden" };
    if (intro.status !== "pending")
      return { ok: false as const, error: "already_responded" };

    const next = data.accept ? "accepted" : "declined";
    const { error: upErr } = await supabase
      .from("employer_intros")
      .update({ status: next, responded_at: new Date().toISOString() })
      .eq("id", data.intro_id);
    if (upErr) return { ok: false as const, error: upErr.message };

    // Notify employer either way
    try {
      await supabase.from("notifications").insert({
        user_id: intro.employer_user_id,
        kind: data.accept ? "intro_accepted" : "intro_declined",
        title: data.accept
          ? "Candidate accepted your intro request"
          : "Candidate isn't available right now",
        body: data.accept
          ? "Open the candidate to see contact details and continue the conversation."
          : "No credit was used for the request. Try another candidate.",
        link: `/employer/unlocked/${intro.member_id}`,
      });
    } catch {/* best-effort */}

    return { ok: true as const, status: next };
  });

// ── 6) LISTS ─────────────────────────────────────────────────────────────────
export const listMyEmployerIntros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("employer_intros")
      .select("id, member_id, reason, message, status, created_at, responded_at")
      .eq("employer_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { rows: [], error: error.message } as const;
    return { rows: data ?? [] } as const;
  });

export const listMyCandidateIntros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("employer_intros")
      .select("id, employer_user_id, reason, message, status, created_at, responded_at")
      .eq("member_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { rows: [], error: error.message } as const;

    const ids = Array.from(new Set((data ?? []).map((r) => r.employer_user_id)));
    const labels = await employerLabels(supabase, ids);

    const rows = (data ?? []).map((r) => ({
      ...r,
      employer_label: labels.get(r.employer_user_id) ?? "A verified employer",
      reason_pretty: prettyReason(r.reason ?? ""),
    }));
    return { rows } as const;
  });

// ── 7) CANDIDATE PRIVACY TOGGLES ─────────────────────────────────────────────
export const updateUnlockPrivacy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        share_email_on_unlock: z.boolean().optional(),
        notify_email_on_unlock: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: Record<string, unknown> = {};
    if (typeof data.share_email_on_unlock === "boolean")
      patch.share_email_on_unlock = data.share_email_on_unlock;
    if (typeof data.notify_email_on_unlock === "boolean")
      patch.notify_email_on_unlock = data.notify_email_on_unlock;
    if (!Object.keys(patch).length) return { ok: true as const };

    const { error } = await supabase
      .from("candidate_profiles")
      .update(patch as never)
      .eq("user_id", userId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const getUnlockPrivacy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("candidate_profiles")
      .select("share_email_on_unlock, notify_email_on_unlock")
      .eq("user_id", userId)
      .maybeSingle();
    return {
      share_email_on_unlock: !!data?.share_email_on_unlock,
      notify_email_on_unlock: data?.notify_email_on_unlock !== false,
    };
  });
