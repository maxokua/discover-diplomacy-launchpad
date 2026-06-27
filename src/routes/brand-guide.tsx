import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { BRAND, PILLARS, PRICING, TRACTION, TRUST_WALL } from "@/lib/brand";

export const Route = createFileRoute("/brand-guide")({
  head: () => ({
    meta: [
      { title: "Brand & Voice Guide | Discover Diplomacy" },
      { name: "description", content: "Internal brand, voice, and visual guide for Discover Diplomacy. Living reference for all copy, design, and product surfaces." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BrandGuide,
});

const COLORS: Array<{ name: string; token: string; hex: string; role: string; on?: "dark" | "light" }> = [
  { name: "Navy",      token: "--navy-deep",  hex: "#0E1E36", role: "Primary dark grounds, primary button", on: "dark" },
  { name: "Ink",       token: "--ink",        hex: "#15233D", role: "Headings",                              on: "dark" },
  { name: "Gilt Gold", token: "--gilt",       hex: "#C8A24A", role: "Single accent — emphasis & CTA accents", on: "dark" },
  { name: "Azure",     token: "--azure",      hex: "#2E6FB0", role: "Secondary, links",                      on: "dark" },
  { name: "Paper",     token: "--paper",      hex: "#FAFBFD", role: "Light backgrounds",                     on: "light" },
  { name: "Slate",     token: "--slate",      hex: "#1F2838", role: "Body text",                             on: "dark" },
  { name: "Muted",     token: "--muted-ink",  hex: "#5C6675", role: "Secondary text",                        on: "dark" },
  { name: "Hairline",  token: "--hairline",   hex: "#DBE1EA", role: "Dividers",                              on: "light" },
];

const DO = [
  "expert-designed", "instant", "vetted", "insider",
  "the offer in hand", "built for this field", "no network required",
  "Foreign Service", "multilaterals", "fellowships",
];
const DONT = [
  "AI-powered (as a gimmick)", "revolutionary", "game-changing",
  "unlock your potential", "synergy", "leverage", "empower",
  "fake scarcity", "implying a referral can be purchased",
  
];

export default function BrandGuide() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="eyebrow">Internal · Brand & Voice</div>
            <h1 className="mt-5 font-display text-4xl text-navy-deep lg:text-6xl">
              {BRAND.name} — Brand Guide
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Living reference for every page, post, email, and screen. Mirrors{" "}
              <code className="rounded bg-stone px-1.5 py-0.5 text-xs">BRAND.md</code>{" "}
              at the project root. If copy or design contradicts what's here, the page is wrong — not this file.
            </p>
          </Reveal>
        </div>
      </section>

      <Section title="01 · Positioning" eyebrow="What we are">
        <P><strong className="text-navy-deep">Category:</strong> Talent infrastructure layer for internationally-focused careers.</P>
        <P><strong className="text-navy-deep">One-liner:</strong> {BRAND.oneLiner}</P>
        <P>{BRAND.positioning}</P>
      </Section>

      <Section title="02 · The Three Pillars" eyebrow="Organize everything around these">
        <ul className="mt-6 grid gap-px border border-border bg-border md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <li key={p.key} className="bg-paper p-6">
              <div className="font-display text-2xl text-gilt">0{i + 1}</div>
              <div className="mt-2 font-display text-xl text-navy-deep">{p.label}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.line}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="03 · The Trust Wall" eyebrow="Sacred principle">
        <div className="mt-2 border-l-2 border-gilt bg-stone p-6 font-display text-xl text-navy-deep">
          {TRUST_WALL}
        </div>
        <P>
          Never write copy implying a referral or vouch can be purchased. We sell preparation
          and access to a venue; the candidate earns the rest.
        </P>
      </Section>

      <Section title="04 · Voice" eyebrow="How we sound">
        <P>
          <strong className="text-navy-deep">Authoritative, warm, precise, insider-but-accessible.</strong>{" "}
          A brilliant mentor who's walked the halls of power and explains things plainly.
          Confident, never arrogant. Encouraging, never fluffy.
        </P>
        <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-paper p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">Do say</div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {DO.map((w) => (
                <li key={w} className="rounded-sm border border-border bg-stone px-2.5 py-1 text-xs text-navy-deep">{w}</li>
              ))}
            </ul>
          </div>
          <div className="bg-paper p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-destructive">Don't say</div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {DONT.map((w) => (
                <li key={w} className="rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground line-through">{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 overflow-hidden border border-border">
          <table className="w-full text-sm">
            <thead className="bg-stone text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Weak</th><th className="p-3">Strong</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              <Row a="We empower you to unlock your global career potential." b="We help you figure out what you want in this field — and get the offer." />
              <Row a="Our AI reviews your resume." b="Get your resume rebuilt for the role in minutes, using the same playbook insiders use." />
              <Row a="One generic call with a founder." b="Book a vetted coach who's worked in the field you're targeting." />
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="05 · Color" eyebrow="Visual system">
        <p className="mt-2 text-sm text-muted-foreground">
          One strong gold accent per view, maximum. Use Navy for grounds and primary buttons. Azure for inline links.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COLORS.map((c) => (
            <li key={c.token} className="overflow-hidden border border-border">
              <div
                className="flex h-24 items-end p-3 font-mono text-xs"
                style={{ background: c.hex, color: c.on === "dark" ? "#FAFBFD" : "#15233D" }}
              >
                {c.hex}
              </div>
              <div className="bg-paper p-3">
                <div className="font-display text-base text-navy-deep">{c.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{c.token}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.role}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="06 · Typography" eyebrow="Type system">
        <div className="mt-2 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-paper p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Display · Fraunces</div>
            <div className="mt-3 font-display text-4xl text-navy-deep">The offer in hand.</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">var(--font-display)</div>
          </div>
          <div className="bg-paper p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Body & UI · Inter</div>
            <div className="mt-3 text-base text-slate">
              Plain and direct. Short sentences. Specific over generic. Built for international careers — not a generic job board.
            </div>
            <div className="mt-2 font-mono text-xs text-muted-foreground">var(--font-sans)</div>
          </div>
        </div>
      </Section>

      <Section title="07 · Pricing — single source of truth" eyebrow="Use src/lib/brand.ts">
        <p className="mt-2 text-sm text-muted-foreground">
          Never hardcode prices on individual pages. Import from <code className="rounded bg-stone px-1.5 py-0.5 text-xs">src/lib/brand.ts</code>.
        </p>
        <ul className="mt-6 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {Object.values(PRICING).map((p) => (
            <li key={p.name} className="bg-paper p-6">
              <div className="font-display text-2xl text-navy-deep">{p.name}</div>
              <div className="mt-2 font-display text-3xl text-gilt">
                {p.priceLabel}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{p.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.tagline}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="08 · Traction (use, don't inflate)" eyebrow="Real numbers only">
        <ul className="mt-6 grid gap-px border border-border bg-border md:grid-cols-3">
          <Stat v={TRACTION.peopleReached} l="People reached" />
          <Stat v={TRACTION.directoryViews} l="Directory views" />
          <Stat v={TRACTION.weeklyOpportunities} l="Curated weekly" />
        </ul>
        <P>
          Never invent testimonials, fake numbers, or fake credentials. Where social proof
          is needed but unavailable, mark the slot clearly as a placeholder.
        </P>
      </Section>

      <Section title="09 · Required CTAs" eyebrow="Surface on every major page">
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li>1. <strong className="text-navy-deep">Take the free assessment</strong> → <code className="rounded bg-stone px-1.5 py-0.5 text-xs">/assessment</code></li>
          <li>2. <strong className="text-navy-deep">Get the weekly digest</strong> → <code className="rounded bg-stone px-1.5 py-0.5 text-xs">/waitlist</code></li>
        </ul>
      </Section>
    </SiteLayout>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <Reveal>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">{title}</h2>
        </Reveal>
        <Reveal delay={80}>{children}</Reveal>
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">{children}</p>;
}

function Row({ a, b }: { a: string; b: string }) {
  return (
    <tr>
      <td className="p-3 align-top text-muted-foreground line-through">{a}</td>
      <td className="p-3 align-top text-navy-deep">{b}</td>
    </tr>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <li className="bg-paper p-6">
      <div className="font-display text-3xl text-navy-deep">{v}</div>
      <div className="mt-2 text-sm text-muted-foreground">{l}</div>
    </li>
  );
}
