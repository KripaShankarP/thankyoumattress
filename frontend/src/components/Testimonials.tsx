import { Quote, Star } from "lucide-react";
import { testimonials } from "@/data/site";

function Card({ t }: { t: (typeof testimonials)[number] }) {
  const initials = t.name.replace(/^(Mr|Mrs|Ms|Dr)\.\s*/, "").split(" ").map((s) => s[0]).slice(0, 2).join("");
  return (
    <figure className="flex w-[320px] shrink-0 flex-col rounded-[2rem] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(12,12,16,0.35)] ring-1 ring-ink/[0.05] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(54,81,212,0.35)] sm:w-[400px]">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 fill-gold text-gold" />
          ))}
        </div>
        <Quote className="size-9 fill-brand/10 text-brand/20" />
      </div>
      <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-ink/75">“{t.text}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/[0.06] pt-5">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand via-ember to-gold text-sm font-bold text-white shadow-md shadow-brand/30">{initials}</span>
        <span>
          <span className="block font-semibold">{t.name}</span>
          <span className="text-xs text-ink-soft">Happy customer</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const half = Math.ceil(testimonials.length / 2);
  const rows = [testimonials.slice(0, half), testimonials.slice(half)];
  return (
    <div className="space-y-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className="group flex overflow-hidden">
          <div
            className="flex w-max animate-marquee gap-5 pr-5 group-hover:[animation-play-state:paused]"
            style={{ animationDuration: r ? "70s" : "60s", animationDirection: r ? "reverse" : "normal" }}
          >
            {[...row, ...row].map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
