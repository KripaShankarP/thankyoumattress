import { Sparkles } from "lucide-react";

const items = [
  "Special Festival Offer — Flat 50% OFF",
  "Extra 5% off with code WELCOME5",
  "Up to 11 years warranty",
  "Free delivery in Delhi",
  "31 years of trust · Since 1995",
  "ISO 9001:2015 certified manufacturer",
  "Custom sizes for hotels, hospitals & homes",
];

export function AnnouncementBar() {
  const row = [...items, ...items];
  return (
    <div className="relative z-[51] overflow-hidden bg-night py-2 text-[12px] font-medium tracking-wide text-cream/75">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            <Sparkles className="size-3 text-gold" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
