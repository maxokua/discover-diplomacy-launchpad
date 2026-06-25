import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Role = "member" | "coach" | "employer" | "admin";

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ role: Role }> => {
    // user_roles is admin-only via RLS; read with service role for the
    // authenticated caller's own id only.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) return { role: "member" };

    const roles = new Set((data ?? []).map((r: any) => r.role as string));
    // Highest privilege wins.
    if (roles.has("admin")) return { role: "admin" };
    if (roles.has("employer")) return { role: "employer" };
    if (roles.has("coach")) return { role: "coach" };
    return { role: "member" };
  });

export function dashboardPathFor(role: Role): string {
  switch (role) {
    case "admin": return "/admin";
    case "coach": return "/coach";
    case "employer": return "/employer";
    default: return "/dashboard";
  }
}
