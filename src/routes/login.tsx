import { createFileRoute, redirect } from "@tanstack/react-router";

type LoginSearch = { next?: string };

function safeNext(value: unknown) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
    ? value
    : undefined;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    next: safeNext(search.next),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/auth",
      search: search.next ? { next: search.next } : {},
      replace: true,
    });
  },
  component: () => null,
});