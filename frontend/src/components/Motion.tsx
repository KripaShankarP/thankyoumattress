"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/format";

/** Inertia smooth scrolling for the whole page (skipped for reduced-motion users) */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -90 }, autoRaf: true });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // New route → start at the top
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

/** Thin gradient bar at the very top showing reading progress */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand via-ember to-gold"
    />
  );
}

/** A paragraph whose words light up one by one as it scrolls through the viewport */
export function ScrollText({ text, className, accent = [] }: { text: string; className?: string; accent?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={accent.includes(w.replace(/[.,—]/g, ""))}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <span className="relative mr-[0.25em] mt-[0.1em]">
      <motion.span style={{ opacity }} className={accent ? "font-serif italic text-gradient" : undefined}>
        {children}
      </motion.span>
    </span>
  );
}

/** Animated, blurred colour blobs for dark sections */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -left-[10%] -top-[20%] size-[60vmax] animate-aurora rounded-full bg-[radial-gradient(circle,rgba(54,81,212,0.45),transparent_60%)] blur-3xl" />
      <div
        className="absolute -right-[15%] top-[10%] size-[55vmax] animate-aurora rounded-full bg-[radial-gradient(circle,rgba(111,134,255,0.35),transparent_60%)] blur-3xl"
        style={{ animationDelay: "-6s", animationDuration: "22s" }}
      />
      <div
        className="absolute -bottom-[30%] left-[25%] size-[50vmax] animate-aurora rounded-full bg-[radial-gradient(circle,rgba(242,181,58,0.22),transparent_60%)] blur-3xl"
        style={{ animationDelay: "-12s", animationDuration: "26s" }}
      />
    </div>
  );
}

/** Small pill used above section headings */
export function Eyebrow({ children, dark, className }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
        dark ? "glass-dark text-cream/80" : "border border-ink/10 bg-white/70 text-ink/70",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/60" />
        <span className="relative size-2 rounded-full bg-brand" />
      </span>
      {children}
    </span>
  );
}
