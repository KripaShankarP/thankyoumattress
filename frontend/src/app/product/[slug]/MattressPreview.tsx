"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { Colour } from "@/lib/types";

/* Mattress footprint in px before scaling */
const W = 420;
const D = 270;

/** Quilted cover texture drawn over the chosen colour */
const quilt = [
  "radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.22) 0 2px, transparent 3px)",
  "repeating-linear-gradient(45deg, rgb(0 0 0 / 0.10) 0 1px, transparent 1px 34px)",
  "repeating-linear-gradient(-45deg, rgb(0 0 0 / 0.10) 0 1px, transparent 1px 34px)",
  "radial-gradient(ellipse at 30% 20%, rgb(255 255 255 / 0.28), transparent 60%)",
].join(", ");

/**
 * Illustrated 3D mattress in the picked cover colour. Shown in the gallery because the
 * product photos only exist in one colour.
 */
export function MattressPreview({ colour, thickness = 6 }: { colour: Colour; thickness?: number }) {
  const reduced = useReducedMotion();
  const h = 26 + thickness * 5;

  // Gentle idle sway + follow the pointer a little
  const sway = useMotionValue(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 16 });
  const sy = useSpring(my, { stiffness: 60, damping: 16 });
  const rx = useTransform(sy, (y) => 58 + y * 8);
  const rz = useTransform<number, number>([sway, sx], ([s, x]) => -34 + s + x * 14);
  const world = useMotionTemplate`rotateX(${rx}deg) rotateZ(${rz}deg)`;

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      sway.set(Math.sin((t - t0) / 1800) * 4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, sway]);

  const fabric = { backgroundColor: colour.hex, transition: "background-color 0.5s ease" };
  const piping = `color-mix(in oklab, ${colour.hex} 70%, black)`;

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#ffffff,#e9e6df_70%)]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* soft colour glow behind the mattress */}
      <div
        className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: colour.hex, transition: "background 0.5s ease" }}
      />

      <div className="absolute inset-0 grid place-items-center">
        <div className="scale-[0.62] sm:scale-95 lg:scale-[0.8] xl:scale-95">
          <div className="[perspective:1600px]" style={{ width: W, height: D }}>
            <motion.div className="relative [transform-style:preserve-3d]" style={{ width: W, height: D, transform: world }}>
              {/* floor shadow */}
              <div
                className="absolute -inset-[12%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(15,23,42,0.45),transparent)]"
                style={{ transform: "translateZ(-2px)" }}
              />
              {/* top */}
              <div
                className="absolute inset-0 rounded-[14px]"
                style={{
                  ...fabric,
                  backgroundImage: quilt,
                  backgroundSize: "34px 34px, auto, auto, auto",
                  transform: `translateZ(${h}px)`,
                  boxShadow: `inset 0 0 0 4px ${piping}, inset 0 0 50px rgb(0 0 0 / 0.18)`,
                }}
              />
              {/* front (y = D) */}
              <div
                className="absolute left-0 top-0 origin-top-left overflow-hidden"
                style={{ ...fabric, width: W, height: h, transform: `translate3d(0, ${D}px, ${h}px) rotateX(-90deg)` }}
              >
                <span className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: piping }} />
                <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: piping }} />
                {/* side label */}
                <span className="absolute left-1/2 top-1/2 flex h-[60%] -translate-x-1/2 -translate-y-1/2 items-center rounded-md bg-[#ffffff] px-2 shadow">
                  <Image src="/images/brand/wordmark.png" alt="" width={120} height={44} className="h-full w-auto" />
                </span>
              </div>
              {/* left (x = 0) */}
              <div
                className="absolute left-0 top-0 origin-top-left"
                style={{ ...fabric, width: D, height: h, transform: `translate3d(0, 0, ${h}px) rotateZ(90deg) rotateX(-90deg)` }}
              >
                <span className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: piping }} />
                <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: piping }} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-[#0f172a] shadow-sm backdrop-blur">
        <span className="size-6 rounded-full ring-1 ring-inset ring-black/15" style={{ background: colour.hex }} />
        {colour.name}
      </div>
      <p className="absolute inset-x-0 bottom-4 text-center text-[11px] font-medium text-[#5b6478]">
        Colour preview · actual fabric print may vary
      </p>
    </div>
  );
}
