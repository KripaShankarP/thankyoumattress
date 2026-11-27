/**
 * The public catalogue the website renders (GET /api/catalog).
 * Copy of backend/src/common/catalog.types.ts — keep the two in sync.
 */
export type Colour = { name: string; hex: string };

export interface PriceRow {
  model: string;
  /** inches, 0 for pillows */
  thickness: number;
  /** MRP per entry in `sizes` (same order); null = not available in that size */
  prices: (number | null)[];
}

export interface CatalogProduct {
  id: string;
  slug: string;
  code?: string;
  name: string;
  category: "mattress" | "pillow";
  tagline: string;
  description: string[];
  /** "What"s inside" explanations */
  variants: { name: string; detail: string }[];
  /** Comfort choices that don"t change the price */
  comfortOptions: string[];
  /** Cover colours to pick from (empty = no colour choice) */
  colours: Colour[];
  cover: string;
  images: string[];
  warrantyYears?: number;
  cloth?: string;
  firmness: "Soft" | "Medium" | "Firm" | "Dual Comfort";
  sizes: string[];
  priceRows: PriceRow[];
  features: string[];
  badge?: string;
  featured: boolean;
  /** Store-wide offer, copied here so price helpers need only the product */
  offerPct: number;
}

export interface CatalogVideo {
  id: string;
  title: string;
  youtubeId?: string;
  fileUrl?: string;
  posterUrl?: string;
  short: boolean;
  featured: boolean;
  /** slug of the related product */
  product?: string;
}

export interface StoreSettings {
  gstPct: number;
  offerPct: number;
  deliveryPerPiece: number;
  freePincodePrefixes: string[];
}

export interface Catalog {
  products: CatalogProduct[];
  videos: CatalogVideo[];
  settings: StoreSettings;
}
