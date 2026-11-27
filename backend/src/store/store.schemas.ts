import { z } from 'zod';

export const settingsSchema = z.object({
  gstPct: z.number().int().min(0).max(40),
  offerPct: z.number().int().min(0).max(90),
  deliveryPerPiece: z.number().int().min(0).max(100_000),
  freePincodePrefixes: z
    .array(z.string().trim().regex(/^\d{1,6}$/, 'Use the first 1–6 digits of a pincode, e.g. 110'))
    .max(50),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const colourSchema = z.object({
  name: z.string().trim().min(1).max(40),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a colour like #2c4a9a'),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(100000).default(0),
});
export type ColourInput = z.infer<typeof colourSchema>;

const date = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: 'custom', message: 'Invalid date' });
      return z.NEVER;
    }
    return d;
  });

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, 'Use 3–30 letters or numbers, e.g. WELCOME5'),
    percent: z.number().int().min(1).max(90),
    active: z.boolean().default(true),
    validFrom: date,
    validTo: date,
    maxUses: z.number().int().min(1).optional(),
  })
  .refine((c) => !c.validFrom || !c.validTo || c.validFrom <= c.validTo, {
    path: ['validTo'],
    message: 'End date is before the start date',
  });
export type CouponInput = z.infer<typeof couponSchema>;
