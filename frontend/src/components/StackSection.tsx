"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/format";

/**
 * A section that "holds" on screen: it sticks as soon as its bottom edge reaches the viewport
 * bottom, stays put for `hold` of a screen height, then the next StackSection slides over it
 * while this one sinks back.
 *
 * Use as consecutive siblings inside one plain container — sticky only works within the parent.
 */
export function StackSection({
  children,
  className,
  hold = 0.35,
  last,
}: {
  children: React.ReactNode;
  className?: string;
  /** Pause length, as a fraction of the viewport height */
  hold?: number;
  /** The last section has nothing sliding over it */
  last?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [top, setTop] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Short sections stick against the viewport bottom, tall ones once their bottom edge arrives
    const measure = () => setTop(window.innerHeight - el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // 0 → the next section starts entering from the bottom, 1 → it fully covers this one
  const { scrollYProgress } = useScroll({ target: spacer, offset: ["end end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.92]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  return (
    <>
      <motion.div
        ref={ref}
        style={last ? undefined : { top, scale, transformOrigin: "50% 100%" }}
        className={cn(
          "relative overflow-hidden rounded-t-[2.5rem] shadow-[0_-30px_60px_-30px_rgba(0,0,0,0.35)]",
          !last && "sticky",
          className,
        )}
      >
        {children}
        {!last && <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-night" style={{ opacity: shade }} />}
      </motion.div>
      {/* always rendered: it is the scroll target (height 0 for the last section) */}
      <div ref={spacer} aria-hidden style={{ height: last ? 0 : `${hold * 100}svh` }} />
    </>
  );
}
