"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { startingPrice } from "@/lib/pricing";
import type { CatalogProduct } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { cn, formatINR } from "@/lib/format";

const feels: CatalogProduct["firmness"][] = ["Soft", "Medium", "Firm", "Dual Comfort"];
const budgets = [
  { k: "u4", label: "Under ₹4,000", test: (n: number) => n < 4000 },
  { k: "4-6", label: "₹4,000 – ₹6,000", test: (n: number) => n >= 4000 && n <= 6000 },
  { k: "o6", label: "Above ₹6,000", test: (n: number) => n > 6000 },
];
const sorts = [
  { k: "popular", label: "Bestsellers first" },
  { k: "price-asc", label: "Price: low to high" },
  { k: "price-desc", label: "Price: high to low" },
  { k: "warranty", label: "Longest warranty" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
        active ? "border-ink bg-ink text-cream shadow-md" : "border-ink/10 bg-white hover:border-ink/30",
      )}
    >
      {children}
    </button>
  );
}

export function ShopClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { products } = useCatalog();

  const category = sp.get("category") ?? "";
  const feel = sp.get("feel") ?? "";
  const budget = sp.get("budget") ?? "";
  const sort = sp.get("sort") ?? "popular";
  const q = sp.get("q") ?? "";

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const list = useMemo(() => {
    const ql = q.toLowerCase().trim();
    const b = budgets.find((x) => x.k === budget);
    const out = products.filter(
      (p) =>
        (!category || p.category === category) &&
        (!feel || p.firmness === feel) &&
        (!b || b.test(startingPrice(p))) &&
        (!ql ||
          [p.name, p.tagline, p.code, ...(p.variants?.map((v) => v.name + " " + v.detail) ?? [])]
            .join(" ")
            .toLowerCase()
            .includes(ql)),
    );
    const sorted = [...out];
    if (sort === "price-asc") sorted.sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "price-desc") sorted.sort((a, b) => startingPrice(b) - startingPrice(a));
    if (sort === "warranty") sorted.sort((a, b) => (b.warrantyYears ?? 0) - (a.warrantyYears ?? 0));
    if (sort === "popular") sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return sorted;
  }, [category, feel, budget, sort, q, products]);

  const activeCount = [category, feel, budget, q].filter(Boolean).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="sticky top-[var(--header-h)] z-30 space-y-3 rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-[0_20px_50px_-30px_rgba(12,12,16,0.35)] backdrop-blur-2xl sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              defaultValue={q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Search memory foam, orthopedic, latex…"
              className="w-full rounded-full border border-transparent bg-cream py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </label>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-ink-soft" />
            <select
              value={sort}
              onChange={(e) => set("sort", e.target.value === "popular" ? "" : e.target.value)}
              className="rounded-full border border-transparent bg-cream px-4 py-3.5 text-sm font-medium outline-none focus:border-brand/40"
              aria-label="Sort products"
            >
              {sorts.map((s) => (
                <option key={s.k} value={s.k}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-wrap">
          <Chip active={!category} onClick={() => set("category", "")}>All</Chip>
          <Chip active={category === "mattress"} onClick={() => set("category", "mattress")}>Mattresses</Chip>
          <Chip active={category === "pillow"} onClick={() => set("category", "pillow")}>Pillows</Chip>
          <span className="mx-1 w-px shrink-0 bg-ink/15" />
          {feels.map((f) => (
            <Chip key={f} active={feel === f} onClick={() => set("feel", feel === f ? "" : f)}>
              {f}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-ink/15" />
          {budgets.map((b) => (
            <Chip key={b.k} active={budget === b.k} onClick={() => set("budget", budget === b.k ? "" : b.k)}>
              <span className="whitespace-nowrap">{b.label}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-ink-soft">
        <span>
          Showing <b className="text-ink">{list.length}</b> of {products.length} products
          {list.length > 0 && <> · from {formatINR(Math.min(...list.map(startingPrice)))}</>}
        </span>
        {activeCount > 0 && (
          <button onClick={() => router.replace(pathname, { scroll: false })} className="flex items-center gap-1 font-semibold text-brand">
            <X className="size-4" /> Clear filters
          </button>
        )}
      </div>

      <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35 }}
            >
              <ProductCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && (
        <div className="py-24 text-center">
          <p className="font-display text-4xl">No matches — <em className="text-gradient">yet.</em></p>
          <p className="mt-2 text-ink-soft">Try a different filter, or call us for a custom mattress.</p>
        </div>
      )}
    </section>
  );
}
