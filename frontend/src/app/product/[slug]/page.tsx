import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { getCatalog, getProduct } from "@/lib/api";
import { highestPrice, offerPrice, sizeLabel, startingPrice } from "@/lib/pricing";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { ShortsRail, YouTubeLite } from "@/components/Video";
import { Aurora, Eyebrow } from "@/components/Motion";
import { formatINR } from "@/lib/format";
import { Gallery } from "./Gallery";
import { BuyBox } from "./BuyBox";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name}${p.code ? ` [${p.code}]` : ""} — from ${formatINR(startingPrice(p))}`,
    description: [p.tagline, p.description[0]].filter(Boolean).join(". "),
    openGraph: { images: [p.cover] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const { products, videos, settings } = await getCatalog();
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();

  const related = products.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 4);
  const productVideos = videos.filter((v) => v.product === p.slug);
  const guide = videos.find((v) => v.featured) ?? videos.find((v) => !v.short);
  const moreVideos = productVideos.length ? productVideos : videos.filter((v) => v.short).slice(0, 6);
  const isMattress = p.category === "mattress";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images.map((i) => `https://www.thankyoumattresses.com${i}`),
    description: p.description.join(" "),
    brand: { "@type": "Brand", name: "Thankyou Mattresses" },
    sku: p.code ?? p.slug,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: startingPrice(p),
      highPrice: highestPrice(p),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <nav className="flex items-center gap-1 text-sm text-ink-soft" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/shop" className="hover:text-brand">Shop</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-ink">{p.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
          <Gallery images={p.images} name={p.name} />
        </div>
        <div>
          <Reveal y={16}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
              {p.code && <span className="theme-fixed rounded-full bg-ink px-3 py-1 text-gold">{p.code}</span>}
              <span className="rounded-full bg-sand px-3 py-1">{p.firmness} feel</span>
              {p.badge && <span className="rounded-full bg-brand px-3 py-1 text-white">{p.badge}</span>}
            </div>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{p.name}</h1>
            <p className="mt-2 text-lg text-ink-soft">{p.tagline}</p>
          </Reveal>

          <ul className="mt-6 grid grid-cols-2 gap-2">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 shrink-0 text-brand" /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <BuyBox slug={p.slug} />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="mt-10 rounded-t-[3rem] bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>About this {p.category}</Eyebrow>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl">Crafted for the way <em className="text-gradient">you sleep</em></h2>
            <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
              {p.description.map((d) => (
                <p key={d}>{d}</p>
              ))}
            </div>
            {(p.warrantyYears || p.cloth) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {p.warrantyYears && (
                  <span className="flex items-center gap-2 rounded-2xl bg-gold-soft px-4 py-3 text-sm font-semibold">
                    <ShieldCheck className="size-5 text-brand" /> {p.warrantyYears} years warranty
                  </span>
                )}
                {p.cloth && (
                  <span className="flex items-center gap-2 rounded-2xl bg-sand px-4 py-3 text-sm font-semibold">
                    <Layers className="size-5 text-brand" /> {p.cloth}
                  </span>
                )}
              </div>
            )}
          </Reveal>
          {p.variants && (
            <Reveal delay={0.1}>
              <Eyebrow>Variants &amp; construction</Eyebrow>
              <ol className="mt-6 space-y-3">
                {p.variants.map((v, i) => (
                  <li key={v.name} className="flex gap-4 rounded-[1.6rem] bg-cream p-5 transition hover:bg-gold-soft">
                    <span className="font-display text-3xl text-gradient">0{i + 1}</span>
                    <span>
                      <span className="block font-semibold">{v.name}</span>
                      <span className="text-sm text-ink-soft">{v.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </div>

        {isMattress && (
          <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
            <Reveal>
              <h2 className="font-display text-3xl">Size & price chart</h2>
              <p className="mt-1 text-sm text-ink-soft">All sizes in inches (L × W). Prices in ₹, {settings.gstPct}% GST extra. Struck-through price is the MRP; you pay the offer price above it. Custom sizes available on request.</p>
              <div className="mt-6 overflow-x-auto rounded-[2rem] ring-1 ring-ink/10">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="bg-ink text-left text-cream">
                      <th className="px-4 py-3 font-semibold">Model</th>
                      <th className="px-4 py-3 font-semibold">Thickness</th>
                      {p.sizes.map((s) => (
                        <th key={s} className="px-4 py-3 text-right font-semibold">
                          {s}
                          <span className="block text-[10px] font-normal text-cream/60">{sizeLabel(s)}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.priceRows.map((r, i) => (
                      <tr key={i} className="border-t border-ink/5 odd:bg-cream/60 hover:bg-gold-soft">
                        <td className="px-4 py-3 font-semibold">{r.model}</td>
                        <td className="px-4 py-3">{r.thickness}″</td>
                        {r.prices.map((pr, j) => (
                          <td key={j} className="px-4 py-3 text-right tabular-nums">
                            {pr === null ? (
                              <span className="text-ink-soft">—</span>
                            ) : (
                              <>
                                {formatINR(offerPrice(pr, p.offerPct))}
                                <span className="block text-[11px] text-ink-soft line-through">{formatINR(pr)}</span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        )}
      </section>

      {/* Videos */}
      <section className="grain relative overflow-hidden rounded-[3rem] bg-night py-24 text-cream">
        <Aurora className="opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Eyebrow dark>See it in action</Eyebrow>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl">
            {productVideos.length ? `${p.name} on video` : "Videos from Thankyou Mattresses"}
          </h2>
          {isMattress && guide && (
            <div className="mt-10 max-w-4xl">
              <YouTubeLite video={guide} />
            </div>
          )}
          <div className="mt-10">
            <ShortsRail videos={moreVideos} dark />
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-4xl sm:text-5xl">You may also <em className="text-gradient">like</em></h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((r) => (
            <ProductCard key={r.slug} p={r} />
          ))}
        </div>
      </section>
    </>
  );
}
