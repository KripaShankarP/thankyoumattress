"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, PhoneCall } from "lucide-react";
import { site } from "@/data/site";
import { formatINR } from "@/lib/format";

type LastOrder = { id: string; total: number; name: string; payment: string; items: { name: string; qty: number; image: string }[] };

export default function OrderSuccess() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ty-last-order");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only storage after mount
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 rounded-full bg-gold/30 blur-[140px]" />
      <div className="relative mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="mx-auto grid size-24 place-items-center rounded-full bg-brand text-white shadow-2xl shadow-brand/40"
        >
          <Check className="size-12" strokeWidth={3} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 font-display text-5xl">
          Thank you{order?.name ? `, ${String(order.name).split(" ")[0]}` : ""}!
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 text-lg text-ink-soft">
          Your order has been placed. Our team will call you shortly to confirm delivery and share the UPI / bank details for your advance payment.
        </motion.p>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 rounded-[2rem] bg-white p-6 text-left ring-1 ring-ink/5">
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Order ID</span>
              <b className="font-mono">{order.id}</b>
            </div>
            <ul className="mt-4 space-y-3 border-t border-ink/10 pt-4">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <Image src={i.image} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />
                  <span className="flex-1">{i.name}</span>
                  <span>× {i.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </motion.div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="rounded-full bg-ink px-8 py-4 font-semibold text-cream hover:bg-brand">Continue shopping</Link>
          <a href={site.phoneLinks[0]} className="flex items-center gap-2 rounded-full border-2 border-ink/15 px-6 py-3.5 font-semibold hover:border-brand">
            <PhoneCall className="size-4" /> {site.phones[0]}
          </a>
        </div>
      </div>
    </section>
  );
}
