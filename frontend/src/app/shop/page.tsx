import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Suspense } from "react";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop Mattresses & Pillows",
  description: "Browse orthopedic, memory foam, spring, latex, coir & baby mattresses and pillows. Factory-direct prices with up to 11 years warranty.",
};

export default function ShopPage() {
  return (
    <>
      <PageHero eyebrow="The collection" title={<>Shop <em className="text-gradient">better sleep.</em></>}>
        <p className="mt-6 max-w-xl text-lg text-cream/60">Mattresses and pillows — every one made in our Delhi factory.</p>
      </PageHero>
      <Suspense fallback={<div className="mx-auto h-[60vh] max-w-7xl px-4 py-10 sm:px-6" />}>
        <ShopClient />
      </Suspense>
    </>
  );
}
