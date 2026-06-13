import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";

const MotionLink = motion(Link);

type MagneticLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  /** Radius in px from element center where the magnet activates. */
  radius?: number;
  /** Max translation in px. */
  strength?: number;
};

/**
 * Magnetic CTA: gently follows the cursor when within `radius`,
 * snaps back on leave. Honors prefers-reduced-motion.
 */
export function MagneticLink({
  children,
  className,
  radius = 110,
  strength = 14,
  ...linkProps
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) {
      x.set(0);
      y.set(0);
      return;
    }
    const k = (1 - dist / radius) * strength;
    x.set((dx / radius) * strength + Math.sign(dx) * k * 0.1);
    y.set((dy / radius) * strength + Math.sign(dy) * k * 0.1);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionLink
      {...(linkProps as any)}
      ref={ref as any}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {children}
    </MotionLink>
  );
}
