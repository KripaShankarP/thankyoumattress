"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BadgeCheck, Loader2, Lock, Smartphone } from "lucide-react";
import { useCart } from "@/context/cart";
import { showPhone, tenDigits, useCustomer } from "@/context/customer";
import { OrderSummary } from "@/components/OrderSummary";
import { errorMessage } from "@/lib/http";
import { cn, formatINR } from "@/lib/format";

type Field = { name: string; label: string; type?: string; placeholder?: string; full?: boolean; required?: boolean; inputMode?: "numeric" | "tel" | "email" };

const fields: Field[] = [
  { name: "name", label: "Full name", placeholder: "Your name", required: true },
  { name: "email", label: "Email (optional)", type: "email", placeholder: "you@example.com", full: true, inputMode: "email" },
  { name: "address", label: "Delivery address", placeholder: "House no., street, area, landmark", full: true, required: true },
  { name: "city", label: "City", placeholder: "New Delhi", required: true },
  { name: "pincode", label: "Pincode", placeholder: "110043", required: true, inputMode: "numeric" },
  { name: "notes", label: "Notes (optional)", placeholder: "Preferred delivery time, custom size request…", full: true },
];

export default function CheckoutPage() {
  const { lines, coupon, ready, clear, priceFor } = useCart();
  const { customer } = useCustomer();
  const router = useRouter();

  // Only signed-in customers (mobile verified by OTP) can order
  useEffect(() => {
    if (customer === null) router.replace("/login?next=/checkout");
  }, [customer, router]);
  // Advance payment only (UPI / bank transfer) — no cash on delivery
  const payment = "upi" as const;
  const [pincode, setPincode] = useState("");
  // Delivery number: fixed when they signed in with their mobile, asked for otherwise
  const [phone, setPhone] = useState<string | null>(null);
  const phoneValue = phone ?? customer?.phone ?? "";
  const [loading, setLoading] = useState(false);
  // Delivery charge depends on the pincode typed below
  const cart = priceFor(pincode);
  const noColour = cart.lines.filter((l) => l.needsColour);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const details = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, coupon: coupon?.code, customer: details }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        router.replace("/login?next=/checkout");
        return;
      }
      if (!res.ok) throw new Error(errorMessage(data));
      try {
        sessionStorage.setItem(
          "ty-last-order",
          JSON.stringify({ id: data.id, total: data.total, name: details.name, payment, items: cart.lines.map((l) => ({ name: l.name, qty: l.qty, image: l.image })) }),
        );
      } catch {}
      clear();
      router.push("/order-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!customer) {
    return (
      <section className="grid min-h-[50vh] place-items-center text-ink-soft">
        <Loader2 className="size-6 animate-spin" aria-label="Checking sign-in" />
      </section>
    );
  }

  if (ready && cart.lines.length === 0 && !loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl">Nothing to check out yet</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-brand px-8 py-4 font-semibold text-white">Browse products</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Checkout</h1>
      <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft"><Lock className="size-4" /> Your details are only used to deliver your order.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <form
          id="checkout"
          onSubmit={submit}
          onChange={(e) => {
            const t = e.target;
            if (t instanceof HTMLInputElement && t.name === "pincode") setPincode(t.value);
          }}
          className="space-y-8"
        >
          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
            <h2 className="font-display text-2xl">Delivery details</h2>
            {customer && (
              <p className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-900">
                <BadgeCheck className="size-4" /> Ordering as <b>{customer.name}</b> ·{" "}
                {customer.phoneVerified && customer.phone ? `${showPhone(customer.phone)} (verified)` : `${customer.email} (verified)`}
                <Link href="/account" className="ml-auto font-semibold underline-offset-4 hover:underline">My account</Link>
              </p>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {!customer.phoneVerified && (
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold">Mobile number for delivery</span>
                  <span className="flex items-stretch overflow-hidden rounded-2xl border border-ink/15 bg-cream/50 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                    <span className="grid place-items-center border-r border-ink/10 px-4 text-sm font-semibold text-ink-soft">+91</span>
                    <input
                      name="phone"
                      value={phoneValue}
                      onChange={(e) => setPhone(tenDigits(e.target.value))}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      title="Enter a 10-digit mobile number starting with 6, 7, 8 or 9"
                      required
                      className="w-full bg-transparent px-4 py-3 tabular-nums tracking-wider outline-none"
                    />
                  </span>
                  <span className="mt-1 block text-xs text-ink-soft">Our delivery team calls this number · {phoneValue.length}/10 digits</span>
                </label>
              )}
              {fields.map((f) => (
                <label key={f.name} className={cn("block", f.full && "sm:col-span-2")}>
                  <span className="mb-1.5 block text-sm font-semibold">{f.label}</span>
                  {f.name === "address" || f.name === "notes" ? (
                    <textarea
                      name={f.name}
                      required={f.required}
                      placeholder={f.placeholder}
                      rows={f.name === "address" ? 3 : 2}
                      className="w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                    />
                  ) : (
                    <input
                      name={f.name}
                      type={f.type ?? "text"}
                      required={f.required}
                      placeholder={f.placeholder}
                      inputMode={f.inputMode}
                      pattern={f.name === "pincode" ? "\\d{6}" : undefined}
                      maxLength={f.name === "pincode" ? 6 : undefined}
                      defaultValue={f.name === "name" ? customer?.name : f.name === "email" ? (customer?.email ?? undefined) : undefined}
                      className="w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/5 sm:p-8">
            <h2 className="font-display text-2xl">Payment</h2>
            <div className="mt-6 flex items-start gap-4 rounded-2xl border-2 border-brand bg-brand/5 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-white">
                <Smartphone className="size-5" />
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  Advance payment · UPI / Bank transfer
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Only option</span>
                </span>
                <span className="mt-1 block text-sm text-ink-soft">
                  After you place the order our team calls you with the UPI / bank details. Your mattress is dispatched once the payment is received.
                </span>
              </span>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
              <BadgeCheck className="size-4 text-brand" /> Cash on delivery is not available.
            </p>
          </div>

          <div className="space-y-3 lg:hidden">
            {cart.lines.map((l) => (
              <div key={l.name + l.size + l.model + l.thickness} className="flex items-center gap-3 text-sm">
                <Image src={l.image} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />
                <span className="flex-1">{l.name} × {l.qty}</span>
                <b>{formatINR(l.lineTotal)}</b>
              </div>
            ))}
          </div>
        </form>

        <OrderSummary
          pincode={pincode}
          cta={
            <>
              {error && (
                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-brand/10 px-4 py-3 text-sm font-medium text-brand" role="alert">
                  {error}
                </motion.p>
              )}
              {noColour.length > 0 && (
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200" role="alert">
                  Choose a cover colour for{" "}
                  {noColour.map((l, i) => (
                    <span key={l.slug + i}>
                      {i > 0 && ", "}
                      <Link href={`/product/${l.slug}`} className="font-semibold underline">
                        {l.name}
                      </Link>
                    </span>
                  ))}{" "}
                  — remove it from the cart and add it again with a colour.
                </div>
              )}
              <button
                form="checkout"
                disabled={loading || !ready || noColour.length > 0}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {loading && <Loader2 className="size-5 animate-spin" />}
                Place order · {formatINR(cart.total)}
              </button>
            </>
          }
        />
      </div>
    </section>
  );
}
