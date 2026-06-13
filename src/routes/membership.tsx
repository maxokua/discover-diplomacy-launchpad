import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Career Membership — $50/mo — Discover Diplomacy" },
      {
        name: "description",
        content:
          "Our most popular service. $50/month, no annual lock-in. Resume tailoring for 5 target jobs, LinkedIn review, industry research, outreach, interview prep, application help, and a Substack with 50 opportunities weekly.",
      },
      { property: "og:title", content: "Career Membership — $50/mo" },
      {
        property: "og:description",
        content:
          "Tailored resume, LinkedIn review, research, outreach, interview prep, applications, and a Substack with 50 opportunities weekly. Direct CEO email access.",
      },
    ],
  }),
  component: MembershipPage,
});

const INCLUDED = [
  "Upload your documents to your profile so we can see everything we're working with",
  "Tell us the 5 jobs you want us to specifically tailor your resume for",
  "Full LinkedIn profile review and rewrite",
  "Industry and company research for your targets",
  "Outreach assistance — direct help to build your network",
  "Interview prep tailored to the roles you're chasing",
  "Help drafting and tailoring each application",
  "Access to our Substack with 50 opportunities weekly from every region of the world",
  "Direct email access to the CEO — ask as many questions as you want",
];

function StartLink({ user, label }: { user: boolean; label: string }) {
  return user ? (
    <Link
      to="/membership/checkout"
      className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
    >
      {label}
    </Link>
  ) : (
    <Link
      to="/auth"
      search={{ next: "/membership/checkout" }}
      className="inline-flex items-center bg-navy-deep px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
    >
      Sign in to start — $50/mo
    </Link>
  );
}

function MembershipPage() {
  const { user } = useAuth();

  return (
    <SiteLayout>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
              <Star className="h-3 w-3" /> Most popular
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl text-navy-deep lg:text-6xl">
              The Career Membership. $50 a month. Month to month.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              We don't do annual plans — we're not in this to lock you in, we're in this to help
              you. Stay as long as it's useful, leave the day it isn't.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <StartLink user={!!user} label="Start membership — $50/mo" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Cancel anytime · No annual contract
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-stone">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="eyebrow">What's included</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Everything you need to actually land the role.
            </h2>
            <p className="mt-5 text-muted-foreground">
              When you create your account we get to work immediately. You upload your documents,
              tell us your five target roles, and we tailor everything around them.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <ul className="space-y-3">
              {INCLUDED.map((i) => (
                <li key={i} className="flex gap-3 text-sm text-navy-deep/90">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
          <Reveal className="lg:col-span-5">
            <div className="eyebrow">Optional add-on</div>
            <h2 className="mt-4 font-display text-3xl text-navy-deep lg:text-4xl">
              Want time with the CEO? Add it for $25.
            </h2>
            <p className="mt-5 text-muted-foreground">
              The $50 membership does <em>not</em> include a call — but you do get the CEO's email
              and can ask as many questions as you'd like. If you want a live 30-minute session,
              book one for an extra $25.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="border border-border bg-stone p-8">
              <div className="font-display text-2xl text-navy-deep">30-min CEO Coaching Call</div>
              <div className="mt-2 text-3xl font-semibold text-navy-deep">$25</div>
              <p className="mt-4 text-sm text-muted-foreground">
                Available exclusively to active members. Book from your dashboard once your
                membership is active.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-deep text-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                Ready when you are
              </div>
              <h2 className="mt-4 font-display text-2xl text-paper lg:text-3xl">
                Join for $50/month. Cancel anytime — no questions, no hoops.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <StartLink user={!!user} label="Start — $50/mo" />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
