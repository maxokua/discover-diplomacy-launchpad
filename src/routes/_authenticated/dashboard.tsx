import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardProfile } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | Discover Diplomacy" }] }),
  loader: () => getDashboardProfile(),
  component: DashboardLayout,
});

function DashboardLayout() {
  const profile = useLoaderData({ from: "/_authenticated/dashboard" });
  return (
    <DashboardShell userName={profile.full_name} userEmail={profile.email}>
      <Outlet />
    </DashboardShell>
  );
}
