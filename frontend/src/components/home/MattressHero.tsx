"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, ChevronsDown, Sparkles } from "lucide-react";
import { Aurora } from "@/components/Motion";
import { builds, type Layer } from "@/data/layers";
import { useProduct } from "@/context/catalog";
import { startingMrp, startingPrice } from "@/lib/pricing";
import { cn, formatINR } from "@/lib/format";

/* Mattress footprint (px, before responsive scaling) and the lift between layers when fully opened */
const W = 400;
const D = 260;
const GAP = 66;
const EASE = [0.22, 1, 0.36, 1] as const;

export function MattressHero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const build = builds[active];
  const product = useProduct(build.slug);

  // Scroll drives the opening: closed → fully exploded while the scene is pinned
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scrollOpen = useTransform(scrollYProgress, [0.04, 0.6], [0, 1]);
  const peek = useMotionValue(0); // small lift on hover so it feels alive before scrolling
  const openRaw = useTransform<number, number>([scrollOpen, peek], ([s, h]) => Math.max(s, h));
  const open = useSpring(openRaw, { stiffness: 90, damping: 22, mass: 0.8 });

  // Camera: slowly turns while opening, plus a little mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });
  const rx = useTransform<number, number>([scrollYProgress, smy], ([p, y]) => 60 - p * 4 + y * 5);
  const rz = useTransform<number, number>([scrollYProgress, smx], ([p, x]) => -40 + p * 8 + x * 6);
  const world = useMotionTemplate`rotateX(${rx}deg) rotateZ(${rz}deg)`;

  const hintOpacity = useTransform(open, [0, 0.15], [1, 0]);
  const meter = useTransform(open, [0, 1], [0, 1]);
  const shadowScale = useTransform(open, [0, 1], [1, 1.25]);
  const shadowOpacity = useTransform(open, [0, 1], [0.75, 0.4]);

  return (
    <section ref={ref} className="theme-adapt relative -mt-[var(--header-h)] h-[250vh] bg-night text-cream">
      <div
        className="grain sticky top-0 flex h-[100svh] items-center overflow-hidden"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
      >
        <Aurora className="opacity-70" />
        <div className="bg-grid absolute inset-0 text-white/60" aria-hidden />

        <div className="relative mx-auto grid h-full w-full max-w-7xl grid-rows-[auto_1fr] items-center gap-2 px-4 pb-6 pt-[calc(var(--header-h)+3rem)] sm:px-6 sm:pt-[calc(var(--header-h)+2rem)] lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-1 lg:gap-6 lg:pb-10 lg:pt-[calc(var(--header-h)+0.5rem)]">
          {/* ── Copy ── */}
          <div className="relative z-10">
            <div className="glass-dark inline-flex animate-rise items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm text-cream/80">
              <span className="keep-white flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-brand to-ember px-2.5 py-0.5 text-xs font-semibold text-white">
                <Sparkles className="size-3" /> Festival sale
              </span>
              <span className="whitespace-nowrap">
                Flat 50% off<span className="hidden sm:inline"> · factory-direct since 1995</span>
              </span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.6rem,6.4vw,5.6rem)] font-semibold leading-[0.9] lg:mt-7">
              <span className="block animate-rise" style={{ animationDelay: "0.1s" }}>
                Sleep happily.
              </span>
              <span className="block animate-rise" style={{ animationDelay: "0.22s" }}>
                Wake <em className="text-gradient">happily.</em>
              </span>
            </h1>

            <p className="mt-5 hidden max-w-md animate-rise text-lg leading-relaxed text-cream/65 sm:block" style={{ animationDelay: "0.35s" }}>
              Peel back the layers — every Thankyou mattress is engineered layer by layer in our own Delhi factory, with up to{" "}
              <span className="font-semibold text-cream">11 years warranty</span>.
            </p>

            {/* Build picker */}
            <div className="mt-5 animate-rise lg:mt-8" style={{ animationDelay: "0.45s" }}>
              <p className="mb-2.5 hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45 sm:block">Look inside</p>
              <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {builds.map((b, i) => (
                  <button
                    key={b.key}
                    onClick={() => setActive(i)}
                    className={cn(
                      "relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                      active === i ? "text-ink" : "bg-white/[0.06] text-cream/65 ring-1 ring-inset ring-white/10 hover:text-cream",
                    )}
                  >
                    {active === i && (
                      <motion.span layoutId="hero-build" className="absolute inset-0 rounded-full bg-cream" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                    )}
                    <span className="relative">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex animate-rise flex-wrap items-center gap-3 lg:mt-8" style={{ animationDelay: "0.55s" }}>
              <Link
                href={`/product/${build.slug}`}
                className="keep-white btn-shine group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f2b53a] to-[#f7d27a] py-1.5 pl-6 pr-1.5 font-semibold text-[#0b1226] shadow-[0_20px_50px_-15px_rgba(242,181,58,0.75)] sm:py-2 sm:pl-7 sm:pr-2"
              >
                Shop {build.label.split(" ")[0]}
                <span className="grid size-10 place-items-center rounded-full bg-[#0b1226] text-[#f2b53a] transition group-hover:rotate-[-45deg] sm:size-11">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
              {product && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={product.slug}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="leading-tight"
                  >
                    <span className="block text-[11px] uppercase tracking-[0.16em] text-cream/45">Starts at</span>
                    <span className="font-display text-2xl font-semibold">{formatINR(startingPrice(product))}</span>
                    <span className="ml-2 text-sm text-cream/40 line-through">{formatINR(startingMrp(product))}</span>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* ── 3D mattress ── */}
          <div
            className="relative h-full min-h-0 w-full"
            onPointerEnter={() => animate(peek, 0.22, { duration: 0.6, ease: EASE })}
            onPointerLeave={() => animate(peek, 0, { duration: 0.6, ease: EASE })}
          >
            {/* Stack spans ~±240px around its centre plus ~320px of labels on the right, so anchor it to the left edge */}
            <div className="absolute inset-0 origin-left scale-[0.4] sm:translate-x-[14%] sm:scale-[0.7] lg:translate-x-0 lg:scale-[0.68] xl:scale-[0.85]">
              <div className="absolute inset-0 [perspective:1800px]">
                <motion.div
                  className="absolute top-[64%] [transform-style:preserve-3d]"
                  style={{ width: W, height: D, left: 245 - W / 2, marginTop: -D / 2, transform: world }}
                >
                  {/* floor shadow */}
                  <motion.div
                    className="absolute -inset-[14%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.85),transparent)]"
                    style={{ z: -6, scale: shadowScale, opacity: shadowOpacity }}
                  />
                  {/* warm glow under the stack */}
                  <motion.div
                    className="absolute -inset-[30%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(111,134,255,0.35),transparent)]"
                    style={{ z: -8, opacity: open }}
                  />
                  <Stack key={build.key} layers={build.layers} open={open} rx={rx} rz={rz} />
                </motion.div>
              </div>
            </div>

            {/* open meter */}
            <div className="absolute bottom-2 right-0 hidden items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45 lg:flex">
              Closed
              <span className="relative h-[3px] w-28 overflow-hidden rounded-full bg-white/15">
                <motion.span className="absolute inset-0 origin-left bg-gradient-to-r from-brand via-ember to-gold" style={{ scaleX: meter }} />
              </span>
              Open
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/50"
        >
          Scroll to open
          <ChevronsDown className="size-4 animate-bounce text-gold" />
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── 3D stack ───────────────────────── */

function Stack({ layers, open, rx, rz }: { layers: Layer[]; open: MotionValue<number>; rx: MotionValue<number>; rz: MotionValue<number> }) {
  // base height of each layer, measured from the floor (index 0 = top layer)
  const bases: number[] = [];
  let acc = 0;
  for (let i = layers.length - 1; i >= 0; i--) {
    bases[i] = acc;
    acc += layers[i].h;
  }
  const n = layers.length;
  return (
    <>
      {layers.map((l, i) => (
        <Slab key={i} layer={l} base={bases[i]} level={n - 1 - i} order={i} open={open} rx={rx} rz={rz} />
      ))}
    </>
  );
}

function Slab({
  layer,
  base,
  level,
  order,
  open,
  rx,
  rz,
}: {
  layer: Layer;
  base: number;
  /** 0 = bottom layer */
  level: number;
  /** 0 = top layer */
  order: number;
  open: MotionValue<number>;
  rx: MotionValue<number>;
  rz: MotionValue<number>;
}) {
  const h = layer.h;
  // Intro: layers drop into place one by one, bottom first
  const drop = useMotionValue(1);
  useEffect(() => {
    const c = animate(drop, 0, { delay: 0.25 + level * 0.13, type: "spring", stiffness: 140, damping: 16 });
    return () => c.stop();
  }, [drop, level]);

  const z = useTransform<number, number>([open, drop], ([o, d]) => base + level * GAP * o + d * 320);
  const faceOpacity = useTransform(drop, [0, 0.5, 1], [1, 1, 0]);

  // Labels fade in once the stack is mostly open, top layer first
  const labelIn = useTransform(open, [0.5 + order * 0.07, 0.72 + order * 0.07], [0, 1]);
  const labelX = useTransform(labelIn, [0, 1], [24, 0]);
  const nrz = useTransform(rz, (v) => -v);
  const nrx = useTransform(rx, (v) => -v);
  // Anchor at the front-right corner, undo the camera rotation, then shift in screen space.
  // (Shifting a child instead gets clipped to this element's box by Chrome's 3D compositing.)
  const billboard = useMotionTemplate`translate3d(${W}px, ${D}px, ${h / 2}px) rotateZ(${nrz}deg) rotateX(${nrx}deg) translate(${labelX}px, -50%)`;

  const piping = `inset 0 0 0 3px ${layer.edge}`;

  return (
    <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ z }}>
      {/* top */}
      <motion.div
        className="absolute inset-0 rounded-[5px]"
        style={{ background: layer.bg, transform: `translateZ(${h}px)`, boxShadow: `${piping}, inset 0 0 40px rgba(0,0,0,0.08)`, opacity: faceOpacity }}
      />
      {/* front (y = D) */}
      <motion.div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: W, height: h, background: layer.bg, transform: `translate3d(0, ${D}px, ${h}px) rotateX(-90deg)`, opacity: faceOpacity }}
      >
        <span className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />
        <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: layer.edge }} />
      </motion.div>
      {/* left (x = 0) */}
      <motion.div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: D, height: h, background: layer.bg, transform: `translate3d(0, 0, ${h}px) rotateZ(90deg) rotateX(-90deg)`, opacity: faceOpacity }}
      >
        <span className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/45" />
        <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: layer.edge }} />
      </motion.div>

      {/* label, kept facing the camera */}
      <motion.div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: billboard, opacity: labelIn }}>
        <div className="flex items-center">
          <span className="size-2.5 shrink-0 rounded-full bg-gold shadow-[0_0_0_4px_rgba(242,181,58,0.25)]" />
          <span className="h-px w-5 shrink-0 bg-gradient-to-r from-gold to-white/30 sm:w-12" />
          <span className="whitespace-nowrap rounded-xl bg-night-2/95 px-3 py-1.5 shadow-xl ring-1 ring-white/10 sm:py-2">
            <span className="flex items-center gap-2 text-[23px] font-semibold leading-tight sm:text-[15px]">
              <span className="font-display text-xl text-gold sm:text-xs">0{order + 1}</span>
              {layer.name}
            </span>
            <span className="mt-0.5 hidden max-w-[240px] truncate text-[12px] text-cream/55 sm:block">{layer.note}</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
