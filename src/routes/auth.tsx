import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({
    next:
      typeof s.next === "string" &&
      s.next.startsWith("/") &&
      !s.next.startsWith("//") &&
      !s.next.startsWith("/\\")
        ? s.next
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in | Discover Diplomacy" },
      { name: "description", content: "Sign in or create an account to manage your engagements with Discover Diplomacy." },
      { property: "og:title", content: "Sign in | Discover Diplomacy" },
      { property: "og:description", content: "Sign in or create an account to manage your engagements with Discover Diplomacy." },
      { property: "og:url", content: "https://discoverdiplomacy.org/auth" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/auth" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
const nameSchema = z.string().trim().min(1, "Enter your name").max(100);

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const nextPath =
    next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
      ? next
      : "/dashboard";
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [signupSent, setSignupSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = nextPath;
    });
  }, [navigate, nextPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsedEmail = emailSchema.parse(email);
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setResetSent(true);
      } else if (mode === "signup") {
        const parsedPassword = passwordSchema.parse(password);
        const parsedName = nameSchema.parse(fullName);
        const { data, error } = await supabase.auth.signUp({
          email: parsedEmail,
          password: parsedPassword,
          options: {
            emailRedirectTo: window.location.origin + nextPath,
            data: { full_name: parsedName },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created");
          window.location.href = nextPath;
        } else {
          setSignupSent(true);
        }
      } else {
        const parsedPassword = passwordSchema.parse(password);
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail,
          password: parsedPassword,
        });
        if (error) throw error;
        toast.success("Welcome back");
        window.location.href = nextPath;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + nextPath,
      });
      if (result.error) {
        toast.error("Google sign-in failed");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = nextPath;
    } catch {
      toast.error("Google sign-in failed");
      setBusy(false);
    }
  }

  const heading =
    mode === "signin"
      ? "Sign in to your account"
      : mode === "signup"
      ? "Create your account"
      : "Reset your password";
  const subhead =
    mode === "signin"
      ? "Access your engagements and resume reviews."
      : mode === "signup"
      ? "Get started with Discover Diplomacy."
      : "Enter your email and we'll send you a reset link.";

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto grid min-h-[calc(100vh-200px)] max-w-7xl items-center px-6 py-16 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <div className="eyebrow">Client Portal</div>
            <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">{heading}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{subhead}</p>

            {mode === "reset" && resetSent ? (
              <div className="mt-10 border border-border bg-stone p-6 text-sm text-navy-deep">
                If an account exists for that email, a reset link is on its way. Check your inbox
                (and spam folder).
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setResetSent(false);
                    }}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    ← Back to sign in
                  </button>
                </div>
              </div>
            ) : mode === "signup" && signupSent ? (
              <div className="mt-10 border border-border bg-stone p-6 text-sm text-navy-deep">
                Check your inbox to confirm your email and finish setting up your account.
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                  {mode === "signup" && (
                    <label className="block">
                      <span className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                        Full name
                      </span>
                      <input
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                      />
                    </label>
                  )}
                  <label className="block">
                    <span className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                      Email
                    </span>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                    />
                  </label>
                  {mode !== "reset" && (
                    <label className="block">
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                          Password
                        </span>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => setMode("reset")}
                            className="text-xs text-muted-foreground hover:text-navy-deep underline-offset-4 hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <input
                        required
                        type="password"
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                      />
                    </label>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper transition-colors hover:bg-navy disabled:opacity-60"
                  >
                    {busy
                      ? "Working…"
                      : mode === "signin"
                      ? "Sign in"
                      : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
                  </button>
                </form>

                {mode !== "reset" && (
                  <>
                    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                      <div className="h-px flex-1 bg-border" /> or{" "}
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={busy}
                      className="w-full border border-border bg-paper px-5 py-3 text-sm text-navy-deep transition-colors hover:bg-stone disabled:opacity-60"
                    >
                      Continue with Google
                    </button>
                  </>
                )}
              </>
            )}

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  No account yet?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-medium text-navy-deep underline-offset-4 hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setSignupSent(false);
                    }}
                    className="font-medium text-navy-deep underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Remembered it?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setResetSent(false);
                    }}
                    className="font-medium text-navy-deep underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-navy-deep">← Back to home</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
