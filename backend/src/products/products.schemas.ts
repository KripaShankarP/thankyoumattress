import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);
/** An optional text field: an empty string counts as "not set" */
const optText = (max: number) =>
  text(max)
    .optional()
    .transform((v) => v || undefined);

export const productInputSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes (e.g. royale-series)')
      .max(80),
    code: optText(20),
    name: text(120).min(2),
    category: z.enum(['MATTRESS', 'PILLOW']),
    tagline: text(200).min(2),
    description: z.array(text(2000).min(1)).max(20).default([]),
    features: z.array(text(120).min(1)).max(20).default([]),
    firmness: z.enum(['SOFT', 'MEDIUM', 'FIRM', 'DUAL_COMFORT']),
    warrantyYears: z.number().int().min(0).max(30).optional(),
    cloth: optText(120),
    badge: optText(40),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
    hasColours: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(100000).default(0),
    images: z.array(text(500).min(1)).max(30).default([]),
    /** Size labels in display order, e.g. ["72 x 30", "72 x 36"] */
    sizes: z.array(text(40).min(1)).min(1, 'Add at least one size').max(30),
    /** Price-list rows; `prices` lines up with `sizes` (null = not sold in that size) */
    variants: z
      .array(
        z.object({
          model: text(80).min(1),
          thickness: z.number().int().min(0).max(24),
          prices: z.array(z.number().int().min(1).max(10_000_000).nullable()),
        }),
      )
      .min(1, 'Add at least one price row')
      .max(40),
    constructions: z.array(z.object({ name: text(120).min(1), detail: text(1000).min(1) })).max(20).default([]),
    comfortOptions: z.array(text(80).min(1)).max(20).default([]),
    /** Colours offered; empty with hasColours = all active colours */
    colourIds: z.array(z.string().min(1)).max(50).default([]),
  })
  .superRefine((p, ctx) => {
    const dup = (list: string[]) => list.find((v, i) => list.indexOf(v) !== i);
    const size = dup(p.sizes);
    if (size) ctx.addIssue({ code: 'custom', path: ['sizes'], message: `Size "${size}" is listed twice` });
    const row = dup(p.variants.map((v) => `${v.model} · ${v.thickness}″`));
    if (row) ctx.addIssue({ code: 'custom', path: ['variants'], message: `Price row "${row}" is listed twice` });
    p.variants.forEach((v, i) => {
      if (v.prices.length !== p.sizes.length)
        ctx.addIssue({ code: 'custom', path: ['variants', i, 'prices'], message: 'Give one price (or blank) per size' });
      if (v.prices.every((x) => x === null))
        ctx.addIssue({ code: 'custom', path: ['variants', i, 'prices'], message: `"${v.model}" has no prices` });
    });
    const comfort = dup(p.comfortOptions);
    if (comfort) ctx.addIssue({ code: 'custom', path: ['comfortOptions'], message: `"${comfort}" is listed twice` });
  });
export type ProductInput = z.infer<typeof productInputSchema>;

export const listProductsSchema = z.object({
  q: text(80).optional(),
  category: z.enum(['MATTRESS', 'PILLOW']).optional(),
});
export type ListProducts = z.infer<typeof listProductsSchema>;
