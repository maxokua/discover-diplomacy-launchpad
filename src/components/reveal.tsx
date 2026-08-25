import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
}

/**
 * Lightweight scroll-reveal wrapper.
 * Content is visible on first paint. Below-the-fold content only becomes an
 * animation candidate after browser capabilities and motion preferences are known.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  y = 24,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"visible" | "waiting">("visible");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // Never hide content already visible when the route first paints.
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setState("waiting");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setState("visible");
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{
        transform: state === "waiting" ? `translateY(${y}px)` : "translateY(0)",
        opacity: state === "waiting" ? 0 : 1,
        transition:
          state === "waiting"
            ? "none"
            : `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(delay, 150)}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(delay, 150)}ms`,
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}
