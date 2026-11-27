"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/context/catalog";
import { lineKey, priceCart, type AppliedCoupon, type CartLine } from "@/lib/pricing";

type Cart = ReturnType<typeof priceCart>;

interface CartCtx {
  lines: CartLine[];
  cart: Cart;
  count: number;
  ready: boolean;
  coupon: AppliedCoupon | null;
  setCoupon: (c: AppliedCoupon | null) => void;
  /** Prices the cart for a delivery pincode (checkout) */
  priceFor: (pincode?: string) => Cart;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (o: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ty-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const { products, settings } = useCatalog();
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
        if (Array.isArray(saved.lines)) setLines(saved.lines);
        if (saved.coupon && typeof saved.coupon.code === "string") setCoupon(saved.coupon);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ lines, coupon }));
    } catch {}
  }, [lines, coupon, ready]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const k = lineKey(line);
      const existing = prev.find((l) => lineKey(l) === k);
      if (existing) return prev.map((l) => (lineKey(l) === k ? { ...l, qty: Math.min(20, l.qty + line.qty) } : l));
      return [...prev, line];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l)));
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)), []);
  const clear = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const priceFor = useCallback(
    (pincode?: string) => priceCart(products, settings, lines, coupon ?? undefined, pincode),
    [products, settings, lines, coupon],
  );
  const cart = useMemo(() => priceFor(), [priceFor]);
  const count = cart.lines.reduce((s, l) => s + l.qty, 0);

  return (
    <Ctx.Provider
      value={{ lines, cart, count, ready, coupon, setCoupon, priceFor, add, setQty, remove, clear, drawerOpen, setDrawerOpen }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
