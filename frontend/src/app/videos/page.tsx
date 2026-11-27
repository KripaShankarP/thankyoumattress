import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ShortsRail, YouTubeLite } from "@/components/Video";
import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";
import { getCatalog } from "@/lib/api";
import { BrandIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  title: "Videos",
  description: "Mattress guides, product walk-throughs and stories from the Thankyou Mattresses YouTube channel.",
};

export default async function VideosPage() {
  const { videos, products } = await getCatalog();
  const main = videos.find((v) => v.featured) ?? videos.find((v) => !v.short);
  const shorts = videos.filter((v) => v.short || v !== main);
  // One rail per product that has videos, then everything not tied to a product
  const groups = [
    ...products
      .map((p) => ({ title: p.name, list: shorts.filter((v) => v.product === p.slug) }))
      .filter((g) => g.list.length > 0),
    { title: "Brand & sleep stories", list: shorts.filter((v) => !v.product) },
  ].filter((g) => g.list.length > 0);
  return (
    <div className="grain relative -mt-[var(--header-h)] overflow-hidden bg-night pt-[var(--header-h)] text-cream">
      <PageHero eyebrow="Thankyou TV" title={<>Watch, learn &amp; <em className="text-gradient">sleep better.</em></>} className="rounded-none" inner="pb-0 sm:pb-0" adapt={false} />
      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        {main && (
          <Reveal delay={0.1} className="ring-gradient mt-12 rounded-[2.2rem] p-2">
            <YouTubeLite video={main} className="shadow-[0_40px_100px_-30px_rgba(54,81,212,0.6)]" />
          </Reveal>
        )}
        {groups.map((g) => (
          <div key={g.title} className="mt-20">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{g.title}</h2>
            <ShortsRail videos={g.list} dark />
          </div>
        ))}
        <div className="mt-16 text-center">
          <a
            href={site.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-brand to-ember px-8 py-4 font-semibold"
          >
            <BrandIcon name="youtube" className="size-5" /> Subscribe to @thankyoumattresses
          </a>
        </div>
      </section>
    </div>
  );
}
