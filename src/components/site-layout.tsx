import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/compass-logo.png.asset.json";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/membership", label: "Membership" },
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
      <div className="hidden border-b border-border bg-navy-deep text-paper md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs lg:px-10">
          <span className="text-paper/70">Career coaching for globally minded professionals</span>
          <div className="flex items-center gap-5 text-paper/70">
            <a href="mailto:hello@discoverdiplomacy.com" className="hover:text-paper">
              hello@discoverdiplomacy.com
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

      <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src={logoAsset.url} alt="" className="h-9 w-9" />
            <div className="leading-tight">
              <div className="font-display text-[17px] font-semibold text-navy-deep">
                Discover Diplomacy
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Global Career Advisory
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => {
              const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "text-sm transition-colors " +
                    (active ? "text-navy-deep font-medium" : "text-muted-foreground hover:text-navy-deep")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="ml-2 inline-flex items-center rounded-sm bg-navy-deep px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-paper transition-colors hover:bg-navy"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            className="rounded-sm border border-border p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-border bg-paper md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
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

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy-deep text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="" className="h-10 w-10" />
            <div>
              <div className="font-display text-lg">Discover Diplomacy</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-paper/60">
                Global Career Advisory
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/70">
            A career advisory practice for students and early-career professionals pursuing roles
            in diplomacy, international policy, multilateral institutions, and global affairs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-3">
          <FooterCol
            title="Practice"
            links={[
              { to: "/services", label: "Services" },
              { to: "/membership", label: "Membership" },
              { to: "/about", label: "About" },
            ]}
          />
          <FooterCol
            title="Engage"
            links={[
              { to: "/contact", label: "Consultation" },
              { to: "/resume-review", label: "Resume review" },
              { to: "/coaches", label: "Become a coach" },
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
          <div>© {new Date().getFullYear()} Discover Diplomacy LLC. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-paper">Privacy</a>
            <a href="#" className="hover:text-paper">Terms</a>
            <a href="#" className="hover:text-paper">Accessibility</a>
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
