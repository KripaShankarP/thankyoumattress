import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { Counter } from "@/components/Bits";
import { YouTubeLite } from "@/components/Video";
import { site } from "@/data/site";
import { getCatalog } from "@/lib/api";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "About Us — Since 1995",
  description: "Thankyou Mattresses by Prestige Coir (India) Pvt. Ltd. — a trusted mattress manufacturer in New Delhi since 1995.",
};

const timeline = [
  { year: "1991", title: "Where it began", text: "The family started manufacturing latex rubber foam products — cushions, pillows, mattresses and bus seats." },
  { year: "1995", title: "Prestige Coir (India) Pvt. Ltd.", text: "The company was established, manufacturing rubberised coir mattresses, cushions, pillows, railway berths, bus seats and filters." },
  { year: "2013", title: "Rebonded foam", text: "We started manufacturing rebonded foam in-house, keeping pace with market demand and industry trends." },
  { year: "Today", title: "Direct to you", text: "After serving hotels, hostels, hospitals and railways, we now sell factory-direct to homes — Manufacturer to Consumer." },
];

const why = [
  "Deal directly with our factory’s efficient, experienced staff",
  "Perfect pre- and after-sales service",
  "Odd-sized mattresses made and delivered on time",
  "Every model in all sizes — plan your own mattress",
  "Breathe-easy, skin-friendly fabrics in many colours",
  "Special offers for institutional & bulk orders",
  "Long-relationship discounts and gifts",
  "All mattresses are reversible — both sides usable for longer life",
];

export default async function AboutPage() {
  const { videos } = await getCatalog();
  // The brand story video, or the first short if it was removed
  const story = videos.find((v) => v.youtubeId === "AHHp_ce8G_s") ?? videos.find((v) => v.short);
  return (
    <>
      <PageHero eyebrow="About us" title={<>Your trusted <em className="text-gradient">sleep partner</em> since 1995.</>} />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Quality products known for <em className="text-gradient">comfort, longevity</em> and reliability.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Based in New Delhi, Thankyou Mattresses manufactures quality products known for comfort, longevity and reliability.
            With an excellent manufacturing facility and deep industry expertise, we meet every demand on design, quality, cost
            and delivery — and we never stop improving.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src="/images/about/machine.webp" alt="Inside the Thankyou Mattresses factory" fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-4 overflow-hidden rounded-[1.6rem] bg-night p-5 text-cream shadow-2xl">
            <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-brand/60 blur-2xl" />
            <div className="relative font-display text-5xl text-gold"><Counter to={31} suffix="+" /></div>
            <div className="relative text-sm text-cream/70">years of trust</div>
          </div>
        </Reveal>
      </section>

      <section className="rounded-[3rem] bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-4xl">How it all started</h2>
          <div className="relative mt-12">
            <div className="absolute left-[19px] top-0 h-full w-0.5 bg-gradient-to-b from-brand via-gold to-transparent md:left-0 md:top-[19px] md:h-0.5 md:w-full md:bg-gradient-to-r" />
            <Stagger className="grid gap-10 md:grid-cols-4">
              {timeline.map((t) => (
                <StaggerItem key={t.year} className="relative pl-14 md:pl-0 md:pt-14">
                  <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full bg-brand text-xs font-bold text-white ring-8 ring-white">●</span>
                  <p className="font-display text-3xl text-brand">{t.year}</p>
                  <h3 className="mt-1 font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_380px]">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Why choose us</p>
          <h2 className="mt-3 font-display text-4xl">The Direct Marketing Network advantage</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {why.map((w) => (
              <li key={w} className="flex gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-ink/5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white"><Check className="size-3.5" /></span>
                {w}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto w-full max-w-[340px]">
          {story && <YouTubeLite video={story} />}
        </Reveal>
      </section>

      <section className="grain relative overflow-hidden rounded-[3rem] bg-night py-24 text-cream">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-4xl">Business overview</h2>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Managing Director", site.md],
              ["Business type", "Private Limited Company, Manufacturer"],
              ["Year of establishment", "1995"],
              ["Monthly production capacity", "10,000 pieces approx."],
              ["Registrations", site.registrations],
              ["Factory", site.address],
            ].map(([k, v]) => (
              <div key={k} className="bg-night p-6">
                <dt className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{k}</dt>
                <dd className="mt-2">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-3xl">
              <Image src="/images/about/portfolio.webp" alt="Mattress product portfolio" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-display text-3xl">Our product portfolio</h3>
              <p className="mt-3 text-cream/70">
                Rebonded foam, PU & HR foam, bonnel & pocket springs, rubber latex, rubberised coir and memory foam — and every
                combination in between. Fine fabrics, exclusive quilt patterns and mattresses that hold their shape for years.
              </p>
              <Link href="/shop" className="mt-6 w-fit rounded-full bg-gold px-7 py-3.5 font-semibold text-ink">Explore the range</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
