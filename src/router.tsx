import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function RoutePendingSkeleton() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-label="Loading page">
      <div className="h-20 border-b border-border bg-paper" />
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="h-3 w-28 animate-pulse rounded-sm bg-muted" />
        <div className="mt-6 h-12 max-w-2xl animate-pulse rounded-sm bg-muted" />
        <div className="mt-4 h-5 max-w-xl animate-pulse rounded-sm bg-muted" />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-52 animate-pulse border border-border bg-muted" />
          ))}
        </div>
      </main>
      <span className="sr-only">Loading page</span>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
    defaultPendingMs: 100,
    defaultPendingComponent: RoutePendingSkeleton,
  });

  return router;
};
