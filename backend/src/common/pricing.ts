/**
 * Cart pricing. The same rules run in the browser (frontend/src/lib/pricing.ts) for display
 * and here for the bill that is saved — the server never trusts prices sent by a browser.
 */
import type { CatalogProduct, StoreSettings } from './catalog.types.js';

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

export type DeliveryZone = 'delhi' | 'outside' | 'unknown';
export type AppliedCoupon = { code: string; percent: number };

export const offerPrice = (mrp: number, offerPct: number) => Math.round((mrp * (100 - offerPct)) / 100);

export function mrpFor(p: CatalogProduct, model: string, thickness: number, size: string) {
  const row = p.priceRows.find((r) => r.model === model && r.thickness === thickness);
  const i = p.sizes.indexOf(size);
  const mrp = row && i >= 0 ? row.prices[i] : null;
  return mrp ?? undefined;
}

export function priceFor(p: CatalogProduct, model: string, thickness: number, size: string) {
  const mrp = mrpFor(p, model, thickness, size);
  return mrp === undefined ? undefined : offerPrice(mrp, p.offerPct);
}

export function deliveryZone(settings: StoreSettings, pincode?: string): DeliveryZone {
  const pin = pincode?.trim() ?? '';
  if (!/^\d{6}$/.test(pin)) return 'unknown';
  return settings.freePincodePrefixes.some((p) => pin.startsWith(p)) ? 'delhi' : 'outside';
}

/** Prices cart lines against the catalogue; unknown or invalid lines are dropped. */
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
  const shipping = zone === 'outside' ? pieces * settings.deliveryPerPiece : 0;
  // Listed prices exclude tax: GST is charged on the discounted goods + delivery
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
