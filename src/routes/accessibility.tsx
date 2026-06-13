import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility | Discover Diplomacy" },
      { name: "description", content: "Our commitment to making Discover Diplomacy usable by everyone." },
      { property: "og:title", content: "Accessibility | Discover Diplomacy" },
      { property: "og:description", content: "Our commitment to making Discover Diplomacy usable by everyone." },
      { property: "og:url", content: "https://discoverdiplomacy.org/accessibility" },
    ],
    links: [
      { rel: "canonical", href: "https://discoverdiplomacy.org/accessibility" },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <SiteLayout>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="eyebrow">Accessibility</div>
          <h1 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">Accessibility Statement</h1>

          <div className="prose prose-sm mt-10 max-w-none space-y-6 text-navy-deep/90">
            <p>
              Discover Diplomacy is committed to making our website and services usable by everyone,
              including people who rely on assistive technologies. We aim to meet WCAG 2.1 AA standards
              and continually test and improve the experience.
            </p>
            <h2 className="font-display text-xl text-navy-deep">What we do</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Semantic HTML and keyboard-navigable interactive elements</li>
              <li>Sufficient color contrast and clear focus indicators</li>
              <li>Descriptive labels on form fields and icon-only buttons</li>
              <li>Skip-to-content link at the top of every page</li>
            </ul>
            <h2 className="font-display text-xl text-navy-deep">Report an issue</h2>
            <p>
              If you encounter an accessibility barrier, email{" "}
              <a className="underline" href="mailto:hello@discoverdiplomacy.com">hello@discoverdiplomacy.com</a>{" "}
              and we will work to address it promptly.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
