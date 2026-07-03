import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/compass-logo.png.asset.json";

const NAV = [
  { to: "/dashboard", label: "My Map", exact: true },
  { to: "/dashboard/opportunities", label: "Opportunities" },
  { to: "/dashboard/resume-studio", label: "Resume Studio" },
  { to: "/dashboard/resume-drop", label: "Resume Drop" },
  { to: "/dashboard/intel", label: "Intel Library" },
  { to: "/dashboard/community", label: "Community" },
  { to: "/dashboard/coaching", label: "Coaching" },
] as const;

type Props = {
  children: ReactNode;
  userName?: string | null;
  userEmail?: string | null;
};

export function DashboardShell({ children, userName, userEmail }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    if (avatarOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarOpen]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const initials =
    (userName || userEmail || "?")
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6 lg:px-10">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-3">
            <img src={logoAsset.url} alt="Discover Diplomacy" className="h-8 w-8" />
            <span className="hidden font-display text-[17px] font-semibold text-navy-deep sm:inline">
              Discover Diplomacy
            </span>
          </Link>

          <nav
            aria-label="Dashboard"
            className="ml-6 hidden flex-1 items-center gap-6 lg:flex"
          >
            {NAV.map((n) => {
              const active = n.exact
                ? pathname === n.to
                : pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "whitespace-nowrap text-sm transition-colors " +
                    (active
                      ? "font-medium text-navy-deep"
                      : "text-muted-foreground hover:text-navy-deep")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div ref={avatarRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={avatarOpen}
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper text-[11px] font-semibold uppercase text-navy-deep hover:border-navy-deep"
              >
                {initials}
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-border bg-paper shadow-lg">
                  <div className="border-b border-border px-4 py-3">
                    <div className="truncate text-sm font-medium text-navy-deep">
                      {userName || "Your account"}
                    </div>
                    {userEmail && (
                      <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="block px-4 py-2.5 text-sm text-navy-deep hover:bg-stone"
                  >
                    Profile &amp; Progress
                  </Link>
                  <Link
                    to="/billing"
                    onClick={() => setAvatarOpen(false)}
                    className="block px-4 py-2.5 text-sm text-navy-deep hover:bg-stone"
                  >
                    Billing
                  </Link>
                  <button
                    onClick={signOut}
                    className="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-navy-deep hover:bg-stone"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg border border-border p-2 lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label="Dashboard mobile"
            className="border-t border-border bg-paper lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-6 py-2">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border py-3 text-sm text-navy-deep last:border-b-0"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

export function ScaffoldPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gilt">
        DD · your mentor
      </div>
      <h1 className="mt-3 font-display text-4xl text-navy-deep">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-10 rounded-xl border border-dashed border-border bg-paper p-10 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Coming online
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          This surface is being wired up. The scaffold is here so your dashboard shell is
          consistent while individual services light up in the next pass.
        </p>
      </div>
      {children}
    </section>
  );
}
