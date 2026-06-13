import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Discover Diplomacy" },
      { name: "description", content: "Set a new password for your Discover Diplomacy account." },
    ],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (password !== confirm) throw new Error("Passwords don't match");
      const parsed = passwordSchema.parse(password);
      const { error } = await supabase.auth.updateUser({ password: parsed });
      if (error) throw error;
      toast.success("Password updated");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto grid min-h-[calc(100vh-200px)] max-w-7xl items-center px-6 py-16 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <div className="eyebrow">Client Portal</div>
            <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Set a new password</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Choose a strong password — at least 8 characters.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                  New password
                </label>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                  Confirm new password
                </label>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper transition-colors hover:bg-navy disabled:opacity-60"
              >
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/auth" className="hover:text-navy-deep">← Back to sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
