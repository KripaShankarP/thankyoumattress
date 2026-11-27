"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, PhoneCall, Plus, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { useCatalog, useProduct } from "@/context/catalog";
import { mrpFor, priceFor, sizeLabel } from "@/lib/pricing";
import { useCart } from "@/context/cart";
import { site } from "@/data/site";
import { setPreviewColour } from "./previewColour";
import { cn, discountPct, formatINR } from "@/lib/format";

function Option({ active, onClick, children, sub }: { active: boolean; onClick: () => void; children: React.ReactNode; sub?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-semibold transition",
        active ? "border-brand bg-brand/5" : "border-ink/10 bg-white hover:border-ink/30",
      )}
    >
      {children}
      {sub && <span className="block text-[11px] font-medium text-ink-soft">{sub}</span>}
      {active && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-brand text-white">
          <Check className="size-3" />
        </motion.span>
      )}
    </button>
  );
}

export function BuyBox({ slug }: { slug: string }) {
  const p = useProduct(slug)!;
  const { settings } = useCatalog();
  const router = useRouter();
  const { add } = useCart();

  const models = useMemo(() => [...new Set(p.priceRows.map((r) => r.model))], [p]);
  const [model, setModel] = useState(models[0]);
  const thicknesses = p.priceRows.filter((r) => r.model === model).map((r) => r.thickness);
  const [thickness, setThickness] = useState(thicknesses[0]);
  const [size, setSize] = useState(p.sizes[Math.min(1, p.sizes.length - 1)]);
  const [comfort, setComfort] = useState<string | undefined>(p.comfortOptions[0]);
  const colours = p.colours;
  const [colour, setColour] = useState<string>();
  const [colourError, setColourError] = useState(false);
  const colourRef = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const t = thicknesses.includes(thickness) ? thickness : thicknesses[0];
  // Only sizes this model + thickness is sold in (an admin may leave a size blank)
  const sizes = p.sizes.filter((s) => priceFor(p, model, t, s) !== undefined);
  const chosenSize = sizes.includes(size) ? size : (sizes[0] ?? size);
  const price = priceFor(p, model, t, chosenSize) ?? 0;
  const mrp = mrpFor(p, model, t, chosenSize);
  const isPillow = p.category === "pillow";

  const line = { slug: p.slug, model, thickness: t, size: chosenSize, comfort, colour, qty };

  // Show the picked colour on the gallery's 3D preview (cleared when leaving the page)
  const picked = colours.find((c) => c.name === colour);
  useEffect(() => {
    setPreviewColour(picked && !isPillow ? { colour: picked, thickness: t } : null);
  }, [picked, t, isPillow]);
  useEffect(() => () => setPreviewColour(null), []);

  /** A colour has to be picked before the item can go in the cart */
  const ready = () => {
    if (colours.length === 0 || colour) return true;
    setColourError(true);
    colourRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="rounded-3xl bg-white p-5 ring-1 ring-ink/5">
        <div className="flex flex-wrap items-end gap-3">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={price * qty}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              className="font-display text-4xl font-semibold"
            >
              {formatINR(price * qty)}
            </motion.span>
          </AnimatePresence>
          {mrp && (
            <>
              <span className="pb-1 text-lg text-ink-soft line-through">{formatINR(mrp * qty)}</span>
              <span className="mb-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-bold text-green-800">
                Save {discountPct(price, mrp)}%
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-soft">+ {settings.gstPct}% GST · {isPillow ? "Per piece" : `${model}${p.priceRows.length > 1 ? ` · ${t}″` : ""} · ${chosenSize} in`}</p>
      </div>

      {models.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-bold">Model</p>
          <div className="flex flex-wrap gap-2">
            {models.map((m) => (
              <Option key={m} active={m === model} onClick={() => setModel(m)}>
                {m}
              </Option>
            ))}
          </div>
        </div>
      )}

      {p.comfortOptions.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold">Comfort type</p>
          <div className="flex flex-wrap gap-2">
            {p.comfortOptions.map((c) => (
              <Option key={c} active={c === comfort} onClick={() => setComfort(c)} sub={p.variants?.find((v) => v.name.includes(c))?.detail}>
                {c}
              </Option>
            ))}
          </div>
        </div>
      )}

      {!isPillow && (
        <div>
          <p className="mb-2 text-sm font-bold">Thickness</p>
          <div className="flex flex-wrap gap-2">
            {thicknesses.map((th) => (
              <Option key={th} active={th === t} onClick={() => setThickness(th)}>
                {th} inch
              </Option>
            ))}
          </div>
        </div>
      )}

      {!isPillow && (
        <div>
          <p className="mb-2 flex items-center justify-between text-sm font-bold">
            Size (L × W, inches) <span className="font-medium text-ink-soft">Custom sizes on request</span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sizes.map((s) => (
              <Option key={s} active={s === chosenSize} onClick={() => setSize(s)} sub={`${sizeLabel(s)} · ${formatINR(priceFor(p, model, t, s) ?? 0)}`}>
                {s}
              </Option>
            ))}
          </div>
        </div>
      )}

      {colours.length > 0 && (
        <div ref={colourRef} className="scroll-mt-28">
          <p className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>
              Cover colour{" "}
              {colour ? <span className="font-medium text-ink-soft">· {colour}</span> : <span className="text-brand">*</span>}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setColour(c.name);
                  setColourError(false);
                }}
                aria-pressed={colour === c.name}
                className={cn(
                  "flex items-center gap-2 rounded-full border-2 py-1.5 pl-1.5 pr-4 text-sm font-semibold transition",
                  colour === c.name ? "border-brand bg-brand/5" : "border-ink/10 bg-white hover:border-ink/30",
                )}
              >
                <span className="grid size-7 place-items-center rounded-full ring-1 ring-inset ring-black/15" style={{ background: c.hex }}>
                  {colour === c.name && <Check className={cn("size-4", ["Off-White", "Beige"].includes(c.name) ? "text-ink" : "text-white")} />}
                </span>
                {c.name}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {colourError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                className="mt-2 text-sm font-semibold text-red-600"
                role="alert"
              >
                Please choose a cover colour before ordering.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center rounded-full border-2 border-ink/10 bg-white">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-12 place-items-center" aria-label="Decrease quantity">
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="grid size-12 place-items-center" aria-label="Increase quantity">
            <Plus className="size-4" />
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (!ready()) return;
            add(line);
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-cream transition hover:bg-ink/85"
        >
          {added ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
          {added ? "Added!" : "Add to cart"}
        </motion.button>
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (!ready()) return;
          add(line);
          router.push("/checkout");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
      >
        <Zap className="size-5" /> Buy now — Secure advance payment
      </motion.button>

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-ink/5">
          <ShieldCheck className="mx-auto mb-1 size-5 text-brand" />
          {p.warrantyYears ? `${p.warrantyYears} year warranty` : "Quality assured"}
        </div>
        <div className="rounded-2xl bg-white p-3 ring-1 ring-ink/5">
          <Truck className="mx-auto mb-1 size-5 text-brand" />
          Free delivery in Delhi
        </div>
        <a href={site.phoneLinks[0]} className="rounded-2xl bg-white p-3 ring-1 ring-ink/5 transition hover:ring-brand">
          <PhoneCall className="mx-auto mb-1 size-5 text-brand" />
          Talk to an expert
        </a>
      </div>
    </div>
  );
}
