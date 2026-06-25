import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminRole = "member" | "coach" | "employer" | "admin";

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: AdminRole;
};

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.rpc("admin_list_users");
    if (error) return { error: error.message };
    return { users: (data ?? []) as AdminUserRow[] };
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: AdminRole }) => {
    if (!input?.userId) throw new Error("userId required");
    if (!["member", "coach", "employer", "admin"].includes(input.role)) {
      throw new Error("invalid role");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.rpc("admin_set_user_role", {
      _user_id: data.userId,
      _role: data.role,
    });
    if (error) return { error: error.message };
    return { ok: true };
  });
