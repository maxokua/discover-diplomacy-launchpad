import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Discover Diplomacy" },
      { name: "description", content: "The terms that govern your use of Discover Diplomacy services." },
      { property: "og:title", content: "Terms of Service | Discover Diplomacy" },
      { property: "og:description", content: "The terms that govern your use of Discover Diplomacy services." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="eyebrow">Legal</div>
          <h1 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated June 2026</p>

          <div className="prose prose-sm mt-10 max-w-none space-y-6 text-navy-deep/90">
            <p>
              By creating an account or purchasing a service from Discover Diplomacy LLC ("we," "our," "us"),
              you agree to these terms.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Services</h2>
            <p>
              We offer career advisory services, including a $25 Expert Resume Review and a $50/month
              Career Membership (month-to-month, cancel anytime). Members may add a 30-minute CEO
              coaching call for an additional $25. Service descriptions are good-faith summaries and may
              evolve over time.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Payments and refunds</h2>
            <p>
              Payments are processed by our payment provider. Memberships renew monthly until canceled.
              You may cancel any time from your dashboard or by contacting us; cancellation stops future
              billing and access ends at the close of the current period. Refunds for one-time services
              are considered on a case-by-case basis prior to delivery.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Acceptable use</h2>
            <p>
              You agree not to misuse the service, attempt to access other users' data, or upload
              unlawful content.
            </p>
            <h2 className="font-display text-xl text-navy-deep">No guarantee of outcomes</h2>
            <p>
              Our work supports your candidacy, but employment decisions are made by third parties. We
              make no guarantee of admission, fellowship, interview, or offer.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Liability</h2>
            <p>
              To the maximum extent permitted by law, our aggregate liability is limited to the fees you
              paid to us in the 12 months preceding the claim.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Contact</h2>
            <p>
              Questions:{" "}
              <a className="underline" href="mailto:hello@discoverdiplomacy.com">hello@discoverdiplomacy.com</a>.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
