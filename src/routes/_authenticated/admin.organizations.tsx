import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import {
  adminDeleteOrganization,
  adminListOrganizations,
  adminUpsertOrganization,
} from "@/lib/resume-drop.functions";

export const Route = createFileRoute("/_authenticated/admin/organizations")({
  head: () => ({ meta: [{ title: "Admin · Organizations | Discover Diplomacy" }] }),
  component: AdminOrgsPage,
});

type Org = {
  id: string;
  name: string;
  slug: string;
  category:
    | "government"
    | "ngo"
    | "think_tank"
    | "multilateral"
    | "company"
    | "foundation"
    | "other";
  logo_url: string | null;
  website: string | null;
  verification_status: "pending" | "verified" | "rejected";
};

const CATS: Org["category"][] = [
  "government",
  "ngo",
  "think_tank",
  "multilateral",
  "company",
  "foundation",
  "other",
];

const STATUSES: Org["verification_status"][] = ["pending", "verified", "rejected"];

const EMPTY: Org = {
  id: "",
  name: "",
  slug: "",
  category: "ngo",
  logo_url: "",
  website: "",
  verification_status: "verified",
};

function AdminOrgsPage() {
  const [rows, setRows] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Org | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const r = await adminListOrganizations({});
    if ("error" in r && r.error) toast.error(r.error);
    setRows((r.organizations as Org[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    setBusy(true);
    try {
      const payload = {
        ...(editing.id ? { id: editing.id } : {}),
        name: editing.name,
        slug: editing.slug,
        category: editing.category,
        logo_url: editing.logo_url ?? "",
        website: editing.website ?? "",
        verification_status: editing.verification_status,
      };
      const r = await adminUpsertOrganization({ data: payload });
      if ("error" in r && r.error) throw new Error(r.error);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this organization?")) return;
    const r = await adminDeleteOrganization({ data: { id } });
    if ("error" in r && r.error) toast.error(r.error);
    else load();
  }

  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">Admin</div>
              <h1 className="mt-3 font-display text-3xl text-navy-deep">Organizations</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage the verified employer organizations members can choose from.
              </p>
            </div>
            <button
              onClick={() => setEditing({ ...EMPTY })}
              className="bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              New organization
            </button>
          </div>

          <div className="mt-8 overflow-x-auto border border-border bg-paper">
            {loading ? (
              <div className="p-8 text-sm text-muted-foreground">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground">
                No organizations yet. Add your first verified employer.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-navy-deep">
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-medium">{o.name}</td>
                      <td className="px-4 py-3">{o.category.replace("_", " ")}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                            (o.verification_status === "verified"
                              ? "bg-emerald/10 text-emerald"
                              : o.verification_status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800")
                          }
                        >
                          {o.verification_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{o.slug}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditing({ ...o, logo_url: o.logo_url ?? "", website: o.website ?? "" })}
                          className="mr-3 text-xs font-medium uppercase tracking-wider text-navy-deep underline-offset-4 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(o.id)}
                          className="text-xs font-medium uppercase tracking-wider text-red-700 underline-offset-4 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/70 p-4">
          <div className="w-full max-w-xl bg-paper p-6 shadow-xl">
            <h2 className="font-display text-xl text-navy-deep">
              {editing.id ? "Edit organization" : "New organization"}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input
                label="Name"
                value={editing.name}
                onChange={(v) => setEditing({ ...editing, name: v })}
              />
              <Input
                label="Slug (a-z, 0-9, -)"
                value={editing.slug}
                onChange={(v) =>
                  setEditing({ ...editing, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                }
              />
              <Select
                label="Category"
                value={editing.category}
                options={CATS}
                onChange={(v) => setEditing({ ...editing, category: v as Org["category"] })}
              />
              <Select
                label="Verification status"
                value={editing.verification_status}
                options={STATUSES}
                onChange={(v) =>
                  setEditing({ ...editing, verification_status: v as Org["verification_status"] })
                }
              />
              <Input
                label="Website (optional)"
                value={editing.website ?? ""}
                onChange={(v) => setEditing({ ...editing, website: v })}
              />
              <Input
                label="Logo URL (optional)"
                value={editing.logo_url ?? ""}
                onChange={(v) => setEditing({ ...editing, logo_url: v })}
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-navy-deep"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-border bg-paper px-3 py-2 text-sm text-navy-deep normal-case tracking-normal focus:outline-none focus:ring-2 focus:ring-navy-deep"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-border bg-paper px-3 py-2 text-sm text-navy-deep normal-case tracking-normal focus:outline-none focus:ring-2 focus:ring-navy-deep"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
