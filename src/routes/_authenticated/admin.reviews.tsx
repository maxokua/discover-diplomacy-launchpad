import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListReviews,
  adminGetResumeUrls,
  adminCreateReviewedUpload,
  adminFinalizeReview,
} from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  head: () => ({ meta: [{ title: "Admin · Resume reviews | Discover Diplomacy" }] }),
  component: AdminReviewsPage,
});

type Row = {
  id: string;
  user_id: string;
  status: string;
  target_role: string;
  notes: string | null;
  resume_path: string | null;
  reviewed_resume_path: string | null;
  amount_cents: number;
  environment: string | null;
  created_at: string;
};

function AdminReviewsPage() {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      if (!isAdmin) return;
      const result = await adminListReviews();
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setRows(result.reviews as Row[]);
      }
      setLoading(false);
    })();
  }, []);

  async function openOriginal(id: string) {
    const r = await adminGetResumeUrls({ data: { reviewId: id } });
    if ("error" in r) return toast.error(r.error);
    if (r.originalUrl) window.open(r.originalUrl, "_blank", "noopener,noreferrer");
    else toast.error("No file");
  }

  async function uploadReviewed(id: string, file: File) {
    setBusyId(id);
    try {
      const init = await adminCreateReviewedUpload({
        data: { reviewId: id, filename: file.name },
      });
      if ("error" in init) throw new Error(init.error);
      const upload = await fetch(init.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      });
      if (!upload.ok) throw new Error("Upload failed");
      const fin = await adminFinalizeReview({
        data: { reviewId: id, reviewedPath: init.path, status: "completed" },
      });
      if ("error" in fin) throw new Error(fin.error);
      toast.success("Delivered to member.");
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, reviewed_resume_path: init.path, status: "completed" }
            : r,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't upload");
    } finally {
      setBusyId(null);
    }
  }

  async function setStatus(id: string, status: "in_review" | "completed" | "canceled") {
    setBusyId(id);
    try {
      const fin = await adminFinalizeReview({ data: { reviewId: id, status } });
      if ("error" in fin) throw new Error(fin.error);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success("Status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update");
    } finally {
      setBusyId(null);
    }
  }

  if (allowed === null) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-sm text-muted-foreground">Checking access…</div>
      </SiteLayout>
    );
  }

  if (!allowed) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="font-display text-3xl text-navy-deep">Admins only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You don't have access to this page.{" "}
            <Link to="/dashboard" className="underline">Back to dashboard</Link>.
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="eyebrow">Admin</div>
          <h1 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">Resume reviews</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Deliver reviewed resumes back to members. Members can download from their dashboard once
            status is <em>Completed</em>.
          </p>

          <div className="mt-10 border border-border bg-paper">
            {loading ? (
              <div className="p-8 text-sm text-muted-foreground">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No orders.</div>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((r) => (
                  <li key={r.id} className="grid gap-3 p-6 lg:grid-cols-12 lg:items-center">
                    <div className="lg:col-span-4">
                      <div className="font-display text-base text-navy-deep">{r.target_role}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()} · {r.environment ?? ", "}
                      </div>
                      {r.notes && (
                        <div className="mt-2 text-xs text-muted-foreground line-clamp-3">{r.notes}</div>
                      )}
                    </div>
                    <div className="lg:col-span-2 text-xs uppercase tracking-wider text-emerald">
                      {r.status}
                    </div>
                    <div className="lg:col-span-3 flex flex-wrap gap-2 text-xs">
                      {r.resume_path && (
                        <button
                          onClick={() => openOriginal(r.id)}
                          className="border border-border px-3 py-1.5 hover:bg-stone"
                        >
                          Original ↓
                        </button>
                      )}
                      {r.status !== "in_review" && r.status !== "completed" && (
                        <button
                          disabled={busyId === r.id}
                          onClick={() => setStatus(r.id, "in_review")}
                          className="border border-border px-3 py-1.5 hover:bg-stone disabled:opacity-60"
                        >
                          Mark in review
                        </button>
                      )}
                    </div>
                    <div className="lg:col-span-3 lg:text-right">
                      <label className="inline-flex cursor-pointer items-center gap-2 border border-navy-deep bg-navy-deep px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy">
                        {busyId === r.id ? "Uploading…" : r.reviewed_resume_path ? "Replace reviewed" : "Upload reviewed"}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          disabled={busyId === r.id}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadReviewed(r.id, f);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
