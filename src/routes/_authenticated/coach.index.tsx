import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/coach/")({
  beforeLoad: () => {
    throw redirect({ to: "/coach/clients" });
  },
  component: () => null,
});
