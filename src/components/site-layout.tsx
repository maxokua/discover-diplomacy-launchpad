import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/compass-logo.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { ScrollProgress } from "@/components/scroll-effects";
import { ScrollRevealInit } from "@/components/scroll-reveal-init";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/services", label: "Services" },
  { to: "/directory", label: "Directory" },
  { to: "/about", label: "About" },
  { to: "/coaches", label: "Coaches" },
  { to: "/employers", label: "Employers" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollProgress />
      <ScrollRevealInit />

      <div className="hidden border-b border-border bg-navy-deep text-paper md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2 text-xs lg:px-10">
          <span className="truncate text-paper/70">
            Built for globally-minded students and early-career professionals.
          </span>
          <div className="flex shrink-0 items-center gap-5 text-paper/70">
            <a href="mailto:hello@discoverdiplomacy.org" className="hover:text-paper">
              hello@discoverdiplomacy.org
            </a>
            <span aria-hidden>·</span>
            <span>Based in Washington, DC</span>
            <span aria-hidden>·</span>
            {user ? (
              <Link to="/dashboard" className="font-medium text-paper hover:text-paper">
                Dashboard
              </Link>
            ) : (
              <Link to="/auth" className="font-medium text-paper hover:text-paper">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-navy-deep focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:uppercase focus:tracking-wider focus:text-paper"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20 lg:gap-6 lg:px-10">
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center gap-3 pr-2"
            onClick={() => setOpen(false)}
          >
            <img
              src={logoAsset.url}
              alt="Discover Diplomacy"
              className="h-9 w-9 shrink-0 lg:h-10 lg:w-10"
            />
            <div className="min-w-0 leading-tight">
              <div className="truncate font-display text-[15px] font-semibold text-navy-deep sm:text-[17px]">
                Discover Diplomacy
              </div>
              <div className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
                Global Career Advisory
              </div>
            </div>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="ml-auto hidden shrink-0 items-center gap-5 lg:flex xl:gap-7"
          >
            {NAV.map((n) => {
              const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "whitespace-nowrap text-sm transition-colors " +
                    (active
                      ? "text-navy-deep font-medium"
                      : "text-muted-foreground hover:text-navy-deep")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="ml-1 inline-flex items-center whitespace-nowrap rounded-sm bg-navy-deep px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-paper transition-colors hover:bg-navy"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            className="ml-auto shrink-0 rounded-sm border border-border p-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-border bg-paper lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3 text-sm text-navy-deep last:border-b-0"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to={user ? "/dashboard" : "/auth"}
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center rounded-sm bg-navy-deep px-4 py-3 text-xs font-medium uppercase tracking-wider text-paper"
              >
                {user ? "Dashboard" : "Sign in"}
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" key={pathname} className="flex-1 page-enter">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-navy-deep text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Discover Diplomacy" className="h-10 w-10" />
            <div>
              <div className="font-display text-lg">Discover Diplomacy</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-paper/60">
                Global Career Advisory
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/70">
            The talent infrastructure layer for internationally-focused careers.
            Discover opportunities, prepare your materials, and reach vetted insider
            coaches and verified employers — built for diplomacy, multilaterals,
            global policy, and international business.
          </p>
          <p className="mt-4 text-sm text-paper/70">
            <a
              href="mailto:hello@discoverdiplomacy.org"
              className="underline-offset-4 hover:text-paper hover:underline"
            >
              hello@discoverdiplomacy.org
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-3">
          <FooterCol
            title="Plans"
            links={[
              { to: "/services", label: "Explorer · Free" },
              { to: "/services", label: "Compass · $20/mo" },
              { to: "/services", label: "Envoy · $150/mo" },
              { to: "/services", label: "Resume Review · $25" },
            ]}
          />
          <FooterCol
            title="Engage"
            links={[
              { to: "/assessment", label: "Free assessment" },
              { to: "/waitlist", label: "Weekly digest" },
              { to: "/directory", label: "Opportunity directory" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ]}
          />
          <FooterCol
            title="Network"
            links={[
              { to: "/coaches", label: "Become a coach" },
              { to: "/employers", label: "For employers" },
              { to: "/brand-guide", label: "Brand & voice" },
            ]}
          />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/60">
              Location
            </div>
            <ul className="mt-4 space-y-3 text-sm text-paper/80">
              <li>
                <div className="font-medium text-paper">Washington, DC</div>
                <div className="text-paper/60">United States</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-paper/60 lg:px-10">
          <div>© {year} Discover Diplomacy LLC. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-paper">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-paper">
              Terms
            </Link>
            <Link to="/accessibility" className="hover:text-paper">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/60">
        {title}
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="text-paper/80 hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
