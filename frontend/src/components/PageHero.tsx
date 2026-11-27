import { Aurora, Eyebrow } from "./Motion";
import { cn } from "@/lib/format";

/** Page header (dark, or light in the light theme) that slides up underneath the floating navbar */
export function PageHero({
  eyebrow,
  title,
  children,
  className,
  inner,
  adapt = true,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  inner?: string;
  /** Turn light in the light theme (off when the page below stays dark) */
  adapt?: boolean;
}) {
  return (
    <section className={cn(adapt && "theme-adapt", "grain relative -mt-[var(--header-h)] overflow-hidden rounded-b-[3rem] bg-night text-cream", className)}>
      <Aurora className="opacity-80" />
      <div className="bg-grid absolute inset-0 text-white/60" aria-hidden />
      <div className={cn("relative mx-auto max-w-7xl px-4 pb-20 pt-[calc(var(--header-h)+4rem)] sm:px-6 sm:pb-24 sm:pt-[calc(var(--header-h)+5rem)]", inner)}>
        <div className="animate-rise">
          <Eyebrow dark>{eyebrow}</Eyebrow>
        </div>
        <h1
          className="mt-6 max-w-4xl animate-rise font-display text-[clamp(2.8rem,7vw,6rem)] font-semibold leading-[0.92]"
          style={{ animationDelay: "0.1s" }}
        >
          {title}
        </h1>
        {children && (
          <div className="animate-rise" style={{ animationDelay: "0.25s" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
