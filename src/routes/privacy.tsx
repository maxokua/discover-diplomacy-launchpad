import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Discover Diplomacy" },
      { name: "description", content: "How Discover Diplomacy collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Discover Diplomacy" },
      { property: "og:description", content: "How Discover Diplomacy collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="eyebrow">Legal</div>
          <h1 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated June 2026</p>

          <div className="prose prose-sm mt-10 max-w-none space-y-6 text-navy-deep/90">
            <p>
              Discover Diplomacy LLC ("we," "our," "us") respects your privacy. This policy explains what
              we collect, why, and the choices you have.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Information we collect</h2>
            <p>
              Account information you provide (name, email, password), documents you upload (resumes,
              cover letters, LinkedIn exports), inquiries and applications you submit, and payment
              information processed by our payment provider (we do not store card numbers).
            </p>
            <h2 className="font-display text-xl text-navy-deep">How we use it</h2>
            <p>
              To deliver the services you've purchased, respond to inquiries, process payments, send
              service-related emails, and operate and improve the platform.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Sharing</h2>
            <p>
              We do not sell your information. We share data with vendors who help us run the service
              (payment processor, email delivery, cloud hosting), and only as required by law. Employer
              access to candidate resumes is opt-in by the candidate and routed through us.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Your choices</h2>
            <p>
              You may request access, correction, or deletion of your data by emailing{" "}
              <a className="underline" href="mailto:hello@discoverdiplomacy.com">hello@discoverdiplomacy.com</a>.
              You may unsubscribe from marketing emails at any time.
            </p>
            <h2 className="font-display text-xl text-navy-deep">Contact</h2>
            <p>
              Questions about privacy:{" "}
              <a className="underline" href="mailto:hello@discoverdiplomacy.com">hello@discoverdiplomacy.com</a>.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
