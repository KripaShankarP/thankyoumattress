import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { startingMrp, startingPrice } from "@/lib/pricing";
import type { CatalogProduct } from "@/lib/types";
import { discountPct, formatINR } from "@/lib/format";

export function ProductCard({ p, priority }: { p: CatalogProduct; priority?: boolean }) {
  const price = startingPrice(p);
  const mrp = startingMrp(p);
  const hover = p.images.find((i) => i !== p.cover);
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group relative flex h-full flex-col rounded-[2rem] bg-white p-2 shadow-[0_1px_2px_rgba(12,12,16,0.04),0_12px_40px_-20px_rgba(12,12,16,0.18)] ring-1 ring-ink/[0.06] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_40px_80px_-30px_rgba(54,81,212,0.45)] hover:ring-brand/20"
    >
      <div className="relative aspect-[4/3.6] overflow-hidden rounded-[1.6rem] bg-sand">
        <Image
          src={p.cover}
          alt={p.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-[900ms] ease-out group-hover:scale-110 group-hover:opacity-0"
        />
        {hover && (
          <Image
            src={hover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="scale-110 object-cover opacity-0 transition duration-[900ms] ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-night/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {mrp && (
            <span className="rounded-full bg-gradient-to-r from-brand to-ember px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-brand/30">
              −{discountPct(price, mrp)}%
            </span>
          )}
          {p.badge && <span className="glass rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">{p.badge}</span>}
        </div>
        {p.warrantyYears && (
          <span className="glass absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            <ShieldCheck className="size-3.5 text-brand" /> {p.warrantyYears}-yr warranty
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
          <span>{p.code ?? "Pillow"}</span>
          <span className="size-1 rounded-full bg-ink/25" />
          <span>{p.firmness}</span>
        </div>
        <h3 className="mt-1.5 font-display text-[1.35rem] font-semibold leading-tight">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{p.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <span className="text-[11px] text-ink/45">{p.category === "mattress" ? "Starts from" : "Per piece"}</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold tracking-tight">{formatINR(price)}</span>
              {mrp && <span className="text-sm text-ink/40 line-through">{formatINR(mrp)}</span>}
            </div>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-cream transition duration-500 group-hover:rotate-45 group-hover:bg-brand">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
