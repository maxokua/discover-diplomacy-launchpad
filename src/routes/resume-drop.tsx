import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { ArrowRight, Sparkles, Users, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/resume-drop")({
  head: () => ({
    meta: [
      { title: "Resume Drop | Discover Diplomacy" },
      {
        name: "description",
        content:
          "Add your resume and profile to the Discover Diplomacy candidate pool. Two piles: free for everyone, member-only for Compass and Envoy.",
      },
      { property: "og:title", content: "Resume Drop | Discover Diplomacy" },
      { property: "og:url", content: "https://discoverdiplomacy.org/resume-drop" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/resume-drop" },
    ],
  }),
  component: ResumeDropPage,
});

function ResumeDropPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
          <Reveal>
            <div className="eyebrow">Resume Drop</div>
            <h1 className="mt-4 font-display text-4xl text-navy-deep lg:text-6xl">
              Get your resume in front of verified employers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Add your profile and resume to our candidate pool. Employers browse
              skills and background through the platform and spend credits to
              unlock the resume and contact details — only with your consent.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Pile
              tag="Open Pile"
              title="Free for everyone"
              who="Anyone with a free account."
              perks={[
                "Build a profile so employers can find you by skills, regions, and sectors.",
                "Upload one resume version.",
                "Shown to employers under the Open Pile.",
              ]}
            />
            <Pile
              tag="Member Pile"
              title="For Compass & Envoy members"
              who="Compass ($20/mo) and Envoy ($150/mo) members."
              perks={[
                "Surface above the Open Pile in employer searches.",
                "Multiple resume versions tailored to different roles.",
                "Get notified when an employer unlocks your resume.",
              ]}
              accent
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-sm bg-navy-deep px-5 py-3 text-sm font-medium uppercase tracking-wider text-paper hover:bg-navy"
            >
              Build my profile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-sm border border-navy-deep px-5 py-3 text-sm font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
            >
              See membership tiers
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-stone/40">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-3 lg:px-10">
          <Fact icon={<Sparkles className="h-5 w-5" />} title="Two piles, one search">
            Employers can browse either pile. Member resumes surface first.
          </Fact>
          <Fact icon={<ShieldCheck className="h-5 w-5" />} title="Consent-gated">
            Your resume and contact details are unlocked only when an employer
            spends a credit and you've opted in.
          </Fact>
          <Fact icon={<Users className="h-5 w-5" />} title="Verified employers">
            Every employer is individually vetted before they can browse.
          </Fact>
        </div>
      </section>
    </SiteLayout>
  );
}

function Pile({
  tag,
  title,
  who,
  perks,
  accent,
}: {
  tag: string;
  title: string;
  who: string;
  perks: string[];
  accent?: boolean;
}) {
  return (
    <div
      className={
        "border p-6 " +
        (accent
          ? "border-gilt bg-navy-deep text-paper"
          : "border-border bg-paper text-navy-deep")
      }
    >
      <div
        className={
          "text-[11px] font-semibold uppercase tracking-[0.18em] " +
          (accent ? "text-gilt" : "text-muted-foreground")
        }
      >
        {tag}
      </div>
      <div className="mt-2 font-display text-2xl">{title}</div>
      <div className={"mt-1 text-sm " + (accent ? "text-paper/70" : "text-muted-foreground")}>
        {who}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {perks.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden>•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Fact({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-navy-deep">
        {icon}
        <div className="font-display text-lg">{title}</div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
