"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/format";

export function Counter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const c = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => (node.textContent = Math.round(v).toLocaleString("en-IN") + suffix),
    });
    return () => c.stop();
  }, [inView, to, suffix, duration]);
  return <span ref={ref}>0{suffix}</span>;
}

export function Faq({ items, dark }: { items: { q: string; a: string }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className={cn(
              "overflow-hidden rounded-[1.6rem] border transition-all duration-300",
              dark ? "border-white/10 bg-white/5" : "border-ink/[0.07] bg-white",
              isOpen && (dark ? "border-gold/40" : "border-transparent shadow-[0_20px_50px_-25px_rgba(12,12,16,0.3)]"),
            )}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-semibold"
            >
              {f.q}
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className={cn("grid size-8 shrink-0 place-items-center rounded-full", isOpen ? "bg-gradient-to-br from-brand to-ember text-white" : dark ? "bg-white/10" : "bg-cream")}>
                <Plus className="size-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <p className={cn("px-6 pb-6 text-sm leading-relaxed", dark ? "text-cream/70" : "text-ink-soft")}>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
