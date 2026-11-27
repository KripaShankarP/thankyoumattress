"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatINR } from "@/lib/format";
import { lineKey } from "@/lib/pricing";
import { OrderSummary } from "@/components/OrderSummary";

export default function CartPage() {
  const { cart, ready, setQty, remove } = useCart();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Your cart</h1>
      {!ready ? (
        <div className="mt-10 h-60 animate-pulse rounded-3xl bg-sand" />
      ) : cart.lines.length === 0 ? (
        <div className="mt-10 rounded-[2rem] bg-white p-16 text-center ring-1 ring-ink/5">
          <p className="font-display text-3xl">Your cart is sleeping 😴</p>
          <p className="mt-2 text-ink-soft">Add a mattress or pillow to get started.</p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-white">
            Start shopping <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {cart.lines.map((l) => {
                const k = lineKey(l);
                return (
                  <motion.li
                    key={k}
                    layout
                    exit={{ opacity: 0, x: -60 }}
                    className="flex gap-5 rounded-3xl bg-white p-4 ring-1 ring-ink/5 sm:p-5"
                  >
                    <Image src={l.image} alt={l.name} width={140} height={140} className="size-28 rounded-2xl object-cover sm:size-36" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div>
                          <Link href={`/product/${l.slug}`} className="font-display text-xl hover:text-brand">{l.name}</Link>
                          <p className="mt-1 text-sm text-ink-soft">
                            {[l.model !== l.name && l.model, l.comfort, l.colour && `${l.colour} colour`, l.thickness ? `${l.thickness} inch` : null, l.size !== "Standard" && `${l.size} in`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <button onClick={() => remove(k)} className="h-fit rounded-full p-2 text-ink-soft hover:bg-sand hover:text-brand" aria-label={`Remove ${l.name}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-ink/10">
                          <button onClick={() => setQty(k, l.qty - 1)} className="grid size-10 place-items-center" aria-label="Decrease quantity">
                            <Minus className="size-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{l.qty}</span>
                          <button onClick={() => setQty(k, l.qty + 1)} className="grid size-10 place-items-center" aria-label="Increase quantity">
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatINR(l.lineTotal)}</div>
                          {l.qty > 1 && <div className="text-xs text-ink-soft">{formatINR(l.unitPrice)} each</div>}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <OrderSummary cta={<Link href="/checkout" className="block rounded-full bg-brand py-4 text-center font-semibold text-white hover:bg-brand-dark">Proceed to checkout</Link>} />
        </div>
      )}
    </section>
  );
}
