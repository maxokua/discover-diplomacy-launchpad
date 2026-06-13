import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import directoryData from "@/data/directory.json";

type Entry = {
  category: string;
  name: string;
  location: string;
  interest: string;
  subsection: string;
  url: string;
};

const ALL_ENTRIES = (directoryData as Entry[]).filter((e) => e.category !== "Other");

const CATEGORY_ORDER = [
  "NGO/IGO/Think Tank",
  "Government",
  "Graduate Programs",
  "Undergraduate Programs",
  "Professional Programs",
  "PhD Programs",
  "High School Programs",
];

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Opportunities Directory | Discover Diplomacy" },
      {
        name: "description",
        content:
          "A curated directory of internships, fellowships, and academic programs in international relations, diplomacy, and foreign policy.",
      },
      { property: "og:title", content: "Opportunities Directory | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "Browse internships, fellowships, and academic programs in international affairs.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/directory" },
    ],
    links: [{ rel: "canonical", href: "https://discoverdiplomacy.org/directory" }],
  }),
  component: DirectoryPage,
});

function uniqSorted(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function DirectoryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All program types");
  const [location, setLocation] = useState<string>("All locations");
  const [interest, setInterest] = useState<string>("All regional focuses");
  const [subsection, setSubsection] = useState<string>("All interest areas");

  const locations = useMemo(() => uniqSorted(ALL_ENTRIES.map((e) => e.location)), []);
  const interests = useMemo(() => uniqSorted(ALL_ENTRIES.map((e) => e.interest)), []);
  const subsections = useMemo(() => uniqSorted(ALL_ENTRIES.map((e) => e.subsection)), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ENTRIES.filter((e) => {
      if (category !== "All program types" && e.category !== category) return false;
      if (location !== "All locations" && e.location !== location) return false;
      if (interest !== "All regional focuses" && e.interest !== interest) return false;
      if (subsection !== "All interest areas" && e.subsection !== subsection) return false;
      if (q && !`${e.name} ${e.location} ${e.interest} ${e.subsection}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [query, category, location, interest, subsection]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      if (!map.has(e.category)) map.set(e.category, []);
      map.get(e.category)!.push(e);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [filtered]);

  function reset() {
    setQuery("");
    setCategory("All program types");
    setLocation("All locations");
    setInterest("All focus areas");
    setSubsection("All subject areas");
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="eyebrow">Opportunities Directory</div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl text-navy-deep lg:text-5xl">
            Internships, fellowships, and programs in international affairs.
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            A curated guide for students and early-career professionals. Filter by program type,
            location, geographical focus, or subject area to find your next opportunity.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Listings sourced from publicly available program information. Not affiliated with the
            organizations listed.
          </p>
        </div>
      </section>

      <section className="sticky top-[73px] z-30 border-b border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full border border-border bg-paper px-4 py-2.5 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep"
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Select value={category} onChange={setCategory} options={["All program types", ...CATEGORY_ORDER]} className="w-full" />
            <Select value={location} onChange={setLocation} options={["All locations", ...locations]} className="w-full" />
            <Select value={interest} onChange={setInterest} options={["All focus areas", ...interests]} className="w-full" />
            <Select value={subsection} onChange={setSubsection} options={["All subject areas", ...subsections]} className="w-full" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing <span className="font-medium text-navy-deep">{filtered.length}</span> of{" "}
              {ALL_ENTRIES.length} opportunities
            </div>
            <button onClick={reset} className="underline hover:text-navy-deep">
              Reset filters
            </button>
          </div>
        </div>
      </section>

      <section className="bg-stone">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          {grouped.length === 0 ? (
            <div className="border border-border bg-paper p-12 text-center text-sm text-muted-foreground">
              No opportunities match your filters.
            </div>
          ) : (
            grouped.map(([cat, items]) => (
              <div key={cat} className="mb-14 last:mb-0">
                <div className="mb-5 flex items-baseline justify-between border-b border-border pb-3">
                  <h2 className="font-display text-2xl text-navy-deep lg:text-3xl">{cat}</h2>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {items.length} {items.length === 1 ? "listing" : "listings"}
                  </span>
                </div>
                <ul className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
                  {items.map((e) => (
                    <li key={e.url} className="bg-paper">
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full flex-col p-6 transition-colors hover:bg-stone"
                      >
                        <div className="font-display text-base text-navy-deep">{e.name}</div>
                        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                          {e.location && (
                            <div>
                              <span className="font-medium uppercase tracking-wider text-emerald">
                                Location ·{" "}
                              </span>
                              {e.location}
                            </div>
                          )}
                          {e.interest && (
                            <div>
                              <span className="font-medium uppercase tracking-wider text-emerald">
                                Focus ·{" "}
                              </span>
                              {e.interest.replace(/^Interest Area - /, "")}
                            </div>
                          )}
                          {e.subsection && (
                            <div>
                              <span className="font-medium uppercase tracking-wider text-emerald">
                                Area ·{" "}
                              </span>
                              {e.subsection}
                            </div>
                          )}
                        </div>
                        <div className="mt-auto pt-4 text-xs font-medium uppercase tracking-wider text-navy-deep">
                          More info →
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        "border border-border bg-paper px-3 py-2.5 text-sm text-navy-deep focus:outline-none focus:ring-1 focus:ring-navy-deep " +
        (className ?? "")
      }
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.length > 40 ? o.slice(0, 38) + "…" : o}
        </option>
      ))}
    </select>
  );
}
