import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/compass-logo.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { ScrollProgress } from "@/components/scroll-effects";
import { ScrollRevealInit } from "@/components/scroll-reveal-init";

type NavLink = { to: string; label: string };

const NAV_LINKS: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/directory", label: "Directory" },
  { to: "/pricing", label: "Pricing" },
  { to: "/booking", label: "Book a call" },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollProgress />
      <ScrollRevealInit />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy-deep focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:uppercase focus:tracking-wider focus:text-paper"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6 lg:px-10">
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <img
              key={pathname}
              src={logoAsset.url}
              alt="Discover Diplomacy"
              className="h-9 w-9 shrink-0 nav-logo-spin"
            />
            <div className="min-w-0 leading-tight">
              <div className="truncate font-display text-[18px] font-semibold text-navy-deep">
                Discover Diplomacy
              </div>
              <div className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
                For Global Careers
              </div>
            </div>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="ml-auto hidden shrink-0 items-center gap-8 lg:flex"
          >
            {NAV_LINKS.map((n) => {
              const active = pathname === n.to;
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
              className="whitespace-nowrap text-sm font-medium text-navy-deep transition-colors hover:text-gilt"
            >
              {user ? "Dashboard" : "Log in"}
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            className="ml-auto shrink-0 rounded-lg border border-border p-2 lg:hidden"
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
            <div className="mx-auto flex max-w-7xl flex-col px-6 py-3">
              {NAV_LINKS.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-4 text-sm text-navy-deep last:border-b-0"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to={user ? "/dashboard" : "/auth"}
                onClick={() => setOpen(false)}
                className="border-b border-border py-4 text-sm font-medium text-navy-deep"
              >
                {user ? "Dashboard" : "Log in"}
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
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Discover Diplomacy" className="h-10 w-10" />
            <div>
              <div className="font-display text-lg">Discover Diplomacy</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-paper/60">
                For Global Careers
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/70">
            The international career platform — curated opportunities, expert-designed
            preparation, vetted insider coaches, and verified employer access.
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

        <div className="grid grid-cols-2 gap-8 lg:col-span-8 lg:grid-cols-3">
          <FooterCol
            title="Candidates"
            links={[
              { to: "/pricing", label: "Pricing" },
              { to: "/directory", label: "Directory" },
              { to: "/assessment", label: "Free Assessment" },
              { to: "/resume-drop", label: "Resume Drop" },
            ]}
          />
          <FooterCol
            title="Universities"
            links={[
              { to: "/universities", label: "University Program" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/privacy", label: "Privacy" },
              { to: "/terms", label: "Terms" },
            ]}
          />
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-paper/60 lg:px-10">
          <div>© {year} Discover Diplomacy LLC. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-paper">Privacy</Link>
            <Link to="/terms" className="hover:text-paper">Terms</Link>
            <Link to="/accessibility" className="hover:text-paper">Accessibility</Link>
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
