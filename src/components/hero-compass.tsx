import { useEffect, useState } from "react";
import compassAsset from "@/assets/compass-hero.png.asset.json";

/**
 * Hero compass logo. On first render per session, blooms in with a scale +
 * overshoot and a subtle rotation settle. Respects prefers-reduced-motion.
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

  const started = play && !reduced;

  return (
    <div
      style={{ width: size, height: size }}
      aria-hidden
      className="relative inline-block"
    >
      <img
        src={compassAsset.url}
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          display: "block",
          transformOrigin: "center",
          animation: started
            ? "heroCompassBloom 900ms cubic-bezier(0.34,1.56,0.64,1) both"
            : undefined,
        }}
      />
      <style>{`
        @keyframes heroCompassBloom {
          0%   { transform: scale(0) rotate(-90deg); opacity: 0; filter: blur(6px); }
          60%  { transform: scale(1.08) rotate(6deg); opacity: 1; filter: blur(0); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          img { animation: none !important; transform: none !important; opacity: 1 !important; filter: none !important; }
        }
      `}</style>
    </div>
  );
}
