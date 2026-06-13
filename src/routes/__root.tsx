import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">404</div>
        <h1 className="mt-3 font-display text-4xl text-navy-deep">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            Go home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center border border-border bg-paper px-5 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">Error</div>
        <h1 className="mt-3 font-display text-3xl text-navy-deep">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center bg-navy-deep px-5 py-3 text-xs font-medium uppercase tracking-wider text-paper hover:bg-navy"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center border border-border bg-paper px-5 py-3 text-xs font-medium uppercase tracking-wider text-navy-deep hover:bg-stone"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Discover Diplomacy — Global Career Advisory" },
      { name: "description", content: "Career advisory for students and early-career professionals pursuing roles in diplomacy, international policy, multilateral institutions, and global business." },
      { name: "author", content: "Discover Diplomacy" },
      { property: "og:title", content: "Discover Diplomacy — Global Career Advisory" },
      { property: "og:description", content: "Career advisory for students and early-career professionals pursuing roles in diplomacy, international policy, multilateral institutions, and global business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
