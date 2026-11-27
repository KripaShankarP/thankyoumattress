import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { getCatalog } from "@/lib/api";
import { site } from "@/data/site";
import { SocialIcons } from "./SocialIcons";
import { Aurora } from "./Motion";

export async function Footer() {
  const { products } = await getCatalog();
  const mattresses = products.filter((p) => p.category === "mattress");
  const pillows = products.filter((p) => p.category === "pillow");
  return (
    <footer className="grain relative overflow-hidden rounded-t-[3rem] bg-night text-cream/75">
      <Aurora className="opacity-40" />
      <div className="bg-grid absolute inset-0 text-white/50" />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-14 md:flex-row md:items-end">
          <h2 className="max-w-3xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-semibold leading-[0.92] text-cream">
            Sleep happily. <em className="text-gradient">Wake happily.</em>
          </h2>
          <Link href="/shop" className="group flex shrink-0 items-center gap-3 rounded-full bg-gold py-2 pl-7 pr-2 font-semibold text-ink transition hover:bg-white">
            Find your mattress
            <span className="grid size-11 place-items-center rounded-full bg-ink text-gold transition group-hover:rotate-[-45deg]">
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="inline-block rounded-2xl bg-white p-3">
              <Image src="/images/brand/wordmark.png" alt="Thankyou Mattresses" width={972} height={352} className="h-12 w-auto" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Crafting quality sleep solutions since {site.since}. We combine expertise with innovation to deliver customized
              comfort — for sound sleep and healthier lives.
            </p>
            <p className="mt-3 text-xs text-cream/50">From the house of {site.legalName}</p>
            <SocialIcons className="mt-6" />
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Mattresses</h3>
            <ul className="space-y-2 text-sm">
              {mattresses.map((p) => (
                <li key={p.slug}>
                  <Link href={`/product/${p.slug}`} className="transition hover:text-gold">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Pillows</h3>
            <ul className="space-y-2 text-sm">
              {pillows.map((p) => (
                <li key={p.slug}>
                  <Link href={`/product/${p.slug}`} className="transition hover:text-gold">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mb-4 mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/warranty-terms" className="hover:text-gold">Warranty policy</Link></li>
              <li><Link href="/contact" className="hover:text-gold">Contact us</Link></li>
              <li><a href={site.brochure} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Download catalogue</a></li>
            </ul>
          </div>
          <div className="space-y-4 text-sm lg:col-span-4">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Visit the factory</h3>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-gold">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {site.address}
            </a>
            {site.phones.map((p, i) => (
              <a key={p} href={site.phoneLinks[i]} className="flex items-center gap-3 hover:text-gold">
                <Phone className="size-4" /> {p}
              </a>
            ))}
            <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-gold">
              <Mail className="size-4" /> {site.email}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 py-6 text-xs text-cream/45 sm:flex-row">
          <p>© {site.since}–present Thankyou Mattresses. All rights reserved.</p>
          <p>{site.registrations}</p>
        </div>
      </div>
      <p
        aria-hidden
        className="pointer-events-none relative -mb-[0.2em] select-none bg-gradient-to-b from-white/20 via-white/[0.06] to-transparent bg-clip-text text-center font-display text-[23vw] font-bold leading-none tracking-[-0.06em] text-transparent"
      >
        Thankyou
      </p>
    </footer>
  );
}
