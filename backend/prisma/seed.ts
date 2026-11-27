/**
 * Fills an empty database with the original catalogue and the first admin.
 * Safe to run again: it only adds what is missing and never overwrites admin edits.
 *
 *   npm run db:seed
 */
import 'dotenv/config';
import { PasswordHasher } from '@nestjs/authentication';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { Firmness } from '../src/generated/prisma/enums.js';
import { colours, coupons, products, videos } from './seed-data.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const FIRMNESS: Record<string, Firmness> = { Soft: 'SOFT', Medium: 'MEDIUM', Firm: 'FIRM', 'Dual Comfort': 'DUAL_COMFORT' };

async function main() {
  await prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1, gstPct: 18, offerPct: 50, deliveryPerPiece: 500, freePincodePrefixes: ['110'] } });

  for (const [i, c] of colours.entries()) {
    await prisma.colour.upsert({ where: { name: c.name }, update: {}, create: { ...c, sortOrder: i } });
  }
  for (const c of coupons) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  let added = 0;
  for (const [order, p] of products.entries()) {
    if (await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true } })) continue;
    const images = [p.cover, ...p.images.filter((u) => u !== p.cover)];
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          slug: p.slug,
          code: p.code ?? null,
          name: p.name,
          category: p.category === 'mattress' ? 'MATTRESS' : 'PILLOW',
          tagline: p.tagline,
          description: p.description,
          features: p.features,
          firmness: FIRMNESS[p.firmness],
          warrantyYears: p.warrantyYears ?? null,
          cloth: p.cloth ?? null,
          badge: p.badge ?? null,
          featured: p.featured ?? false,
          hasColours: p.category === 'mattress',
          sortOrder: order * 10,
          images: { create: images.map((url, i) => ({ url, sortOrder: i })) },
          constructions: { create: (p.variants ?? []).map((v, i) => ({ ...v, sortOrder: i })) },
          comfortOptions: { create: (p.comfortOptions ?? []).map((name, i) => ({ name, sortOrder: i })) },
        },
      });
      const sizes = await tx.productSize.createManyAndReturn({
        data: p.sizes.map((label, i) => ({ productId: product.id, label, sortOrder: i })),
      });
      for (const [i, row] of p.priceRows.entries()) {
        await tx.productVariant.create({
          data: {
            productId: product.id,
            model: row.model,
            thickness: row.thickness,
            sortOrder: i,
            prices: { create: row.prices.map((mrp, s) => ({ mrp, sizeId: sizes[s].id })) },
          },
        });
      }
    });
    added++;
  }

  // Videos: each linked to its product (by the video's own product, or the product that lists it)
  const slugToId = new Map((await prisma.product.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]));
  const existing = new Set((await prisma.video.findMany({ select: { youtubeId: true } })).map((v) => v.youtubeId));
  let videosAdded = 0;
  for (const [i, v] of videos.entries()) {
    if (existing.has(v.id)) continue;
    const slug = v.product ?? products.find((p) => p.videoIds?.includes(v.id))?.slug;
    await prisma.video.create({
      data: {
        title: v.title,
        youtubeId: v.id,
        isShort: v.short,
        featured: !v.short && i === 0,
        sortOrder: i * 10,
        productId: (slug && slugToId.get(slug)) || null,
      },
    });
    videosAdded++;
  }

  // First admin, from ADMIN_EMAIL / ADMIN_PASSWORD
  let admin = 'kept existing admins';
  if ((await prisma.adminUser.count()) === 0) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create the first admin');
    await prisma.adminUser.create({
      data: {
        email,
        name: process.env.ADMIN_NAME || 'Store Owner',
        role: 'OWNER',
        passwordHash: await new PasswordHasher().hash(password),
      },
    });
    admin = `created owner ${email}`;
  }

  console.log(`Seeded: ${added} products, ${videosAdded} videos, ${colours.length} colours, ${coupons.length} coupon(s); ${admin}.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
