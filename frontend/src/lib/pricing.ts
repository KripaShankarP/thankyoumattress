/**
 * Cart pricing for display. The backend runs the same rules (backend/src/common/pricing.ts)
 * and its result is the bill that is saved — keep the two in sync.
 */
import type { CatalogProduct, StoreSettings } from "./types";

export interface CartLine {
  slug: string;
  model: string;
  thickness: number;
  size: string;
  comfort?: string;
  colour?: string;
  qty: number;
}

export interface PricedLine extends CartLine {
  name: string;
  image: string;
  unitPrice: number;
  lineTotal: number;
  /** A colour must still be chosen before this line can be ordered */
  needsColour: boolean;
}

export type DeliveryZone = "delhi" | "outside" | "unknown";
export type AppliedCoupon = { code: string; percent: number };

export const lineKey = (l: Omit<CartLine, "qty">) =>
  [l.slug, l.model, l.thickness, l.size, l.comfort ?? "", l.colour ?? ""].join("|");

export const offerPrice = (mrp: number, offerPct: number) => Math.round((mrp * (100 - offerPct)) / 100);

/** Official list price (MRP), or undefined when that combination isn't sold */
export function mrpFor(p: CatalogProduct, model: string, thickness: number, size: string) {
  const row = p.priceRows.find((r) => r.model === model && r.thickness === thickness);
  const i = p.sizes.indexOf(size);
  const mrp = row && i >= 0 ? row.prices[i] : null;
  return mrp ?? undefined;
}

/** Selling price after the store offer */
export function priceFor(p: CatalogProduct, model: string, thickness: number, size: string) {
  const mrp = mrpFor(p, model, thickness, size);
  return mrp === undefined ? undefined : offerPrice(mrp, p.offerPct);
}

/** Lowest MRP (shown struck through) */
export function startingMrp(p: CatalogProduct) {
  const all = p.priceRows.flatMap((r) => r.prices).filter((x): x is number => x !== null);
  return all.length ? Math.min(...all) : 0;
}

/** Lowest price the customer pays */
export function startingPrice(p: CatalogProduct) {
  return offerPrice(startingMrp(p), p.offerPct);
}

export function highestPrice(p: CatalogProduct) {
  const all = p.priceRows.flatMap((r) => r.prices).filter((x): x is number => x !== null);
  return all.length ? offerPrice(Math.max(...all), p.offerPct) : 0;
}

export function sizeLabel(size: string) {
  const [l, w] = size.split("x").map((s) => Number(s.trim()));
  if (!w) return size;
  if (l === 47) return "Crib";
  if (w <= 30) return "Single (Slim)";
  if (w <= 36) return "Single";
  if (w <= 48) return "Double / Diwan";
  if (w <= 60) return "Queen";
  return "King";
}

export function deliveryZone(settings: StoreSettings, pincode?: string): DeliveryZone {
  const pin = pincode?.trim() ?? "";
  if (!/^\d{6}$/.test(pin)) return "unknown";
  return settings.freePincodePrefixes.some((p) => pin.startsWith(p)) ? "delhi" : "outside";
}

export function priceCart(
  products: CatalogProduct[],
  settings: StoreSettings,
  lines: CartLine[],
  coupon?: AppliedCoupon,
  pincode?: string,
) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const priced: PricedLine[] = [];
  for (const l of lines) {
    const p = bySlug.get(l.slug);
    if (!p) continue;
    const unit = priceFor(p, l.model, l.thickness, l.size);
    if (unit === undefined) continue;
    const qty = Math.max(1, Math.min(20, Math.floor(Number(l.qty) || 1)));
    if (l.comfort && !p.comfortOptions.includes(l.comfort)) continue;
    if (l.colour && !p.colours.some((c) => c.name === l.colour)) continue;
    priced.push({
      ...l,
      qty,
      name: p.name,
      image: p.cover,
      unitPrice: unit,
      lineTotal: unit * qty,
      needsColour: p.colours.length > 0 && !l.colour,
    });
  }
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const couponPct = coupon?.percent ?? 0;
  const discount = Math.round((subtotal * couponPct) / 100);
  const pieces = priced.reduce((s, l) => s + l.qty, 0);
  const zone = deliveryZone(settings, pincode);
  const shipping = zone === "outside" ? pieces * settings.deliveryPerPiece : 0;
  const taxable = subtotal - discount + shipping;
  const gst = Math.round((taxable * settings.gstPct) / 100);
  return {
    lines: priced,
    subtotal,
    coupon: coupon && couponPct ? coupon.code : undefined,
    couponPct,
    discount,
    pieces,
    zone,
    shipping,
    gstPct: settings.gstPct,
    gst,
    total: taxable + gst,
  };
}

export type PricedCart = ReturnType<typeof priceCart>;
