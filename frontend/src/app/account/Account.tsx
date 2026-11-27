"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, LogOut, Mail, Package, Pencil, Phone, Smartphone } from "lucide-react";
import { showPhone, tenDigits, useCustomer } from "@/context/customer";
import { site } from "@/data/site";
import { cn, formatINR } from "@/lib/format";
import { errorMessage } from "@/lib/http";

type Order = {
  orderNo: string;
  createdAt: string;
  status: "NEW" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  name: string;
  address: string;
  city: string;
  pincode: string;
  subtotal: number;
  discount: number;
  shipping: number;
  gst: number;
  total: number;
  paid: number;
  items: { productName: string; productSlug: string; image: string; model: string; thickness: number; size: string; comfort: string | null; colour: string | null; qty: number; lineTotal: number }[];
};

const STEPS = ["NEW", "CONFIRMED", "DISPATCHED", "DELIVERED"] as const;
const LABEL: Record<Order["status"], string> = { NEW: "Order placed", CONFIRMED: "Confirmed", DISPATCHED: "On the way", DELIVERED: "Delivered", CANCELLED: "Cancelled" };

const date = (d: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

export function Account() {
  const router = useRouter();
  const { customer, setCustomer, signOut } = useCustomer();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");

  useEffect(() => {
    if (customer === null) router.replace("/login?next=/account");
  }, [customer, router]);

  useEffect(() => {
    if (!customer) return;
    let live = true;
    fetch("/api/customer/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => live && setOrders(d))
      .catch(() => live && setOrders([]));
    return () => {
      live = false;
    };
  }, [customer]);

  if (!customer) return <div className="grid h-[50vh] place-items-center text-ink-soft"><Loader2 className="size-6 animate-spin" /></div>;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    setError("");
    const res = await fetch("/api/customer/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(f.get("name") ?? ""),
        // only the contact they didn't sign in with can be edited here
        ...(customer!.emailVerified ? {} : { email: String(f.get("email") ?? "") }),
        ...(customer!.phoneVerified ? {} : { phone: phoneDraft }),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    if (!res?.ok) return setError(errorMessage(data, "Couldn't save. Please try again."));
    setCustomer(data.customer);
    setEditing(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <aside className="h-fit space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
        <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/5">
          <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-ember font-display text-3xl text-white">
            {customer.name.slice(0, 1).toUpperCase()}
          </span>
          {editing ? (
            <form onSubmit={save} className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-soft">Name</span>
                <input name="name" defaultValue={customer.name} required minLength={2} maxLength={80} className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3.5 py-2.5 outline-none focus:border-brand" />
              </label>
              {!customer.emailVerified && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-soft">Email (optional)</span>
                  <input name="email" type="email" defaultValue={customer.email ?? ""} maxLength={120} className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3.5 py-2.5 outline-none focus:border-brand" />
                </label>
              )}
              {!customer.phoneVerified && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-soft">Mobile number (10 digits)</span>
                  <input
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(tenDigits(e.target.value))}
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    title="10-digit mobile number"
                    placeholder="10-digit number"
                    className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3.5 py-2.5 tabular-nums outline-none focus:border-brand"
                  />
                </label>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button disabled={saving} className="flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-full px-4 text-sm font-semibold text-ink-soft">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="mt-4 font-display text-3xl">{customer.name}</h1>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Smartphone className="size-4 text-ink-soft" />
                  {customer.phone ? showPhone(customer.phone) : <span className="text-ink-soft">No mobile number yet</span>}
                  {customer.phoneVerified && <BadgeCheck className="size-4 text-green-600" aria-label="Verified" />}
                </li>
                <li className="flex items-center gap-2 break-all">
                  <Mail className="size-4 shrink-0 text-ink-soft" />
                  {customer.email ?? <span className="text-ink-soft">No email yet</span>}
                  {customer.emailVerified && <BadgeCheck className="size-4 shrink-0 text-green-600" aria-label="Verified" />}
                </li>
              </ul>
              <button
                onClick={() => {
                  setPhoneDraft(customer.phone ?? "");
                  setEditing(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                <Pencil className="size-3.5" /> Edit profile
              </button>
            </>
          )}
        </div>
        <a href={site.phoneLinks[0]} className="flex items-center gap-3 rounded-[1.5rem] bg-white p-4 text-sm ring-1 ring-ink/5 hover:ring-brand">
          <Phone className="size-4 text-brand" /> Help with an order? Call {site.phones[0]}
        </a>
        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-ink-soft ring-1 ring-ink/10 hover:text-ink"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>

      <div>
        <h2 className="font-display text-3xl">My orders</h2>
        {orders === null ? (
          <div className="grid h-40 place-items-center text-ink-soft"><Loader2 className="size-6 animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-[2rem] bg-white p-10 text-center ring-1 ring-ink/5">
            <Package className="mx-auto size-10 text-ink-soft" />
            <p className="mt-3 font-semibold">No orders yet</p>
            <Link href="/shop" className="mt-5 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">Browse mattresses</Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-5">
            {orders.map((o) => {
              const step = STEPS.indexOf(o.status as (typeof STEPS)[number]);
              return (
                <li key={o.orderNo} className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold">{o.orderNo}</p>
                      <p className="text-xs text-ink-soft">Placed {date(o.createdAt)} · {o.city} {o.pincode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl">{formatINR(o.total)}</p>
                      <p className={cn("text-xs font-semibold", o.status === "CANCELLED" ? "text-ink-soft" : o.paid >= o.total ? "text-green-700" : "text-amber-700")}>
                        {o.status === "CANCELLED" ? "" : o.paid >= o.total ? "Paid" : o.paid > 0 ? `Paid ${formatINR(o.paid)}` : "Advance payment pending"}
                      </p>
                    </div>
                  </div>

                  {o.status === "CANCELLED" ? (
                    <p className="mt-4 rounded-2xl bg-sand px-4 py-2.5 text-sm font-semibold text-ink-soft">This order was cancelled.</p>
                  ) : (
                    <ol className="mt-5 grid grid-cols-4 gap-2">
                      {STEPS.map((s, i) => (
                        <li key={s}>
                          <span className={cn("block h-1.5 rounded-full", i <= step ? "bg-brand" : "bg-ink/10")} />
                          <span className={cn("mt-1.5 block text-[11px] font-semibold sm:text-xs", i <= step ? "text-ink" : "text-ink-soft")}>{LABEL[s]}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <ul className="mt-5 divide-y divide-ink/5">
                    {o.items.map((it, k) => (
                      <li key={k} className="flex items-center gap-4 py-3">
                        <Image src={it.image} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <Link href={`/product/${it.productSlug}`} className="font-semibold hover:text-brand">{it.productName}</Link>
                          <p className="text-xs text-ink-soft">
                            {[it.model !== it.productName && it.model, it.thickness ? `${it.thickness}″` : null, it.size !== "Standard" && `${it.size} in`, it.comfort, it.colour && `${it.colour} cover`].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <span className="text-sm">× {it.qty}</span>
                        <span className="w-20 text-right text-sm font-semibold">{formatINR(it.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-ink-soft">Deliver to {o.name}, {o.address}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
