"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/format";
import { warrantyChart } from "@/data/warranty";

function monthsBetween(a: Date, b: Date) {
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return m;
}

export function WarrantyCalculator() {
  const [years, setYears] = useState(11);
  const [date, setDate] = useState("");
  const [result, setResult] = useState<null | { months: number; charge: number | null }>(null);

  const calc = () => {
    if (!date) return;
    const months = monthsBetween(new Date(date), new Date());
    const model = warrantyChart.find((m) => m.years === years)!;
    const band = model.bands.find((b) => months < b.to);
    setResult({ months: Math.max(0, months), charge: band ? band.charge : null });
  };

  return (
    <div className="grid gap-8 rounded-[2rem] bg-white p-6 ring-1 ring-ink/5 sm:p-10 lg:grid-cols-2">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-gold-soft text-brand"><Calculator className="size-6" /></span>
          <h2 className="font-display text-3xl">Warranty calculator</h2>
        </div>
        <p className="mt-3 text-sm text-ink-soft">Check what a replacement would cost under our pro-rata guarantee.</p>
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">Your mattress model</p>
          <div className="flex flex-wrap gap-2">
            {warrantyChart.map((m) => (
              <button
                key={m.years}
                onClick={() => setYears(m.years)}
                className={cn("rounded-full border-2 px-4 py-2 text-sm font-semibold transition", years === m.years ? "border-brand bg-brand/5" : "border-ink/10")}
              >
                {m.years} years model
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">{warrantyChart.find((m) => m.years === years)!.models}</p>
        </div>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold">Purchase date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border border-ink/15 px-4 py-3 outline-none focus:border-brand"
          />
        </label>
        <button onClick={calc} disabled={!date} className="mt-6 rounded-full bg-brand px-7 py-3.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50">
          Calculate coverage
        </button>
      </div>
      <div className="grid place-items-center rounded-3xl bg-night p-8 text-center text-cream">
        {result ? (
          <motion.div key={`${result.months}-${years}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-sm uppercase tracking-widest text-gold">{result.months} months since purchase</p>
            {result.charge === null ? (
              <>
                <p className="mt-3 font-display text-4xl">Warranty expired</p>
                <p className="mt-2 text-cream/70">Your {years}-year warranty period has ended. Call us for an upgrade offer!</p>
              </>
            ) : result.charge === 0 ? (
              <>
                <p className="mt-3 font-display text-5xl text-gold">Free</p>
                <p className="mt-2 text-cream/70">Repair / replacement without charge (cover excluded).</p>
              </>
            ) : (
              <>
                <p className="mt-3 font-display text-6xl text-gold">{result.charge}%</p>
                <p className="mt-2 text-cream/70">of MRP chargeable for replacement under pro-rata warranty.</p>
              </>
            )}
          </motion.div>
        ) : (
          <p className="text-cream/60">Select your model and purchase date to see your coverage.</p>
        )}
      </div>
    </div>
  );
}
