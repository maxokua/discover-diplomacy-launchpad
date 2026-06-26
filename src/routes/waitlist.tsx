import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";

const search = z.object({
  interest: z.enum(["compass", "envoy", "resume-review"]).optional(),
});

export const Route = createFileRoute("/waitlist")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Join the waitlist | Discover Diplomacy" },
      {
        name: "description",
        content:
          "We're building Compass, Envoy, and Expert Resume Review. Join the waitlist and we'll let you know the moment it's live.",
      },
    ],
  }),
  component: WaitlistPage,
});

const COPY = {
  compass: { name: "Compass", blurb: "Self-directed plan — $35/mo at launch." },
  envoy: { name: "Envoy", blurb: "Hands-on coaching plan — $150/mo at launch." },
  "resume-review": {
    name: "Expert Resume Review",
    blurb: "One-time line-by-line review — $25 at launch.",
  },
} as const;

function WaitlistPage() {
  const searchParams = Route.useSearch() as { interest?: keyof typeof COPY };
  const interest = searchParams.interest;
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const copy = interest ? COPY[interest] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = z
        .object({
          email: z.string().trim().email("Enter a valid email"),
          note: z.string().trim().max(1000).optional(),
        })
        .parse({ email, note });

      const { error } = await (supabase.from("waitlist" as never) as any).insert({
        email: parsed.email,
        interest: interest ?? null,
        note: parsed.note || null,
      });
      if (error && !/duplicate/i.test(error.message)) throw error;
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join waitlist");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="eyebrow">Pre-launch</div>
          <h1 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">
            Join the waitlist
          </h1>
          {copy && (
            <p className="mt-3 text-sm font-medium text-emerald">
              {copy.name} — {copy.blurb}
            </p>
          )}
          <p className="mt-6 text-base text-muted-foreground">
            We're finishing the build. Drop your email and we'll let you know the day it goes
            live — no spam, no charges yet.
          </p>

          {done ? (
            <div className="mt-10 border border-emerald/40 bg-emerald/5 p-6">
              <div className="font-display text-xl text-navy-deep">You're on the list.</div>
              <p className="mt-2 text-sm text-muted-foreground">
                We'll be in touch at <strong>{email}</strong> when {copy ? copy.name : "Discover Diplomacy"} launches.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                  What are you hoping for? (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Anything you'd like us to know."
                  className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
              >
                {busy ? "Adding you…" : "Join the waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
