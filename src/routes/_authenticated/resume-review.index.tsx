import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resume-review/")({
  head: () => ({ meta: [{ title: "Start a Resume Review | Discover Diplomacy" }] }),
  component: ResumeReviewIntake,
});

const schema = z.object({
  targetRole: z.string().trim().min(2, "Tell us the role you're targeting").max(200),
  notes: z.string().trim().max(2000).optional(),
});

function ResumeReviewIntake() {
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload your resume");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    const ALLOWED_MIME = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    const ALLOWED_EXT = new Set(["pdf", "doc", "docx"]);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return;
    }
    setBusy(true);
    try {
      const parsed = schema.parse({ targetRole, notes });
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const userId = userData.user.id;

      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
        contentType: "application/octet-stream",
      });
      if (upErr) throw upErr;

      const { data: inserted, error: insErr } = await supabase
        .from("resume_reviews")
        .insert({
          user_id: userId,
          target_role: parsed.targetRole,
          notes: parsed.notes || null,
          resume_path: path,
          status: "pending_payment",
        })
        .select("id")
        .single();
      if (insErr || !inserted) throw insErr ?? new Error("Could not create order");

      navigate({ to: "/resume-review/checkout", search: { reviewId: inserted.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto grid max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="eyebrow">Expert Resume Review · $25</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-5xl">
            Tell us about the role you're targeting.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Upload your current resume and share the role or roles you're chasing. An expert
            reviewer will return a line-by-line revision tuned for ATS keywords within 3–5
            business days.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                Target role / job posting
              </label>
              <input
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Foreign Affairs Officer, U.S. Department of State"
                className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                Notes for your reviewer (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Anything we should know, career pivots, gaps, specific job descriptions to tailor to."
                className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-navy-deep">
                Resume (PDF or DOCX, max 10MB)
              </label>
              <input
                required
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full border border-border bg-paper px-4 py-3 text-sm text-navy-deep file:mr-4 file:border-0 file:bg-stone file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider file:text-navy-deep"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={busy}
                className="bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
              >
                {busy ? "Submitting…" : "Continue to payment · $25"}
              </button>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-navy-deep">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
