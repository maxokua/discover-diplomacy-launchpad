import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — Discover Diplomacy" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

type State =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function UnsubscribePage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
    if (!t) {
      setState({ kind: "invalid" });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          setState({ kind: "invalid" });
          return;
        }
        if (body.valid === false && body.reason === "already_unsubscribed") {
          setState({ kind: "already" });
          return;
        }
        if (body.valid === true) {
          setState({ kind: "ready" });
          return;
        }
        setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "invalid" }));
  }, []);

  async function confirm() {
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "error", message: body.error ?? "Something went wrong." });
        return;
      }
      if (body.success) setState({ kind: "success" });
      else if (body.reason === "already_unsubscribed") setState({ kind: "already" });
      else setState({ kind: "error", message: "Unsubscribe failed." });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Network error." });
    }
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
          <div className="eyebrow text-emerald">Email preferences</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Unsubscribe</h1>

          <div className="mt-8 border border-border bg-paper p-6 lg:p-8">
            {state.kind === "loading" && (
              <p className="text-sm text-muted-foreground">Checking your unsubscribe link…</p>
            )}

            {state.kind === "invalid" && (
              <>
                <p className="text-base text-navy-deep">This unsubscribe link is invalid or expired.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  If you keep receiving emails you don't want, reply to any message and we'll handle it manually.
                </p>
              </>
            )}

            {state.kind === "already" && (
              <>
                <p className="text-base text-navy-deep">You're already unsubscribed.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We won't send you any more emails. You can close this tab.
                </p>
              </>
            )}

            {state.kind === "ready" && (
              <>
                <p className="text-base text-navy-deep">
                  Click below to stop receiving emails from Discover Diplomacy.
                </p>
                <button
                  onClick={confirm}
                  className="mt-5 inline-flex items-center gap-2 bg-navy-deep px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
                >
                  Confirm unsubscribe
                </button>
              </>
            )}

            {state.kind === "submitting" && (
              <p className="text-sm text-muted-foreground">Processing…</p>
            )}

            {state.kind === "success" && (
              <>
                <p className="text-base text-navy-deep">You've been unsubscribed.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've removed you from our list. If this was a mistake, email{" "}
                  <a href="mailto:hello@discoverdiplomacy.com" className="underline">hello@discoverdiplomacy.com</a>{" "}
                  and we'll re-subscribe you.
                </p>
              </>
            )}

            {state.kind === "error" && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
