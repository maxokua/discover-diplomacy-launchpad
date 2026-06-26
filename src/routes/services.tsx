import { createFileRoute, redirect } from "@tanstack/react-router";

// /services has been renamed to /pricing. Keep this route as a permanent redirect
// so existing links, sitemaps, and SEO continue to work.
export const Route = createFileRoute("/services")({
  beforeLoad: () => {
    throw redirect({ to: "/pricing", replace: true });
  },
  component: () => null,
});
