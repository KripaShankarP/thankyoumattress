"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, ChevronDown, CornerDownLeft, Menu, Phone, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { useCustomer } from "@/context/customer";
import { startingPrice } from "@/lib/pricing";
import { site } from "@/data/site";
import { useCart } from "@/context/cart";
import { cn, formatINR } from "@/lib/format";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Header logo height: compact on phones, the real site's 124px once there's room */
const LOGO = "h-10 w-auto min-[380px]:h-11 sm:h-12 lg:h-[88px] xl:h-[96px] wide:h-[124px]";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop", mega: true },
  { href: "/videos", label: "Videos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Routes whose first section is the hero that slides under the navbar */
const DARK_TOP = ["/", "/shop", "/videos", "/about", "/contact", "/warranty-terms"];
/** Heroes that stay dark in the light theme, so the transparent navbar must stay dark over them */
const ALWAYS_DARK_TOP = ["/videos"];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const { count, setDrawerOpen } = useCart();
  const { scrollY } = useScroll();
  const { products } = useCatalog();
  const { customer } = useCustomer();

  // Compact on scroll; hide while scrolling down, reveal on scroll up
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    // Only a clear move changes it: smooth scrolling ends in sub-pixel steps that mustn't flip it back
    if (y <= 320 || y < prev - 2) setHidden(false);
    else if (y > prev + 2 && !mega) setHidden(true);
  });

  // Close menus on navigation — reacting to an external (router) change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobile(false);
    setMega(false);
    setSearch(false);
  }, [pathname]);

  // ⌘K / Ctrl+K / "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mattresses = products.filter((p) => p.category === "mattress");
  const pillows = products.filter((p) => p.category === "pillow");
  const solid = scrolled || mega || !DARK_TOP.includes(pathname);
  const adapt = solid || !ALWAYS_DARK_TOP.includes(pathname);
  const isActive = (href: string, isMega?: boolean) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href) || (!!isMega && pathname.startsWith("/product"));

  return (
    <motion.header
      className={cn("theme-fixed sticky top-0 z-50 h-[var(--header-h)] px-3 pt-3 sm:px-5", adapt && "theme-adapt")}
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseLeave={() => {
        setMega(false);
        setHovered(null);
      }}
    >
      <div
        className={cn(
          "ring-gradient relative mx-auto flex h-[4.5rem] max-w-[96rem] items-center gap-3 rounded-full pl-4 pr-2.5 text-cream transition-all duration-500 sm:pl-6 lg:h-[6.5rem] lg:rounded-[2.25rem] xl:h-[7.5rem] wide:h-[8.5rem]",
          solid
            ? "bg-night/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
            : "bg-white/[0.04] backdrop-blur-md",
        )}
      >
        {/* Same pair as thankyoumattresses.com: the "Sleep Happily · Wake Happily" girl logo + the wordmark, 124px tall on wide screens */}
        <Link href="/" className="relative flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Thankyou Mattresses home">
          <Image src="/images/brand/logo5-light.png" alt="" aria-hidden width={1000} height={669} priority className={cn("logo-on-dark", LOGO)} />
          <Image src="/images/brand/logo5.png" alt="" aria-hidden width={1000} height={669} priority className={cn("logo-on-light", LOGO)} />
          <Image src="/images/brand/wordmark-light.png" alt="Thankyou Mattresses" width={972} height={352} priority className={cn("logo-on-dark", LOGO)} />
          <Image src="/images/brand/wordmark.png" alt="" aria-hidden width={972} height={352} priority className={cn("logo-on-light", LOGO)} />
        </Link>

        <nav
          className="mx-auto hidden items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-inset ring-white/10 xl:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {nav.map((n) => {
            const active = isActive(n.href, n.mega);
            return (
              <Link
                key={n.href}
                href={n.href}
                onMouseEnter={() => {
                  setHovered(n.href);
                  setMega(!!n.mega);
                }}
                className={cn(
                  "relative flex items-center gap-1 rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors duration-300 2xl:px-5",
                  active ? "text-ink" : "text-cream/70 hover:text-cream",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-cream shadow-[0_6px_20px_-6px_rgba(242,181,58,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {hovered === n.href && !active && (
                  <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/10" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{n.label}</span>
                {n.mega && <ChevronDown className={cn("relative size-3.5 transition-transform duration-300", mega && "rotate-180")} />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
          <button
            onClick={() => setSearch(true)}
            className="group hidden h-12 w-12 items-center justify-center gap-2 rounded-full bg-white/[0.06] text-sm 2xl:w-auto 2xl:justify-start 2xl:pl-3.5 2xl:pr-2 text-cream/60 ring-1 ring-inset ring-white/10 transition hover:bg-white/10 hover:text-cream md:flex"
            aria-label="Search products"
          >
            <Search className="size-4" />
            <span className="hidden 2xl:inline">Search</span>
            <kbd className="hidden rounded-md bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-cream/60 2xl:inline">Ctrl K</kbd>
          </button>
          <button onClick={() => setSearch(true)} className="hidden size-11 place-items-center rounded-full bg-white/[0.06] sm:grid sm:size-12 md:hidden" aria-label="Search products">
            <Search className="size-[18px]" />
          </button>
          <ThemeToggle className="hidden sm:grid" />
          <Link
            href={customer ? "/account" : "/login"}
            aria-label={customer ? `My account (${customer.name})` : "Sign in"}
            title={customer ? "My account" : "Sign in"}
            className="hidden size-12 place-items-center rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/10 transition hover:bg-white/10 sm:grid"
          >
            {customer ? (
              <span className="keep-white grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-ember text-sm font-bold text-white">{customer.name.slice(0, 1).toUpperCase()}</span>
            ) : (
              <UserRound className="size-[18px]" />
            )}
          </Link>
          <a
            href={site.phoneLinks[0]}
            className="group relative hidden size-12 place-items-center rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/10 transition hover:bg-white/10 md:grid"
            aria-label={`Call ${site.phones[0]}`}
          >
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-emerald-400 ring-2 ring-night" />
            <Phone className="size-4 text-gold" />
            <span className="pointer-events-none absolute right-0 top-full mt-3 whitespace-nowrap rounded-xl bg-cream px-3 py-2 text-xs font-semibold text-ink opacity-0 shadow-xl transition group-hover:opacity-100">
              Call us · {site.phones[0]}
            </span>
          </a>
          <button
            onClick={() => setDrawerOpen(true)}
            className="keep-white btn-shine group relative flex h-11 items-center gap-2 rounded-full sm:h-12 bg-gradient-to-r from-[#f2b53a] to-[#f7d27a] pl-4 pr-1.5 text-sm font-semibold text-[#0b1226] shadow-[0_10px_30px_-10px_rgba(242,181,58,0.8)] transition hover:shadow-[0_14px_36px_-8px_rgba(242,181,58,0.95)]"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBag className="size-[18px] transition group-hover:-rotate-12" />
            <span className="hidden sm:inline">Cart</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="grid size-8 place-items-center rounded-full bg-[#0b1226] text-xs font-bold text-[#f2b53a]"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </button>
          <button className="grid size-11 place-items-center rounded-full bg-white/[0.06] sm:size-12 xl:hidden" onClick={() => setMobile(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mega menu: a sibling of the bar, not inside it — the bar's backdrop-filter would keep this panel's blur from reaching the page */}
      <div className="relative mx-auto max-w-[96rem]">
        <AnimatePresence>
          {mega && (
            <motion.div
              // no `filter` here: a filtered parent turns off the panel's backdrop blur, and the page showed through
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 hidden origin-top pt-3 xl:block"
            >
              <div className="ring-gradient grid grid-cols-12 gap-6 rounded-[2rem] bg-night/90 p-6 text-cream shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] backdrop-blur-3xl backdrop-saturate-150">
                <div className="col-span-7">
                  <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">Mattress collection</p>
                  <div className="grid grid-cols-3 gap-1">
                    {mattresses.map((p) => (
                      <Link key={p.slug} href={`/product/${p.slug}`} className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/[0.07]">
                        <Image src={p.cover} alt="" width={56} height={56} className="size-12 rounded-xl object-cover transition group-hover:scale-105" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{p.name}</span>
                          <span className="text-xs text-cream/50">from {formatINR(startingPrice(p))}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">Pillows</p>
                  <ul className="space-y-0.5">
                    {pillows.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/product/${p.slug}`} className="block rounded-xl px-2 py-1.5 text-sm font-medium text-cream/70 transition hover:bg-white/[0.07] hover:text-cream">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/shop" className="keep-white group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-ember p-5 text-white">
                  <span className="absolute -right-10 -top-10 size-40 rounded-full bg-gold/40 blur-3xl transition group-hover:bg-gold/70" />
                  <span className="relative flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Factory direct</span>
                    <span className="grid size-9 place-items-center rounded-full bg-white/20 transition group-hover:rotate-45 group-hover:bg-white group-hover:text-brand">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </span>
                  <span className="relative mt-10 font-display text-3xl font-semibold leading-[1.05]">
                    Shop all <em>{products.length}</em> products
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SearchPalette open={search} onClose={() => setSearch(false)} />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobile(false)}
            />
            <motion.aside
              data-lenis-prevent
              className="grain fixed inset-2 z-50 flex flex-col overflow-y-auto rounded-[2rem] bg-night p-6 text-cream xl:hidden"
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand/40 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Image src="/images/brand/logo5-light.png" alt="" aria-hidden width={1000} height={669} className="logo-on-dark h-14 w-auto" />
                  <Image src="/images/brand/logo5.png" alt="" aria-hidden width={1000} height={669} className="logo-on-light h-14 w-auto" />
                  <Image src="/images/brand/wordmark-light.png" alt="Thankyou Mattresses" width={972} height={352} className="logo-on-dark h-14 w-auto" />
                  <Image src="/images/brand/wordmark.png" alt="" aria-hidden width={972} height={352} className="logo-on-light h-14 w-auto" />
                </span>
                <span className="ml-auto mr-2 flex gap-2">
                  <button
                    onClick={() => {
                      setMobile(false);
                      setSearch(true);
                    }}
                    className="grid size-11 place-items-center rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/10"
                    aria-label="Search products"
                  >
                    <Search className="size-[18px]" />
                  </button>
                  <ThemeToggle />
                </span>
                <button onClick={() => setMobile(false)} className="grid size-11 place-items-center rounded-full bg-white/10" aria-label="Close menu">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="relative mt-10">
                {nav.map((n, i) => (
                  <motion.div key={n.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + 0.05 * i }}>
                    <Link
                      href={n.href}
                      className={cn(
                        "flex items-center justify-between border-b border-white/10 py-4 font-display text-4xl font-semibold",
                        isActive(n.href, n.mega) && "text-gold",
                      )}
                    >
                      {n.label}
                      <ArrowUpRight className="size-6 text-cream/40" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <Link href={customer ? "/account" : "/login"} className="relative mt-6 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                <UserRound className="size-5 text-gold" />
                <span className="font-semibold">{customer ? `My account · ${customer.name}` : "Sign in / My orders"}</span>
                <ArrowUpRight className="ml-auto size-5 text-cream/40" />
              </Link>
              <p className="relative mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/50">Mattresses</p>
              <div className="relative mt-3 flex flex-wrap gap-2">
                {mattresses.map((p) => (
                  <Link key={p.slug} href={`/product/${p.slug}`} className="rounded-full border border-white/15 px-3.5 py-2 text-sm text-cream/80">
                    {p.name}
                  </Link>
                ))}
              </div>
              <a href={site.phoneLinks[0]} className="keep-white relative mt-auto flex items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-white">
                <Phone className="size-4" /> Call {site.phones[0]}
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ───────────────────────── Search ───────────────────────── */

function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { products } = useCatalog();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return products.filter((p) => p.featured).slice(0, 6);
    return products.filter((p) => `${p.name} ${p.tagline} ${p.category} ${p.firmness} ${p.badge ?? ""}`.toLowerCase().includes(t)).slice(0, 8);
  }, [q, products]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ("");
    setSel(0);
    const t = setTimeout(() => input.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  const goTo = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[70] flex items-start justify-center bg-night/70 px-4 pt-[12vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-label="Search products"
            className="ring-gradient w-full max-w-xl overflow-hidden rounded-[1.75rem] bg-night-2/95 text-cream shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
            initial={{ y: -20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5">
              <Search className="size-5 text-gold" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSel((s) => Math.min(s + 1, results.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSel((s) => Math.max(s - 1, 0));
                  }
                  if (e.key === "Enter" && results[sel]) goTo(results[sel].slug);
                }}
                placeholder="Search mattresses & pillows…"
                className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-cream/35"
              />
              <kbd className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-cream/50">ESC</kbd>
            </div>
            <p className="px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/40">{q.trim() ? `${results.length} results` : "Popular"}</p>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {results.map((p, i) => (
                <li key={p.slug}>
                  <button
                    onMouseEnter={() => setSel(i)}
                    onClick={() => goTo(p.slug)}
                    className={cn("flex w-full items-center gap-3 rounded-2xl p-2 text-left transition", sel === i ? "bg-white/[0.08]" : "")}
                  >
                    <Image src={p.cover} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.name}</span>
                      <span className="block truncate text-xs text-cream/50">{p.tagline}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-gold">{formatINR(startingPrice(p))}</span>
                    <CornerDownLeft className={cn("size-4 shrink-0 text-cream/40 transition", sel === i ? "opacity-100" : "opacity-0")} />
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="px-4 py-10 text-center text-cream/50">No products match “{q}”. Try “memory”, “ortho” or “pillow”.</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
