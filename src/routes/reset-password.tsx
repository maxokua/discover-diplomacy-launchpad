import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password | Discover Diplomacy" },
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
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);

  // Only allow password update when arriving via Supabase's recovery link.
  // Supabase fires PASSWORD_RECOVERY once the hash token is exchanged.
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const isRecoveryHash = hash.includes("type=recovery");

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // Fallback: if no recovery hash and no session, deny.
    const timer = window.setTimeout(async () => {
      if (ready) return;
      if (isRecoveryHash) return;
      const { data } = await supabase.auth.getSession();
      // A normal logged-in user shouldn't change password from this page
      // without going through the email link.
      if (!data.session) setDenied(true);
      else setDenied(true);
    }, 600);

    return () => {
      listener.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [ready]);

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

  if (denied) {
    return (
      <SiteLayout>
        <section className="bg-paper">
          <div className="mx-auto grid min-h-[calc(100vh-200px)] max-w-7xl items-center px-6 py-16 lg:px-10">
            <div className="mx-auto w-full max-w-md text-center">
              <div className="eyebrow">Reset link required</div>
              <h1 className="mt-4 font-display text-2xl text-navy-deep lg:text-3xl">
                Open this page from the email we sent.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                For your security, you can only set a new password after clicking the recovery link
                in your inbox. Request a new one if needed.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  to="/auth"
                  className="bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto grid min-h-[calc(100vh-200px)] max-w-7xl items-center px-6 py-16 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <div className="eyebrow">Client Portal</div>
            <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Set a new password</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Choose a strong password, at least 8 characters.
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
