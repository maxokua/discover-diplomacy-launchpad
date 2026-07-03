import { useEffect, useState } from "react";

/**
 * Compass loader. Needle oscillates ±30° while `loading` is true, then locks
 * to north with an overshoot on completion. Respects prefers-reduced-motion.
 */
export function CompassLoader({
  size = 48,
  loading = true,
  label = "Loading",
  className = "",
}: {
  size?: number;
  loading?: boolean;
  label?: string;
  className?: string;
}) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);

  const animate = loading && !reduced;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={"inline-flex items-center justify-center " + className}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
        <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
        <g
          style={{
            transformOrigin: "24px 24px",
            animation: animate
              ? "compassSwing 0.6s ease-in-out infinite"
              : "compassSettle 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          <polygon points="24,5 21,25 27,25" fill="var(--color-gilt,#B8873A)" />
          <polygon points="24,43 21,23 27,23" fill="currentColor" opacity="0.55" />
        </g>
      </svg>
      <style>{`
        @keyframes compassSwing {
          0%   { transform: rotate(-30deg); }
          50%  { transform: rotate(30deg); }
          100% { transform: rotate(-30deg); }
        }
        @keyframes compassSettle {
          0%   { transform: rotate(-20deg); }
          70%  { transform: rotate(8deg); }
          100% { transform: rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="status"] g { animation: none !important; transform: none !important; }
        }
      `}</style>
    </span>
  );
}
