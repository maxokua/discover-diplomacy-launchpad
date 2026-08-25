import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Site-wide scroll reveal. On every route change it:
 *  - Marks only below-the-fold targets with [data-reveal].
 *  - Keeps first-paint and unsupported-browser content visible.
 *  - Observes them with IntersectionObserver and toggles `.is-visible`.
 * Respects prefers-reduced-motion via CSS.
 */
export function ScrollRevealInit() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsObserver = "IntersectionObserver" in window;

    const SELECTOR = [
      "section",
      "[data-reveal]",
      "main h1",
      "main h2",
      "main h3",
      "article",
    ].join(", ");

    const roots = document.querySelectorAll(SELECTOR);

    // Auto hover-lift: anything that looks like a card (rounded + border, or article)
    document
      .querySelectorAll<HTMLElement>(
        'main article, main [class*="rounded-"][class*="border"]:not(button):not(input):not(textarea):not(select)',
      )
      .forEach((el) => {
        if (!el.hasAttribute("data-hover-lift")) el.setAttribute("data-hover-lift", "");
      });

    // Auto hover-zoom on content images inside cards/articles
    document
      .querySelectorAll<HTMLImageElement>("main article img, main figure img")
      .forEach((img) => {
        const parent = img.parentElement;
        if (parent && !parent.hasAttribute("data-img-zoom-wrap")) {
          parent.setAttribute("data-img-zoom-wrap", "");
        }
        if (!img.hasAttribute("data-img-zoom")) img.setAttribute("data-img-zoom", "");
      });

    if (reduceMotion || !supportsObserver) return;

    const targets = Array.from(roots).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );

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
        el.setAttribute("data-reveal", "");
        io.observe(el);
      }
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
