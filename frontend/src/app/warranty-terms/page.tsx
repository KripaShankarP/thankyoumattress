import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { WarrantyCalculator } from "./WarrantyCalculator";
import { warrantyChart } from "@/data/warranty";

export const metadata: Metadata = {
  title: "Warranty Policy",
  description: "Pro-rata warranty for Thankyou Mattresses — 5, 7 and 11 year models. Check your coverage with our warranty calculator.",
};

const terms = [
  "The warranty is limited to the purchase value of the mattress.",
  "The Company will not in any way be responsible for damage, injury or hardship faced by the user after choosing any particular model of mattress.",
  "The warranty period on a replaced product is automatically reduced to the balance period, computed from the date of first sale.",
  "The company can repair or replace the inside block of the mattress. The decision taken by its staff shall be final.",
  "Product features, specifications & warranty terms are subject to change without notice.",
  "The customer will give reasonable time to staff for inspection of the mattress if required by the company.",
  "Presentation of the warranty card & bill is a pre-condition for any warranty claim.",
  "The mattress is to be brought to and taken from the manufacturer’s nominated place at the customer’s cost, or cartage can be arranged by the company at a mutually agreed cost.",
  "No discount shall be given, as in the original purchase, at the time of a replacement given after the stipulated period.",
  "Disputes shall be settled amicably in the best interest of both parties; otherwise subject to the jurisdiction of consumer / Delhi courts only.",
];

const notCovered = [
  "Outer cloth cover of the mattress, due to its nature.",
  "Defects caused by normal wear & tear, mishandling, or alteration by anybody other than the company.",
  "Structural defects due to an improper mattress size vis-à-vis bed size.",
  "Normal sagging within tolerance — up to 25% of mattress thickness — caused by body weight taking its shape.",
];

export default function WarrantyPage() {
  return (
    <>
      <PageHero eyebrow="Warranty policy" title={<>Protected for up to <em className="text-gradient">11 years.</em></>}>
        <p className="mt-6 flex max-w-2xl gap-3 text-lg text-cream/60">
          <ShieldCheck className="mt-1 size-6 shrink-0 text-gold" />
          Sleep comfortably knowing your investment is protected. We’ve been manufacturing mattresses for over thirty years —
          designed to give your spine and body complete support, year after year.
        </p>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <WarrantyCalculator />
        </Reveal>

        <Reveal className="mt-16">
          <h2 className="font-display text-3xl">Pro-rata guarantee</h2>
          <p className="mt-3 max-w-3xl text-ink-soft">
            Repair / replacement without charge if the complaint is reported within the stipulated period for each model (mattress
            cover excluded). Beyond that, a pro-rated charge applies for the period the product has been in use. MRP applicable at
            the time of replacement.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {warrantyChart.map((m) => (
              <div key={m.years} className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink/5">
                <div className="bg-ink px-6 py-4 font-display text-2xl text-cream">
                  {m.years} years model
                  <span className="block font-sans text-xs text-cream/60">{m.models}</span>
                </div>
                <ul className="divide-y divide-ink/5">
                  {m.bands.map((b) => (
                    <li key={b.to} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                      <span className="text-ink-soft">{b.from === 0 ? "Up to" : `${b.from}–`}{b.to} months</span>
                      <span className={`rounded-full px-3 py-1 font-semibold ${b.charge === 0 ? "bg-green-100 text-green-800" : "bg-sand"}`}>
                        {b.charge === 0 ? "Free" : `${b.charge}% of MRP`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl">Terms of warranty</h2>
            <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink-soft marker:font-bold marker:text-brand">
              {terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl">Not covered</h2>
            <ul className="mt-6 space-y-3">
              {notCovered.map((t) => (
                <li key={t} className="flex gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-ink/5">
                  <AlertTriangle className="size-5 shrink-0 text-brand" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-gold-soft p-5 text-sm">
              <b>Important:</b> Please retain your original purchase bill and warranty card — they are required for any warranty claim.
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
