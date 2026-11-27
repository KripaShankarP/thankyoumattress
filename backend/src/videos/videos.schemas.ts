import { z } from 'zod';
import { parseYouTubeId } from './youtube.js';

const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

export const videoInputSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    /** A YouTube link or id */
    youtube: optText(300),
    /** An uploaded file (from POST /admin/uploads) */
    fileUrl: optText(300),
    posterUrl: optText(300),
    isShort: z.boolean().default(false),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(100000).default(0),
    productId: optText(60),
  })
  .transform(({ youtube, ...v }, ctx) => {
    const youtubeId = youtube ? parseYouTubeId(youtube) : undefined;
    if (youtube && !youtubeId) {
      ctx.addIssue({ code: 'custom', path: ['youtube'], message: 'This is not a YouTube link' });
      return z.NEVER;
    }
    if (!youtubeId && !v.fileUrl) {
      ctx.addIssue({ code: 'custom', path: ['youtube'], message: 'Add a YouTube link or upload a video file' });
      return z.NEVER;
    }
    return { ...v, youtubeId };
  });
export type VideoInput = z.infer<typeof videoInputSchema>;
