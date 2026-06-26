import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Discover Diplomacy" },
      {
        name: "description",
        content:
          "How Discover Diplomacy collects, uses, and protects your information, and the consent you give when you create an account.",
      },
      { property: "og:title", content: "Privacy Policy | Discover Diplomacy" },
      {
        property: "og:description",
        content:
          "How Discover Diplomacy collects, uses, and protects your information.",
      },
      { property: "og:url", content: "https://discoverdiplomacy.org/privacy" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/privacy" },
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
          <h1 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated June 2026</p>

          <div className="prose prose-sm mt-10 max-w-none space-y-6 text-navy-deep/90">
            <p>
              This policy explains what Discover Diplomacy LLC ("we," "our," "us") collects, how
              we use it, and the consent you give us when you create an account or buy a
              service. Please read it carefully. By creating an account or using any part of the
              site, you agree to everything below.
            </p>

            <h2 className="font-display text-xl text-navy-deep">No guarantee of employment</h2>
            <p>
              We are a career coaching and resume practice. We do our best to help you land
              interviews and offers, but we cannot and do not guarantee a job, an internship, a
              fellowship, a placement, an interview, an introduction, or any specific outcome.
              Hiring decisions belong to employers. Discover Diplomacy is not liable for any
              hiring outcome, lost opportunity, lost wages, or other damages tied to your job
              search, your application materials, or the advice you receive from us or any
              coach working with us.
            </p>

            <h2 className="font-display text-xl text-navy-deep">
              What you agree to when you sign up
            </h2>
            <p>By creating an account or uploading materials, you give us permission to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Store, organize, and review the resumes, cover letters, LinkedIn exports,
                writing samples, and notes you upload.
              </li>
              <li>
                Edit, rewrite, restructure, reformat, and otherwise revise your resume and
                application materials as we judge best for your candidacy. Final accuracy of
                any submitted version is your responsibility.
              </li>
              <li>
                Use artificial intelligence and machine learning tools to help review, draft,
                edit, anonymize, summarize, or improve your materials. Your content may be
                processed by third-party AI providers we contract with. We do not sell your
                materials to AI vendors for model training.
              </li>
              <li>
                Share your resume and basic profile information with employers, recruiters,
                fellowship programs, hiring partners, and other coaches in our network for the
                purpose of helping you find work. You may opt out of employer sharing at any
                time by emailing us; sharing already made cannot be recalled.
              </li>
              <li>
                Contact you by email about your account, your services, and opportunities we
                think are relevant.
              </li>
            </ul>

            <h2 className="font-display text-xl text-navy-deep">Information we collect</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Account information you give us: name, email, password, profile details.
              </li>
              <li>
                Documents and content you upload: resumes, cover letters, links, notes, target
                roles.
              </li>
              <li>
                Inquiry and application data: messages, forms, coach applications, employer
                requests.
              </li>
              <li>
                Payment information: handled by our payment processor. We do not store full
                card numbers on our servers.
              </li>
              <li>
                Basic usage data: log records, device information, and cookies needed to keep
                you signed in and to operate the site.
              </li>
            </ul>

            <h2 className="font-display text-xl text-navy-deep">How we use your information</h2>
            <p>
              To provide the services you bought, to coach and review your materials, to
              connect you with employers and coaches in our network, to process payments, to
              respond to inquiries, to send service-related and relevant opportunity emails,
              to detect fraud and abuse, to comply with the law, and to operate and improve
              the platform.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Sharing</h2>
            <p>
              We do not sell your personal information. We share data with: (a) vendors that
              run the service for us, including payment processing, email delivery, cloud
              hosting, analytics, and AI providers; (b) coaches working with our practice;
              (c) employers and recruiters you've consented to be visible to; (d) authorities
              when required by law, court order, or to protect rights, property, or safety.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Coaching disclaimers</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Coaching is advisory only. We do not provide legal, immigration, financial,
                medical, or psychological advice.
              </li>
              <li>
                Information we share about specific employers, programs, salary ranges,
                timelines, and selection rates reflects our best understanding and may be
                wrong or out of date.
              </li>
              <li>
                Our coaches are independent professionals. They are not your agents, brokers,
                or attorneys.
              </li>
              <li>
                You are responsible for verifying every fact in your final application
                materials, every claim you make to employers, and your compliance with the
                rules of any program you apply to.
              </li>
            </ul>

            <h2 className="font-display text-xl text-navy-deep">Payments and refunds</h2>
            <p>
              Memberships and resume reviews are paid in advance through our payment
              processor. Promotional codes and pricing accommodations are offered at our
              discretion and may be limited in number or time. Refund eligibility, if any, is
              described at the point of sale or in the service confirmation.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Your choices</h2>
            <p>
              You may request access to, correction of, or deletion of your data by emailing{" "}
              <a className="underline" href="mailto:hello@discoverdiplomacy.org">
                hello@discoverdiplomacy.org
              </a>
              . You may unsubscribe from marketing emails at any time. Some records, such as
              payment receipts, must be retained for legal and accounting purposes.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Security</h2>
            <p>
              We use reasonable administrative and technical safeguards to protect your
              information. No system is perfectly secure, and we cannot guarantee absolute
              security. Use a strong, unique password and keep your login credentials private.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Children</h2>
            <p>
              The service is not intended for individuals under 16. We do not knowingly
              collect personal information from children. If you believe a child has provided
              us information, contact us and we will remove it.
            </p>

            <h2 className="font-display text-xl text-navy-deep">International users</h2>
            <p>
              Discover Diplomacy is based in the United States. If you use the service from
              outside the U.S., you consent to your information being processed in the U.S.
              and other jurisdictions where our vendors operate.
            </p>

            <h2 className="font-display text-xl text-navy-deep">
              Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, Discover Diplomacy and its coaches,
              contractors, and partners are not liable for any indirect, incidental, special,
              consequential, or punitive damages, including lost employment, lost wages, lost
              opportunities, lost data, or reputational harm, arising from your use of the
              service. Our total liability to you for any claim related to the service will
              not exceed the amount you paid us in the twelve months before the claim arose.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Changes to this policy</h2>
            <p>
              We may update this policy. Continued use of the service after an update means
              you accept the updated policy. Material changes will be noted at the top of
              this page.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Contact</h2>
            <p>
              Questions, requests, or concerns:{" "}
              <a className="underline" href="mailto:hello@discoverdiplomacy.org">
                hello@discoverdiplomacy.org
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
