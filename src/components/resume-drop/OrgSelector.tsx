import { useEffect, useMemo, useState } from "react";
import { listOrganizations } from "@/lib/resume-drop.functions";

type Org = { id: string; name: string; slug: string; category: string; logo_url: string | null };

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "think_tank", label: "Think Tank" },
  { value: "multilateral", label: "Multilateral" },
  { value: "company", label: "Company" },
  { value: "foundation", label: "Foundation" },
] as const;

export function OrgSelector({
  visibility,
  setVisibility,
  selectedIds,
  setSelectedIds,
}: {
  visibility: "all" | "selected";
  setVisibility: (v: "all" | "selected") => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("all");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visibility !== "selected") return;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await listOrganizations({ data: { search, category, limit: 120 } });
      if (!("error" in res) || !res.error) setOrgs((res.organizations as Org[]) ?? []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [search, category, visibility]);

  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds([...next]);
  }
  function selectAllInCategory() {
    const next = new Set(selected);
    for (const o of orgs) next.add(o.id);
    setSelectedIds([...next]);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label className="flex cursor-pointer items-start gap-3 border border-border bg-paper p-4 text-sm">
          <input
            type="radio"
            name="visibility"
            className="mt-1"
            checked={visibility === "all"}
            onChange={() => setVisibility("all")}
          />
          <div>
            <div className="font-medium text-navy-deep">
              Discoverable to all verified organizations
            </div>
            <div className="text-xs text-muted-foreground">You can change this anytime.</div>
          </div>
        </label>
        <label className="flex cursor-pointer items-start gap-3 border border-border bg-paper p-4 text-sm">
          <input
            type="radio"
            name="visibility"
            className="mt-1"
            checked={visibility === "selected"}
            onChange={() => setVisibility("selected")}
          />
          <div>
            <div className="font-medium text-navy-deep">
              Choose which organizations can see my profile
            </div>
            <div className="text-xs text-muted-foreground">
              Pick organizations one by one. Only those you select can unlock you.
            </div>
          </div>
        </label>
      </div>

      {visibility === "selected" && (
        <div className="space-y-4 border border-border bg-stone/40 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter organizations…"
              className="flex-1 min-w-[180px] border border-border bg-paper px-3 py-2 text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="border border-border bg-paper px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={selectAllInCategory}
              disabled={orgs.length === 0}
              className="border border-border bg-paper px-3 py-2 text-xs font-medium uppercase tracking-wider text-navy-deep disabled:opacity-50"
            >
              Select all shown
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-border bg-paper">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading organizations…</div>
            ) : orgs.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No verified organizations yet. As we onboard employers, they'll appear here. In the
                meantime, choose "discoverable to all" to be visible the moment any employer is
                verified.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {orgs.map((o) => (
                  <li key={o.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-stone/40">
                      <input
                        type="checkbox"
                        checked={selected.has(o.id)}
                        onChange={() => toggle(o.id)}
                      />
                      <span className="flex-1 text-navy-deep">{o.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {o.category.replace("_", " ")}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            You've selected <strong>{selectedIds.length}</strong> organization
            {selectedIds.length === 1 ? "" : "s"}.
          </div>
        </div>
      )}
    </div>
  );
}
