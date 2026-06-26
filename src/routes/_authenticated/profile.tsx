import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { getMyCandidateProfile, upsertCandidateProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Your Profile | Discover Diplomacy" }],
  }),
  component: ProfilePage,
});

type Lang = { lang: string; level: "Basic" | "Conversational" | "Professional" | "Native" };
type Edu = { school: string; degree: string; year: string };

const SKILL_OPTIONS = [
  "Policy analysis", "Diplomatic writing", "Public speaking", "Negotiation",
  "Research", "Project management", "Stakeholder engagement", "Program design",
  "Monitoring & evaluation", "Grant writing", "Data analysis", "GIS",
  "Quantitative methods", "Qualitative methods", "Translation", "Editing",
  "Crisis communications", "Speechwriting", "Strategic planning", "Fundraising",
];
const REGION_OPTIONS = [
  "North America", "Latin America & Caribbean", "Europe", "Eurasia & Russia",
  "MENA", "Sub-Saharan Africa", "South Asia", "East Asia", "Southeast Asia",
  "Pacific", "Global",
];
const SECTOR_OPTIONS = [
  "Diplomacy / Foreign service", "Multilateral / UN system", "Development / Aid",
  "Humanitarian", "Security & defense", "Human rights", "Trade & economics",
  "Climate & environment", "Global health", "Education", "Tech policy",
  "Think tank / Research", "Private sector — international",
];
const ROLE_OPTIONS = [
  "Foreign Service Officer", "Policy analyst", "Program officer", "Research analyst",
  "Country desk officer", "Consultant", "Communications specialist", "Field officer",
  "Intelligence analyst", "Trade specialist",
];

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [languages, setLanguages] = useState<Lang[]>([]);
  const [education, setEducation] = useState<Edu[]>([]);
  const [visibility, setVisibility] = useState<"public" | "hidden">("public");

  useEffect(() => {
    (async () => {
      const r = await getMyCandidateProfile();
      if ("profile" in r && r.profile) {
        const p = r.profile;
        setHeadline(p.headline ?? "");
        setBio(p.bio ?? "");
        setTargetRoles(p.target_roles ?? []);
        setSkills(p.skills ?? []);
        setRegions(p.regions ?? []);
        setSectors(p.sectors ?? []);
        setExperience(p.experience_level ?? "");
        setLanguages(Array.isArray(p.languages) ? (p.languages as Lang[]) : []);
        setEducation(Array.isArray(p.education) ? (p.education as Edu[]) : []);
        setVisibility((p.visibility as "public" | "hidden") ?? "public");
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const r = await upsertCandidateProfile({
      data: {
        headline,
        bio,
        target_roles: targetRoles,
        skills,
        regions,
        sectors,
        experience_level: (experience || null) as never,
        languages,
        education,
        visibility,
      },
    });
    setSaving(false);
    if ("error" in r) toast.error(r.error);
    else toast.success("Profile saved");
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">Loading…</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
          <div className="eyebrow">Your Profile</div>
          <h1 className="mt-3 font-display text-3xl text-navy-deep lg:text-5xl">
            Build your candidate profile
          </h1>
          <p className="mt-4 text-muted-foreground">
            Verified employers see this profile. They never see your resume or
            contact info unless you've opted into Resume Drop and they spend a
            credit to unlock it.
          </p>
        </div>
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto max-w-3xl space-y-8 px-6 py-12 lg:px-10">
          <Card>
            <Label>Headline</Label>
            <input
              className="input"
              placeholder="e.g. Foreign policy analyst focused on West Africa & climate"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={180}
            />
            <Label className="mt-5">Short bio</Label>
            <textarea
              className="input min-h-[120px]"
              placeholder="2–4 sentences on what you do, regions you focus on, and what you're looking for."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
            />
            <Label className="mt-5">Experience level</Label>
            <select
              className="input"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">—</option>
              {["Student", "Entry", "Early career", "Mid-career", "Senior"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <Label className="mt-5">Profile visibility</Label>
            <select
              className="input"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "public" | "hidden")}
            >
              <option value="public">Public — verified employers can find me</option>
              <option value="hidden">Hidden — employers cannot see my profile</option>
            </select>
          </Card>

          <Card title="Target roles">
            <ChipPicker
              options={ROLE_OPTIONS}
              values={targetRoles}
              onChange={setTargetRoles}
              allowCustom
              placeholder="Add a target role"
            />
          </Card>

          <Card title="Skills">
            <ChipPicker
              options={SKILL_OPTIONS}
              values={skills}
              onChange={setSkills}
              allowCustom
              placeholder="Add a skill"
            />
          </Card>

          <Card title="Regional focus">
            <ChipPicker options={REGION_OPTIONS} values={regions} onChange={setRegions} />
          </Card>

          <Card title="Sectors">
            <ChipPicker options={SECTOR_OPTIONS} values={sectors} onChange={setSectors} />
          </Card>

          <Card title="Languages">
            {languages.map((l, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Language"
                  value={l.lang}
                  onChange={(e) => {
                    const n = [...languages];
                    n[i] = { ...n[i], lang: e.target.value };
                    setLanguages(n);
                  }}
                />
                <select
                  className="input w-44"
                  value={l.level}
                  onChange={(e) => {
                    const n = [...languages];
                    n[i] = { ...n[i], level: e.target.value as Lang["level"] };
                    setLanguages(n);
                  }}
                >
                  {(["Basic", "Conversational", "Professional", "Native"] as const).map((lv) => (
                    <option key={lv} value={lv}>{lv}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-3 text-sm text-muted-foreground hover:text-navy-deep"
                  onClick={() => setLanguages(languages.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 text-sm text-navy-deep underline"
              onClick={() =>
                setLanguages([...languages, { lang: "", level: "Conversational" }])
              }
            >
              + Add language
            </button>
          </Card>

          <Card title="Education">
            {education.map((ed, i) => (
              <div key={i} className="mb-3 grid gap-2 sm:grid-cols-3">
                <input
                  className="input"
                  placeholder="School"
                  value={ed.school}
                  onChange={(e) => {
                    const n = [...education];
                    n[i] = { ...n[i], school: e.target.value };
                    setEducation(n);
                  }}
                />
                <input
                  className="input"
                  placeholder="Degree / field"
                  value={ed.degree}
                  onChange={(e) => {
                    const n = [...education];
                    n[i] = { ...n[i], degree: e.target.value };
                    setEducation(n);
                  }}
                />
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Year"
                    value={ed.year}
                    onChange={(e) => {
                      const n = [...education];
                      n[i] = { ...n[i], year: e.target.value };
                      setEducation(n);
                    }}
                  />
                  <button
                    type="button"
                    className="px-2 text-sm text-muted-foreground hover:text-navy-deep"
                    onClick={() => setEducation(education.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 text-sm text-navy-deep underline"
              onClick={() =>
                setEducation([...education, { school: "", degree: "", year: "" }])
              }
            >
              + Add education
            </button>
          </Card>

          <div className="sticky bottom-4 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-sm bg-navy-deep px-6 py-3 text-sm font-medium uppercase tracking-wider text-paper hover:bg-navy disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid hsl(var(--border));
          background: white;
          padding: 0.6rem 0.75rem;
          font-size: 0.9rem;
          color: hsl(var(--foreground));
          border-radius: 2px;
        }
        .input:focus { outline: 2px solid hsl(var(--ring)); outline-offset: -2px; }
      `}</style>
    </SiteLayout>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-paper p-6">
      {title && (
        <div className="mb-4 font-display text-lg text-navy-deep">{title}</div>
      )}
      {children}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}

function ChipPicker({
  options,
  values,
  onChange,
  allowCustom,
  placeholder,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
}) {
  const [custom, setCustom] = useState("");
  function toggle(v: string) {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  }
  function addCustom() {
    const v = custom.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setCustom("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button
              type="button"
              key={o}
              onClick={() => toggle(o)}
              className={
                "rounded-full border px-3 py-1 text-xs " +
                (on
                  ? "border-navy-deep bg-navy-deep text-paper"
                  : "border-border bg-paper text-navy-deep hover:bg-stone")
              }
            >
              {o}
            </button>
          );
        })}
        {values
          .filter((v) => !options.includes(v))
          .map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => toggle(v)}
              className="rounded-full border border-gilt bg-gilt/10 px-3 py-1 text-xs text-navy-deep"
            >
              {v} ×
            </button>
          ))}
      </div>
      {allowCustom && (
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder={placeholder ?? "Add custom"}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustom}
            className="rounded-sm border border-navy-deep px-3 py-1 text-sm text-navy-deep hover:bg-stone"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
