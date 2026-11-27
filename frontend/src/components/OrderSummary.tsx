"use client";

import { ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/cart";
import { useCatalog } from "@/context/catalog";
import { formatINR } from "@/lib/format";
import { CouponBox } from "./CouponBox";

/** Pass `pincode` (checkout) to include the delivery charge for that address */
export function OrderSummary({ cta, pincode }: { cta?: React.ReactNode; pincode?: string }) {
  const { cart: base, priceFor } = useCart();
  const { settings } = useCatalog();
  const cart = pincode === undefined ? base : priceFor(pincode);
  return (
    <aside className="h-fit space-y-4 rounded-[2rem] bg-white p-6 ring-1 ring-ink/5 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
      <h2 className="font-display text-2xl">Order summary</h2>
      <CouponBox />
      <dl className="space-y-2 border-t border-ink/10 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd className="font-semibold">{formatINR(cart.subtotal)}</dd>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-green-700">
            <dt>Coupon {cart.coupon} ({cart.couponPct}%)</dt>
            <dd>−{formatINR(cart.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-soft">Delivery</dt>
          <dd className="text-right font-semibold">
            {cart.zone === "outside" ? (
              <>
                {formatINR(cart.shipping)}
                <span className="block text-xs font-normal text-ink-soft">
                  {cart.pieces} × {formatINR(settings.deliveryPerPiece)} (outside Delhi)
                </span>
              </>
            ) : cart.zone === "delhi" ? (
              <span className="text-green-700">Free (Delhi)</span>
            ) : (
              <span className="text-ink-soft">Enter pincode</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">GST ({cart.gstPct}%)</dt>
          <dd className="font-semibold">{formatINR(cart.gst)}</dd>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-3 text-lg font-bold">
          <dt>Total</dt>
          <dd className="text-right">
            {formatINR(cart.total)}
            <span className="block text-[11px] font-medium text-ink-soft">incl. GST</span>
          </dd>
        </div>
      </dl>
      {cta}
      <div className="space-y-2 pt-2 text-xs text-ink-soft">
        <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand" /> Manufacturer warranty on every mattress</p>
        <p className="flex items-center gap-2"><Truck className="size-4 text-brand" /> Free delivery in Delhi · {formatINR(settings.deliveryPerPiece)}/piece outside Delhi</p>
      </div>
    </aside>
  );
}
