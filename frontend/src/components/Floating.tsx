"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, X } from "lucide-react";
import { site } from "@/data/site";
import { BrandIcon } from "./SocialIcons";

export function WhatsAppButton() {
  return (
    <motion.a
      href={`${site.whatsapp}?text=${encodeURIComponent("Hi Thankyou Mattresses, I'd like to know more about your mattresses.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-900/30"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <BrandIcon name="whatsapp" className="relative size-7" />
    </motion.a>
  );
}

const SEEN = "ty-offer-seen";

/** Festive offer popup, shown once per browser session after a short delay */
export function OfferPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 7000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-night/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-label="Special offer"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="grain relative w-full max-w-md overflow-hidden rounded-[2rem] bg-night p-8 text-center text-cream"
          >
            <div className="absolute -top-20 left-1/2 size-60 -translate-x-1/2 rounded-full bg-brand/40 blur-3xl" />
            <button onClick={close} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/10" aria-label="Close offer">
              <X className="size-4" />
            </button>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.6 }}
              className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-gold text-ink"
            >
              <Gift className="size-8" />
            </motion.div>
            <p className="relative mt-5 text-xs font-bold uppercase tracking-[0.3em] text-gold">Special festival offer</p>
            <p className="relative mt-2 font-display text-5xl leading-none">
              FLAT <span className="text-gradient">50%</span> OFF
            </p>
            <p className="relative mt-3 text-sm text-cream/70">
              Factory-direct prices on every mattress. Use code <b className="text-gold">WELCOME5</b> for an extra 5% off at checkout.
            </p>
            <Link href="/shop" onClick={close} className="relative mt-6 inline-block rounded-full bg-brand px-8 py-3.5 font-semibold transition hover:bg-brand-dark">
              Shop the sale
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
