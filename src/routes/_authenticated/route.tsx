import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const ONBOARDING_ALLOWLIST = new Set(["/welcome", "/profile", "/billing"]);

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Onboarding gate: if profile.onboarding_complete is false and the user
    // isn't on /welcome (or a small allowlist), send them to /welcome.
    const path = location.pathname;
    if (!ONBOARDING_ALLOWLIST.has(path)) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!prof?.onboarding_complete) {
        throw redirect({ to: "/welcome" });
      }
    }

    return { user: data.user };
  },
  component: () => <Outlet />,
});
