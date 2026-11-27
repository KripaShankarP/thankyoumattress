"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { errorMessage } from "@/lib/http";

const input =
  "w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";

export function EnquiryForm({ product }: { product?: string }) {
  const { products } = useCatalog();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");
    const form = e.currentTarget;
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    }).catch(() => null);
    if (res?.ok) {
      setState("done");
      form.reset();
    } else {
      setError(res ? errorMessage(await res.json().catch(() => null), "Couldn't send. Please call us instead.") : "Couldn't send. Please call us instead.");
      setState("idle");
    }
  }

  return (
    <AnimatePresence mode="wait">
      {state === "done" ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 rounded-3xl bg-green-50 p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-green-600" />
          <p className="mt-3 font-display text-2xl">Thank you!</p>
          <p className="text-ink-soft">We’ve received your message and will call you back soon.</p>
          <button onClick={() => setState("idle")} className="mt-4 text-sm font-semibold underline">Send another</button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <input name="name" required placeholder="Your name" className={input} />
          <input
            name="phone"
            required
            type="tel"
            inputMode="numeric"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            title="Enter a 10-digit mobile number"
            placeholder="10-digit mobile number"
            onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10))}
            className={input}
          />
          <input name="email" type="email" placeholder="Email (optional)" className={`${input} sm:col-span-2`} />
          <select name="product" defaultValue={product ?? ""} className={`${input} sm:col-span-2`}>
            <option value="">Interested in… (optional)</option>
            {products.map((p) => (
              <option key={p.slug} value={p.name}>{p.name}</option>
            ))}
            <option value="Bulk / custom order">Bulk / custom order</option>
          </select>
          <textarea name="message" rows={4} placeholder="Your message, size requirement or question" className={`${input} sm:col-span-2`} />
          {error && <p className="text-sm font-medium text-brand sm:col-span-2" role="alert">{error}</p>}
          <button
            disabled={state === "loading"}
            className="flex items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:col-span-2"
          >
            {state === "loading" ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-4" />} Send message
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
