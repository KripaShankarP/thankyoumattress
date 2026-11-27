"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "@/context/cart";
import { useCatalog } from "@/context/catalog";
import { formatINR } from "@/lib/format";
import { lineKey } from "@/lib/pricing";
import { useEffect } from "react";

export function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, setQty, remove } = useCart();
  const { settings } = useCatalog();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-night/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside data-lenis-prevent
            role="dialog"
            aria-label="Shopping cart"
            className="fixed inset-y-2 right-2 z-[60] flex w-[calc(100%-1rem)] max-w-md flex-col overflow-hidden rounded-[2rem] bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="font-display text-2xl">Your cart</h2>
              <button onClick={() => setDrawerOpen(false)} className="grid size-10 place-items-center rounded-full bg-sand" aria-label="Close cart">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gold-soft px-6 py-2.5 text-sm font-medium">
              <Truck className="size-4 text-brand" /> Free delivery in Delhi · {formatINR(settings.deliveryPerPiece)}/piece outside
            </div>

            {cart.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="grid size-20 place-items-center rounded-full bg-sand">
                  <ShoppingBag className="size-8 text-ink-soft" />
                </div>
                <p className="font-display text-xl">Your cart is sleeping</p>
                <p className="text-sm text-ink-soft">Wake it up with something comfy.</p>
                <Link href="/shop" onClick={() => setDrawerOpen(false)} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-brand">
                  Browse mattresses
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  <AnimatePresence initial={false}>
                    {cart.lines.map((l) => {
                      const k = lineKey(l);
                      return (
                        <motion.li
                          key={k}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 60 }}
                          className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm"
                        >
                          <Image src={l.image} alt={l.name} width={88} height={88} className="size-22 rounded-xl object-cover" />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link href={`/product/${l.slug}`} onClick={() => setDrawerOpen(false)} className="font-semibold leading-tight hover:text-brand">
                                {l.name}
                              </Link>
                              <button onClick={() => remove(k)} className="text-ink-soft hover:text-brand" aria-label={`Remove ${l.name}`}>
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                            <p className="mt-0.5 text-xs text-ink-soft">
                              {[l.model !== l.name && l.model, l.comfort, l.colour, l.thickness ? `${l.thickness}″` : null, l.size !== "Standard" && `${l.size} in`]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center rounded-full border border-ink/10">
                                <button onClick={() => setQty(k, l.qty - 1)} className="grid size-8 place-items-center" aria-label="Decrease quantity">
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                                <button onClick={() => setQty(k, l.qty + 1)} className="grid size-8 place-items-center" aria-label="Increase quantity">
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <span className="font-semibold">{formatINR(l.lineTotal)}</span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                <div className="space-y-3 border-t border-ink/10 bg-white px-6 py-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Subtotal</span>
                    <span className="font-semibold">{formatINR(cart.subtotal)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Coupon {cart.coupon}</span>
                      <span>−{formatINR(cart.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">GST ({cart.gstPct}%)</span>
                    <span className="font-semibold">{formatINR(cart.gst)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatINR(cart.total)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-full bg-brand py-4 text-center font-semibold text-white transition hover:bg-brand-dark"
                  >
                    Checkout securely
                  </Link>
                  <Link href="/cart" onClick={() => setDrawerOpen(false)} className="block text-center text-sm font-medium underline-offset-4 hover:underline">
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
