import { useEffect, useState } from "react";

/**
 * Hero compass SVG. On first render per session, the 8 points bloom outward
 * from center with 70ms stagger + slight overshoot, and the navy ring draws
 * in via stroke-dashoffset. Respects prefers-reduced-motion.
 */
export function HeroCompass({ size = 128 }: { size?: number }) {
  const [play, setPlay] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    if (m.matches) return;
    const shown = sessionStorage.getItem("dd:hero:seen") === "1";
    if (shown) return;
    sessionStorage.setItem("dd:hero:seen", "1");
    setPlay(true);
  }, []);

  const R = 60;
  const C = 2 * Math.PI * R;
  const points = Array.from({ length: 8 }, (_, i) => i);
  const started = play && !reduced;

  return (
    <div style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 140 140" width={size} height={size}>
        <circle
          cx="70" cy="70" r={R}
          fill="none"
          stroke="var(--color-navy-deep)"
          strokeWidth="2"
          strokeDasharray={C}
          strokeDashoffset={started ? C : 0}
          style={{
            animation: started ? "heroRing 900ms ease-out 200ms forwards" : undefined,
          }}
        />
        {points.map((i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const long = i % 2 === 0;
          const len = long ? 46 : 26;
          const w = long ? 8 : 5;
          const x1 = 70;
          const y1 = 70;
          const x2 = 70 + Math.sin(angle) * len;
          const y2 = 70 - Math.cos(angle) * len;
          // Perpendicular offsets for the triangle base
          const px = Math.cos(angle) * (w / 2);
          const py = Math.sin(angle) * (w / 2);
          const bx1 = x1 + px;
          const by1 = y1 + py;
          const bx2 = x1 - px;
          const by2 = y1 - py;
          return (
            <polygon
              key={i}
              points={`${bx1},${by1} ${bx2},${by2} ${x2},${y2}`}
              fill={long ? "var(--color-navy-deep)" : "var(--color-gilt)"}
              opacity={long ? 1 : 0.9}
              style={{
                transformOrigin: "70px 70px",
                transform: started ? "scale(0)" : "scale(1)",
                animation: started
                  ? `heroBloom 520ms cubic-bezier(0.34,1.56,0.64,1) ${i * 70}ms forwards`
                  : undefined,
              }}
            />
          );
        })}
        <circle cx="70" cy="70" r="3" fill="var(--color-navy-deep)" />
      </svg>
      <style>{`
        @keyframes heroBloom {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes heroRing {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          svg polygon, svg circle { animation: none !important; transform: none !important; stroke-dashoffset: 0 !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}
