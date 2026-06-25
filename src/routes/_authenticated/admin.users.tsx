import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListUsers,
  adminSetUserRole,
  type AdminRole,
  type AdminUserRow,
} from "@/lib/admin-users.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin · Users | Discover Diplomacy" }] }),
  component: AdminUsersPage,
});

const ROLES: AdminRole[] = ["member", "coach", "employer", "admin"];

function AdminUsersPage() {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setAllowed(false);
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      setAllowed(!!isAdmin);
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      const res = await adminListUsers();
      if ("error" in res) toast.error(res.error);
      else setRows(res.users);
      setLoading(false);
    })();
  }, []);

  async function changeRole(userId: string, role: AdminRole) {
    setBusy(userId);
    const res = await adminSetUserRole({ data: { userId, role } });
    setBusy(null);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === userId ? { ...r, role } : r)));
    toast.success("Role updated");
  }

  if (allowed === null || loading) {
    return (
      <SiteLayout>
        <div className="container py-16 text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!allowed) {
    return (
      <SiteLayout>
        <div className="container py-16">
          <h1 className="text-2xl font-semibold">Not authorized</h1>
          <p className="text-muted-foreground mt-2">
            You need admin access to view this page.
          </p>
        </div>
      </SiteLayout>
    );
  }

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      r.email?.toLowerCase().includes(needle) ||
      r.full_name?.toLowerCase().includes(needle) ||
      r.id.includes(needle)
    );
  });

  return (
    <SiteLayout>
      <div className="container py-12 max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">
          {rows.length} total · change a user's role inline.
        </p>

        <div className="mt-6">
          <Input
            placeholder="Search by name, email, or id"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="mt-6 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium w-48">Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.full_name || "—"}</div>
                    <div className="text-muted-foreground text-xs">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={r.role}
                      onValueChange={(v) => changeRole(r.id, v as AdminRole)}
                      disabled={busy === r.id}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SiteLayout>
  );
}
