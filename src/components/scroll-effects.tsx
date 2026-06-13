import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ElementType,
  type CSSProperties,
} from "react";

/** True when prefers-reduced-motion is set. SSR-safe. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onChange = () => setReduced(m.matches);
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/**
 * Thin progress bar pinned to the top of the viewport.
 * Reflects how far down the document the user has scrolled.
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setPct(next);
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
    >
      <div
        className="h-full bg-emerald origin-left"
        style={{
          transform: `scaleX(${pct})`,
          transition: "transform 80ms linear",
        }}
      />
    </div>
  );
}

/**
 * Translates children on the Y axis based on the element's position in
 * the viewport. `speed` is a multiplier: 0 = no movement, 0.2 = subtle,
 * 0.5 = pronounced. Negative speeds invert direction.
 */
export function Parallax({
  children,
  speed = 0.2,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Distance from viewport center, normalized roughly to [-1, 1].
      const mid = rect.top + rect.height / 2;
      const dist = (mid - vh / 2) / vh;
      setOffset(dist * speed * 100);
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, reduced]);

  const style: CSSProperties = reduced
    ? {}
    : { transform: `translate3d(0, ${offset.toFixed(2)}px, 0)`, willChange: "transform" };

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Fades and blurs an element in/out based on its distance from the
 * viewport center. Good for hero images that should "settle" as the
 * user scrolls past.
 */
export function ScrollFade({
  children,
  className = "",
  as: Tag = "div",
  intensity = 1,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** 0.5 = subtle, 1 = default, 1.5 = pronounced */
  intensity?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [opacity, setOpacity] = useState(1);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(mid - vh / 2) / vh; // 0 = centered
      const next = Math.max(0.15, 1 - dist * intensity);
      setOpacity(next);
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [intensity, reduced]);

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={reduced ? {} : { opacity, transition: "opacity 120ms linear" }}
    >
      {children}
    </Tag>
  );
}

/**
 * Counts up to `to` once the element enters the viewport.
 * Renders with `prefix`/`suffix` (e.g. `$`, `+`).
 */
export function CountUp({
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
  className = "",
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) {
      setValue(to);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * to));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          break;
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
