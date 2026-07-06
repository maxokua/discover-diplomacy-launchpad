import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";

export type WaitlistInterest =
  | "compass"
  | "envoy"
  | "employer"
  | "university"
  | "coach"
  | "resume_review";

const INTEREST_LABELS: Record<WaitlistInterest, string> = {
  compass: "Compass ($20/mo)",
  envoy: "Envoy ($150/mo)",
  employer: "Employer access & candidate unlocks",
  university: "University program",
  coach: "Join as a coach",
  resume_review: "Expert Resume Review",
};

type OpenOptions = { interest?: WaitlistInterest; title?: string };

type Ctx = { open: (opts?: OpenOptions) => void };
const WaitlistCtx = createContext<Ctx | null>(null);

export function useWaitlist(): Ctx {
  const ctx = useContext(WaitlistCtx);
  if (!ctx) throw new Error("useWaitlist must be used inside <WaitlistProvider>");
  return ctx;
}

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(320),
  interest: z.enum([
    "compass",
    "envoy",
    "employer",
    "university",
    "coach",
    "resume_review",
  ]),
});

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>("Join the waitlist");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<WaitlistInterest>("compass");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const open = useCallback((opts?: OpenOptions) => {
    setTitle(opts?.title ?? "Join the waitlist");
    if (opts?.interest) setInterest(opts.interest);
    setError(null);
    setDone(false);
    setIsOpen(true);
  }, []);

  const ctx = useMemo<Ctx>(() => ({ open }), [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, interest });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("waitlist").insert({
        email: parsed.data.email.toLowerCase(),
        interest: parsed.data.interest,
      });
      if (insertError) throw insertError;
      setDone(true);
      setEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WaitlistCtx.Provider value={ctx}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-navy-deep">You're on the list.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We'll email you the moment {INTEREST_LABELS[interest].toLowerCase()} opens up.
              </p>
              <Button className="mt-6" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-navy-deep">{title}</DialogTitle>
                <DialogDescription>
                  We're finalizing payments and will open access in waves. Leave your email and
                  we'll reach out.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="mt-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="waitlist-email">Email</Label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waitlist-interest">Interested in</Label>
                  <Select
                    value={interest}
                    onValueChange={(v) => setInterest(v as WaitlistInterest)}
                  >
                    <SelectTrigger id="waitlist-interest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(INTEREST_LABELS) as WaitlistInterest[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {INTEREST_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Joining…" : "Join the waitlist"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  No payment collected. We'll only email you about early access.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </WaitlistCtx.Provider>
  );
}

/** Convenience trigger button that opens the waitlist modal for a given interest. */
export function WaitlistButton({
  interest,
  children,
  className,
  variant,
}: {
  interest: WaitlistInterest;
  children: ReactNode;
  className?: string;
  variant?: "navy" | "emerald" | "paper";
}) {
  const { open } = useWaitlist();
  const base =
    "inline-flex items-center justify-center px-6 py-3 text-xs font-medium uppercase tracking-wider transition-colors";
  const tone =
    variant === "emerald"
      ? "bg-emerald text-navy-deep hover:bg-emerald/90"
      : variant === "paper"
        ? "bg-paper text-navy-deep hover:bg-paper/90"
        : "bg-navy-deep text-paper hover:bg-navy";
  return (
    <button
      type="button"
      onClick={() => open({ interest })}
      className={`${base} ${tone} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
