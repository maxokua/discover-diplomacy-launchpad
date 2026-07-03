import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Fixed 56px scroll-progress compass for long-form pages.
 * Outer ring fills with scroll progress via stroke-dashoffset.
 * Needle rotates 0–360° with progress. Hidden below 640px.
 * Dismiss button hides for the session.
 */
export function ScrollCompass() {
  const [pct, setPct] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHidden(sessionStorage.getItem("dd:scroll-compass:hidden") === "1");
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onReduced = () => setReduced(m.matches);
    m.addEventListener?.("change", onReduced);

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      raf.current = 0;
    };
    const onScroll = () => {
      if (raf.current) return;
      raf.current = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      m.removeEventListener?.("change", onReduced);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (hidden) return null;

  const R = 24;
  const C = 2 * Math.PI * R;
  const dash = reduced ? C : C * (1 - pct);
  const angle = reduced ? 0 : pct * 360;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 hidden sm:block"
      aria-hidden={reduced}
    >
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-paper shadow-sm">
        <svg viewBox="0 0 56 56" className="h-14 w-14 text-navy-deep">
          <circle
            cx="28" cy="28" r={R}
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="2"
          />
          <circle
            cx="28" cy="28" r={R}
            fill="none"
            stroke="var(--color-gilt)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dash}
            transform="rotate(-90 28 28)"
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
          <g
            style={{
              transformOrigin: "28px 28px",
              transform: `rotate(${angle}deg)`,
              transition: "transform 120ms linear",
            }}
          >
            <polygon points="28,10 26,29 30,29" fill="currentColor" />
            <polygon points="28,46 26,27 30,27" fill="currentColor" opacity="0.4" />
          </g>
          <circle cx="28" cy="28" r="1.75" fill="currentColor" />
        </svg>
        <button
          type="button"
          aria-label="Hide scroll compass"
          onClick={() => {
            sessionStorage.setItem("dd:scroll-compass:hidden", "1");
            setHidden(true);
          }}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-paper text-muted-foreground hover:text-navy-deep"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
