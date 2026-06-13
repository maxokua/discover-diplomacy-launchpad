import { cn } from "@/lib/utils";

/**
 * Shimmer skeleton: subtle gradient sweeps across at ~1.4s loop.
 * Falls back to a static muted block under prefers-reduced-motion.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-primary/10",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        "before:animate-[shimmer_1.4s_ease-in-out_infinite] motion-reduce:before:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
