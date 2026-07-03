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

          {/* AI + Employer opt-in summary callouts */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="border-l-4 border-emerald bg-emerald/5 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">
                AI is part of this product
              </div>
              <p className="mt-2 text-sm text-navy-deep/90">
                Discover Diplomacy uses artificial intelligence to power resume analysis, the
                career assessment, drafting help, search, and matching. When you upload a
                resume, take the assessment, or submit a form, your content is processed by
                AI systems we operate or contract with. We do not sell your materials, and we
                contractually require our AI vendors not to use your content to train their
                public models.
              </p>
            </div>
            <div className="border-l-4 border-navy-deep bg-navy-deep/5 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-deep">
                Employers see you only if you opt in
              </div>
              <p className="mt-2 text-sm text-navy-deep/90">
                Your resume and profile are never visible to employers, recruiters, or hiring
                partners by default. We share your materials with employers only after you
                explicitly opt in inside your account settings, and you can opt out at any
                time. Shares already delivered cannot be recalled from the recipient.
              </p>
            </div>
          </div>

          <div className="prose prose-sm mt-10 max-w-none space-y-6 text-navy-deep/90">
            <p>
              This policy explains what Discover Diplomacy LLC ("we," "our," "us") collects, how
              we use it, the AI systems we rely on, and the consents you choose when you create
              an account or buy a service. By creating an account or using any part of the
              site, you agree to everything below.
            </p>

            <h2 className="font-display text-xl text-navy-deep">No guarantee of employment</h2>
            <p>
              We are a career platform and coaching practice. We do our best to help you land
              interviews and offers, but we cannot and do not guarantee a job, internship,
              fellowship, placement, interview, introduction, or any specific outcome. Hiring
              decisions belong to employers. Discover Diplomacy is not liable for any hiring
              outcome, lost opportunity, lost wages, or other damages tied to your job search,
              your application materials, or the advice you receive from us or any coach
              working with us.
            </p>

            <h2 className="font-display text-xl text-navy-deep">
              Our use of artificial intelligence
            </h2>
            <p>
              AI is integrated throughout the product. Specifically, we use AI to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Parse and analyze resumes you upload (extract text, score ATS-readiness,
                identify keyword gaps, suggest rewording).
              </li>
              <li>
                Generate your personalized output from the Career Assessment, including paths,
                a 90-day plan, and a recommended membership tier.
              </li>
              <li>
                Draft, edit, summarize, anonymize, and improve application materials when you
                ask us to.
              </li>
              <li>
                Match opportunities, coaches, and employers to your profile.
              </li>
              <li>
                Operate spam, fraud, and abuse prevention.
              </li>
            </ul>
            <p>
              Your content may be processed by third-party AI providers (such as model
              providers and inference gateways) under contracts that prohibit them from using
              your content to train their public models. AI output is generated by software and
              can be inaccurate, incomplete, or biased — review and verify before relying on
              it. You can request that we delete AI-generated artifacts tied to your account by
              emailing us. If you do not want your content processed by AI, do not upload
              materials or use AI features; most of the product depends on them.
            </p>

            <h2 className="font-display text-xl text-navy-deep">
              Employer visibility is opt-in
            </h2>
            <p>
              Employers, recruiters, fellowship programs, and hiring partners <strong>cannot
              see your resume or profile unless you opt in</strong>. The opt-in lives in your
              account settings and is off by default. When it is on:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Vetted employers in our network can be shown your profile and resume for the
                purpose of recruiting.
              </li>
              <li>
                You can turn the toggle off at any time, which prevents future sharing.
                Materials already shared with a specific employer cannot be recalled from
                them.
              </li>
              <li>
                We never sell your personal information, and we never share contact details
                with employers without your consent.
              </li>
            </ul>

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
                application materials, including with AI assistance, as we judge best for
                your candidacy. Final accuracy of any submitted version is your responsibility.
              </li>
              <li>
                Process your content with AI systems as described in the "Our use of artificial
                intelligence" section above.
              </li>
              <li>
                Contact you by email about your account, your services, and opportunities we
                think are relevant. You can unsubscribe from non-essential email at any time.
              </li>
            </ul>
            <p>
              You do <strong>not</strong> agree, by signing up alone, to: (a) have your
              materials shared with employers — that requires a separate opt-in; or (b) be
              featured publicly. Both are explicit, granular choices inside your account.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Information we collect</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Account information you give us: name, email, password, profile details.</li>
              <li>
                Documents and content you upload: resumes, cover letters, links, notes, target
                roles, assessment responses.
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
              power AI features, to connect you with employers and coaches (subject to the
              opt-ins above), to process payments, to respond to inquiries, to send
              service-related and relevant opportunity emails, to detect fraud and abuse, to
              comply with the law, and to operate and improve the platform.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Sharing</h2>
            <p>
              We do not sell your personal information. We share data with: (a) vendors that
              run the service for us, including payment processing, email delivery, cloud
              hosting, analytics, and AI providers; (b) coaches working with our practice
              when you book or are matched with them; (c) employers and recruiters
              <strong> only when you have opted in</strong>; (d) authorities when required by
              law, court order, or to protect rights, property, or safety.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Subscriptions and billing</h2>
            <p>
              Memberships are offered on a monthly or annual cadence. Annual plans are billed
              once for twelve months at roughly a 20% discount versus paying monthly. Annual
              plans renew once per year on the anniversary of purchase; monthly plans renew
              every month. You can cancel future renewals at any time from your account.
              Promotional codes and pricing accommodations are offered at our discretion.
              Refund eligibility, if any, is described at the point of sale or in the service
              confirmation; annual plans are generally non-refundable after the first 7 days.
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

            <h2 className="font-display text-xl text-navy-deep">Your choices</h2>
            <p>
              You may request access to, correction of, or deletion of your data — including
              AI-generated artifacts and uploaded documents — by emailing{" "}
              <a className="underline" href="mailto:hello@discoverdiplomacy.org">
                hello@discoverdiplomacy.org
              </a>
              . You may toggle employer visibility on or off at any time. You may unsubscribe
              from marketing emails at any time. Some records, such as payment receipts, must
              be retained for legal and accounting purposes.
            </p>

            <h2 className="font-display text-xl text-navy-deep">Security</h2>
            <p>
              We use reasonable administrative and technical safeguards to protect your
              information, including row-level access controls on our database so that, by
              default, only you can read your own documents and analyses. No system is
              perfectly secure, and we cannot guarantee absolute security. Use a strong,
              unique password and keep your login credentials private.
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

            <h2 className="font-display text-xl text-navy-deep">Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, Discover Diplomacy and its coaches,
              contractors, and partners are not liable for any indirect, incidental, special,
              consequential, or punitive damages, including lost employment, lost wages, lost
              opportunities, lost data, or reputational harm, arising from your use of the
              service or from AI-generated output. Our total liability to you for any claim
              related to the service will not exceed the amount you paid us in the twelve
              months before the claim arose.
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

