import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/employer/")({
  beforeLoad: () => {
    throw redirect({ to: "/employer/resumes" });
  },
  component: () => null,
});
