"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { useCart } from "@/context/cart";

export function CouponBox() {
  const { cart, setCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  if (cart.coupon) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
        <span className="flex items-center gap-2 font-semibold">
          <Tag className="size-4" /> {cart.coupon} applied — {cart.couponPct}% off
        </span>
        <button onClick={() => setCoupon(null)} aria-label="Remove coupon">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const c = code.trim();
        if (!c) return;
        setChecking(true);
        try {
          const res = await fetch(`/api/coupons/${encodeURIComponent(c)}`);
          if (!res.ok) throw new Error();
          setCoupon(await res.json());
          setError("");
          setCode("");
        } catch {
          setError("This code isn't valid.");
        } finally {
          setChecking(false);
        }
      }}
    >
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Promo code (try WELCOME5)"
          className="min-w-0 flex-1 rounded-full border border-ink/15 px-4 py-2.5 text-sm uppercase outline-none focus:border-brand"
        />
        <button disabled={checking} className="rounded-full bg-ink px-5 text-sm font-semibold text-cream hover:bg-brand disabled:opacity-60">{checking ? "…" : "Apply"}</button>
      </div>
      {error && <p className="mt-1.5 pl-4 text-xs text-brand">{error}</p>}
    </form>
  );
}
