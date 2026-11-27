import type { Category, Firmness } from '../generated/prisma/enums.js';
import type { CatalogProduct, CatalogVideo, Colour } from '../common/catalog.types.js';

export const categoryOut = (c: Category) => (c === 'MATTRESS' ? 'mattress' : 'pillow') as CatalogProduct['category'];

const FIRMNESS: Record<Firmness, CatalogProduct['firmness']> = {
  SOFT: 'Soft',
  MEDIUM: 'Medium',
  FIRM: 'Firm',
  DUAL_COMFORT: 'Dual Comfort',
};
export const firmnessOut = (f: Firmness) => FIRMNESS[f];

/** The relations CatalogService loads for every product */
export const productInclude = {
  images: { orderBy: { sortOrder: 'asc' } },
  sizes: { orderBy: { sortOrder: 'asc' } },
  variants: { orderBy: { sortOrder: 'asc' }, include: { prices: true } },
  constructions: { orderBy: { sortOrder: 'asc' } },
  comfortOptions: { orderBy: { sortOrder: 'asc' } },
  colours: { include: { colour: true } },
} as const;

type ProductRow = {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  category: Category;
  tagline: string;
  description: string[];
  features: string[];
  firmness: Firmness;
  warrantyYears: number | null;
  cloth: string | null;
  badge: string | null;
  featured: boolean;
  hasColours: boolean;
  images: { url: string }[];
  sizes: { id: string; label: string }[];
  variants: { model: string; thickness: number; prices: { sizeId: string; mrp: number }[] }[];
  constructions: { name: string; detail: string }[];
  comfortOptions: { name: string }[];
  colours: { colour: { name: string; hex: string; active: boolean; sortOrder: number } }[];
};

export function toCatalogProduct(p: ProductRow, allColours: Colour[], offerPct: number): CatalogProduct {
  const own = p.colours
    .map((c) => c.colour)
    .filter((c) => c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ name, hex }) => ({ name, hex }));
  const images = p.images.map((i) => i.url);
  return {
    id: p.id,
    slug: p.slug,
    code: p.code ?? undefined,
    name: p.name,
    category: categoryOut(p.category),
    tagline: p.tagline,
    description: p.description,
    variants: p.constructions.map(({ name, detail }) => ({ name, detail })),
    comfortOptions: p.comfortOptions.map((c) => c.name),
    colours: p.hasColours ? (own.length ? own : allColours) : [],
    cover: images[0] ?? '/images/brand/logo.png',
    images: images.length ? images : ['/images/brand/logo.png'],
    warrantyYears: p.warrantyYears ?? undefined,
    cloth: p.cloth ?? undefined,
    firmness: firmnessOut(p.firmness),
    sizes: p.sizes.map((s) => s.label),
    priceRows: p.variants.map((v) => ({
      model: v.model,
      thickness: v.thickness,
      prices: p.sizes.map((s) => v.prices.find((pr) => pr.sizeId === s.id)?.mrp ?? null),
    })),
    features: p.features,
    badge: p.badge ?? undefined,
    featured: p.featured,
    offerPct,
  };
}

export function toCatalogVideo(v: {
  id: string;
  title: string;
  youtubeId: string | null;
  fileUrl: string | null;
  posterUrl: string | null;
  isShort: boolean;
  featured: boolean;
  product: { slug: string } | null;
}): CatalogVideo {
  return {
    id: v.id,
    title: v.title,
    youtubeId: v.youtubeId ?? undefined,
    fileUrl: v.fileUrl ?? undefined,
    posterUrl: v.posterUrl ?? undefined,
    short: v.isShort,
    featured: v.featured,
    product: v.product?.slug,
  };
}
