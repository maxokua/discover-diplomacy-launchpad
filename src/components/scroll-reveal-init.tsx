import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Site-wide scroll reveal. On every route change it:
 *  - Marks reveal targets with [data-reveal] (sections, headings, cards, opt-ins).
 *  - Stagger-delays direct siblings inside each section for a gentle cascade.
 *  - Observes them with IntersectionObserver and toggles `.is-visible`.
 * Respects prefers-reduced-motion via CSS.
 */
export function ScrollRevealInit() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SELECTOR = [
      "section",
      "[data-reveal]",
      "main h1",
      "main h2",
      "main h3",
      "article",
    ].join(", ");

    const tag = (el: Element) => {
      if (!(el instanceof HTMLElement)) return;
      if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
    };

    // Tag candidates
    const roots = document.querySelectorAll(SELECTOR);
    roots.forEach(tag);

    // Light stagger for direct content children inside sections
    document.querySelectorAll("section").forEach((sec) => {
      const container =
        (sec.querySelector(":scope > div") as HTMLElement | null) ?? sec;
      const children = Array.from(container.children).filter(
        (c) => c instanceof HTMLElement,
      ) as HTMLElement[];
      children.slice(0, 8).forEach((child, i) => {
        if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "");
        if (!child.style.transitionDelay) {
          child.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
        }
      });
    });

    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");

    // Anything already in view on mount should show immediately (no flash on top-of-page hero)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
