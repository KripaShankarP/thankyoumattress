import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, Factory, HeartHandshake, Ruler, ShieldCheck, Truck } from "lucide-react";
import { MattressHero } from "@/components/home/MattressHero";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { ShortsRail, YouTubeLite } from "@/components/Video";
import { Testimonials } from "@/components/Testimonials";
import { StackSection } from "@/components/StackSection";
import { Counter, Faq } from "@/components/Bits";
import { Aurora, Eyebrow, ScrollText } from "@/components/Motion";
import { faqs, site } from "@/data/site";
import { getCatalog } from "@/lib/api";
import { formatINR } from "@/lib/format";

const feels = [
  { title: "Firm & Orthopedic", desc: "Adonis · Coir", href: "/shop?feel=Firm", img: "/images/adonis/3.webp", span: "md:col-span-2 md:row-span-2" },
  { title: "Soft Memory Foam", desc: "Sink-in comfort", href: "/shop?feel=Soft", img: "/images/memory/3.webp", span: "" },
  { title: "Dual Comfort", desc: "Debonaire · Latexo", href: "/shop?feel=Dual+Comfort", img: "/images/debonaire/3.webp", span: "" },
  { title: "Hotel-style Springs", desc: "Bonnel · Pocket", href: "/product/spring-series", img: "/images/spring/3.webp", span: "" },
  { title: "For Little Ones", desc: "Baby crib mattress", href: "/product/baby-mattresses", img: "/images/baby/2.webp", span: "" },
  { title: "Pillows", desc: "Fibre · Memory · Latex", href: "/shop?category=pillow", img: "/images/pillows/cotton/2.webp", span: "md:col-span-2" },
  { title: "Natural Latex & Coir", desc: "Latexo · Coir sandwich", href: "/shop?q=latex", img: "/images/latexo/2.webp", span: "md:col-span-2" },
];

const perks = (deliveryPerPiece: number) => [
  { icon: ShieldCheck, title: "Up to 11 years warranty", text: "Real manufacturer warranty against defects." },
  { icon: Factory, title: "Factory-direct pricing", text: "No middlemen — straight from our Delhi factory." },
  { icon: Truck, title: "Free delivery in Delhi", text: `Doorstep delivery, carefully packed. ${formatINR(deliveryPerPiece)}/piece outside Delhi.` },
  { icon: Ruler, title: "Custom sizes", text: "Odd-sized beds, hotels, hospitals & builders." },
];

const tape = ["Orthopedic", "Memory Foam", "Pocket Spring", "Natural Latex", "Coir", "Baby Crib", "Pillows", "Custom Sizes"];

function SectionHead({ eyebrow, title, children, dark, center }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 font-display text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[0.95]">{title}</h2>
      {children}
    </Reveal>
  );
}

export default async function Home() {
  const { products, videos, settings } = await getCatalog();
  const featured = products.filter((p) => p.featured);
  const main = videos.find((v) => v.featured) ?? videos.find((v) => !v.short);
  const shorts = videos.filter((v) => v.short);

  return (
    <>
      <MattressHero />

      {/* Tape marquee */}
      <div className="relative z-10 -mt-8 overflow-hidden py-6">
        <div className="-rotate-[1.5deg] bg-gradient-to-r from-brand via-ember to-gold py-4 shadow-[0_20px_60px_-20px_rgba(54,81,212,0.7)]">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap" style={{ animationDuration: "35s" }}>
            {[...tape, ...tape, ...tape, ...tape].map((t, i) => (
              <span key={i} className="flex items-center gap-10 font-display text-2xl font-semibold uppercase tracking-tight text-white sm:text-3xl">
                {t}
                <span className="text-ink/70">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Each section pauses on screen, then the next one slides over it */}
      <div>
        {/* Statement + stats */}
        <StackSection className="bg-cream">
          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <Eyebrow>Our story in one line</Eyebrow>
            <ScrollText
              className="mt-8 font-display text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
              accent={["1995", "factory", "happily"]}
              text="Since 1995 we've been building mattresses in our own Delhi factory — so families across India can sleep happily and wake happily."
            />
            <Stagger className="mt-16 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { n: 1995, s: "", l: "Established in Delhi", plain: true },
                { n: 31, s: "+", l: "Years of trust" },
                { n: 10000, s: "+", l: "Pieces made every month" },
                { n: 11, s: " yrs", l: "Maximum warranty" },
              ].map((s, i) => (
                <StaggerItem
                  key={s.l}
                  className={
                    i === 2
                      ? "relative overflow-hidden rounded-[2rem] bg-night p-6 text-cream sm:p-8"
                      : "rounded-[2rem] bg-white p-6 ring-1 ring-ink/[0.06] sm:p-8"
                  }
                >
                  {i === 2 && <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-brand/50 blur-3xl" />}
                  <div className={`relative font-display text-4xl font-semibold tracking-tight sm:text-6xl ${i === 2 ? "text-gold" : ""}`}>
                    {s.plain ? s.n : <Counter to={s.n} suffix={s.s} />}
                  </div>
                  <div className={`relative mt-3 text-sm ${i === 2 ? "text-cream/60" : "text-ink-soft"}`}>{s.l}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </StackSection>

        {/* Shop by feel */}
        <StackSection className="bg-cream pt-20 lg:pt-28">
          <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:pb-32">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHead eyebrow="Shop by feel" title={<>How do <em className="text-gradient">you</em> like to sleep?</>} />
              <Link href="/shop" className="group flex shrink-0 items-center gap-3 font-semibold">
                View all products
                <span className="grid size-11 place-items-center rounded-full border border-ink/15 transition group-hover:rotate-[-45deg] group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </div>
            <Stagger className="mt-12 grid auto-rows-[240px] grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {feels.map((f, i) => (
                <StaggerItem key={f.title} className={f.span}>
                  <Link href={f.href} className="group relative block size-full overflow-hidden rounded-[2rem] bg-sand">
                    <Image src={f.img} alt={f.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-[1200ms] ease-out group-hover:scale-110" />
                    <span className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-transparent" />
                    <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 font-display text-xs font-semibold text-ink">0{i + 1}</span>
                    <span className="glass absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-[1.4rem] p-3 pl-4 transition duration-500 group-hover:bg-white">
                      <span className="min-w-0">
                        <span className="block truncate font-display text-lg font-semibold leading-tight text-ink">{f.title}</span>
                        <span className="block truncate text-xs text-ink-soft">{f.desc}</span>
                      </span>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-cream transition duration-500 group-hover:rotate-45 group-hover:bg-brand">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </StackSection>

        {/* Bestsellers */}
        <StackSection className="bg-white">
          <section className="relative py-24 lg:py-32">
            <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[500px] text-ink/60" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <SectionHead eyebrow="Hot sellers" title={<>Mattresses Delhi <em className="text-gradient">wakes up</em> happy on</>} />
                <p className="max-w-sm text-ink-soft">Our most-loved series, made for homes, hotels and hospitals across Delhi NCR.</p>
              </div>
              <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p, i) => (
                  <StaggerItem key={p.slug}>
                    <ProductCard p={p} priority={i < 3} />
                  </StaggerItem>
                ))}
              </Stagger>
              <div className="mt-14 flex justify-center">
                <Link href="/shop" className="group flex items-center gap-3 rounded-full bg-ink py-2 pl-7 pr-2 font-semibold text-cream transition hover:bg-brand">
                  Shop all {products.length} products
                  <span className="grid size-11 place-items-center rounded-full bg-white/10 transition group-hover:rotate-[-45deg] group-hover:bg-white group-hover:text-brand">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </StackSection>

        {/* Videos */}
        <StackSection className="bg-night">
          <section id="videos" className="grain relative scroll-mt-24 py-24 text-cream lg:py-32">
            <Aurora className="opacity-70" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
              <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div>
                  <SectionHead dark eyebrow="Watch & learn" title={<>Find the <em className="text-gradient">perfect</em> mattress for your sleep style.</>}>
                    <p className="mt-6 text-cream/60">
                      Spring, memory foam, orthopedic, latex or coir — our quick guide explains the difference so you can choose with
                      confidence. More stories on our YouTube channel.
                    </p>
                  </SectionHead>
                  <a
                    href={site.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 font-semibold text-ink transition hover:bg-gold"
                  >
                    Subscribe on YouTube
                    <span className="grid size-10 place-items-center rounded-full bg-brand text-white transition group-hover:rotate-[-45deg]">
                      <ArrowRight className="size-4" />
                    </span>
                  </a>
                </div>
                {main && (
                  <Reveal delay={0.15}>
                    <div className="ring-gradient rounded-[2.2rem] p-2">
                      <YouTubeLite video={main} className="shadow-[0_50px_120px_-30px_rgba(54,81,212,0.7)]" />
                    </div>
                  </Reveal>
                )}
              </div>
              <div className="mt-24">
                <h3 className="font-display text-4xl font-semibold">
                  Thankyou <em className="text-gradient">Shorts</em>
                </h3>
                <ShortsRail videos={shorts} dark />
              </div>
            </div>
          </section>
        </StackSection>

        {/* Why us — bento */}
        <StackSection className="bg-cream">
          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <SectionHead eyebrow="Why Thankyou" title={<>Customised comfort, <em className="text-gradient">for every age.</em></>}>
              <p className="mt-6 max-w-2xl text-lg text-ink-soft">
                Quality sleep is one of the most important aspects of a healthy life. From selection to delivery and beyond, we make
                mattress shopping hassle-free.
              </p>
            </SectionHead>
            <Stagger className="mt-14 grid gap-3 md:grid-cols-4">
              <StaggerItem className="relative min-h-[420px] overflow-hidden rounded-[2rem] md:col-span-2 md:row-span-3">
                <Image src="/images/about/machine.webp" alt="Thankyou Mattresses factory" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-cream">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Made in Najafgarh, New Delhi</p>
                  <p className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">Our own factory. Our own quality checks.</p>
                </div>
              </StaggerItem>
              {perks(settings.deliveryPerPiece).map((p, i) => (
                <StaggerItem
                  key={p.title}
                  className={`rounded-[2rem] p-6 transition duration-500 hover:-translate-y-1 ${i === 0 ? "bg-gradient-to-br from-brand to-ember text-white" : "bg-white ring-1 ring-ink/[0.06]"}`}
                >
                  <span className={`grid size-12 place-items-center rounded-2xl ${i === 0 ? "bg-white/20" : "bg-cream text-brand"}`}>
                    <p.icon className="size-6" />
                  </span>
                  <h3 className="mt-8 font-display text-xl font-semibold">{p.title}</h3>
                  <p className={`mt-1 text-sm ${i === 0 ? "text-white/80" : "text-ink-soft"}`}>{p.text}</p>
                </StaggerItem>
              ))}
              <StaggerItem className="flex flex-col gap-5 rounded-[2rem] bg-night p-6 text-cream sm:flex-row sm:items-center md:col-span-2">
                <div className="w-fit shrink-0 rounded-2xl bg-white p-2">
                  <Image src="/images/brand/trust.webp" alt="31 years of trust — since 1995" width={400} height={400} className="h-auto w-24" />
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {[
                    [BadgeCheck, "ISO 9001:2015"],
                    [Award, "MSME registered"],
                    [HeartHandshake, "Spinal Medic range"],
                  ].map(([Icon, t]) => {
                    const I = Icon as typeof BadgeCheck;
                    return (
                      <span key={t as string} className="glass-dark flex items-center gap-2 rounded-full px-3.5 py-2">
                        <I className="size-4 text-gold" /> {t as string}
                      </span>
                    );
                  })}
                </div>
              </StaggerItem>
            </Stagger>
          </section>
        </StackSection>

        {/* Testimonials */}
        <StackSection className="bg-sand">
          <section className="py-24 lg:py-32">
            <div className="mx-auto mb-14 max-w-7xl px-4 sm:px-6">
              <SectionHead center eyebrow="Testimonials" title={<>Loved by <em className="text-gradient">happy sleepers</em></>} />
            </div>
            <Testimonials />
          </section>
        </StackSection>

        {/* Bulk / custom CTA */}
        <StackSection className="bg-cream">
          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            <Reveal className="grain relative overflow-hidden rounded-[2.5rem] bg-night p-8 text-cream sm:p-16">
              <Aurora />
              <div className="bg-grid absolute inset-0 text-white/60" />
              <div className="relative grid items-center gap-10 md:grid-cols-[1.5fr_1fr]">
                <div>
                  <Eyebrow dark>Hotels · Hospitals · Builders</Eyebrow>
                  <h2 className="mt-5 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[0.95]">
                    Need custom sizes or <em className="text-gradient">bulk orders?</em>
                  </h2>
                  <p className="mt-5 max-w-xl text-cream/65">We manufacture up to 10,000 pieces a month and build to any size. Ask us for a factory quote.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/contact"
                    className="btn-shine group flex items-center justify-between gap-3 rounded-full bg-gradient-to-r from-brand to-ember py-2 pl-7 pr-2 font-semibold text-white"
                  >
                    Request a quote
                    <span className="grid size-11 place-items-center rounded-full bg-white text-brand transition group-hover:rotate-[-45deg]">
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                  <a href={site.phoneLinks[0]} className="glass-dark rounded-full px-7 py-4 text-center font-semibold transition hover:bg-white/10">
                    Call {site.phones[0]}
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        </StackSection>

        {/* FAQ */}
        <StackSection className="bg-cream pt-20 lg:pt-28" last>
          <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:pb-32">
            <div>
              <SectionHead eyebrow="FAQ" title={<>Questions, <em className="text-gradient">answered.</em></>}>
                <p className="mt-6 text-ink-soft">
                  Still unsure? Call us on{" "}
                  <a href={site.phoneLinks[0]} className="font-semibold text-ink underline decoration-brand underline-offset-4">
                    {site.phones[0]}
                  </a>{" "}
                  or drop a message on WhatsApp.
                </p>
              </SectionHead>
            </div>
            <Reveal delay={0.1}>
              <Faq items={faqs} />
            </Reveal>
          </section>
        </StackSection>
      </div>
    </>
  );
}
