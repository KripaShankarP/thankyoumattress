import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Catalog, CatalogProduct } from '../common/catalog.types.js';
import { productInclude, toCatalogProduct, toCatalogVideo } from './catalog.mapper.js';
import { SettingsService } from './settings.service.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  /** Active products (in display order) with the store settings applied */
  async products(): Promise<CatalogProduct[]> {
    const [settings, colours, rows] = await Promise.all([
      this.settings.get(),
      this.prisma.colour.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
      this.prisma.product.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: productInclude,
      }),
    ]);
    const palette = colours.map(({ name, hex }) => ({ name, hex }));
    return rows.map((p) => toCatalogProduct(p, palette, settings.offerPct));
  }

  async catalog(): Promise<Catalog> {
    const [products, settings, videos] = await Promise.all([
      this.products(),
      this.settings.get(),
      this.prisma.video.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: { product: { select: { slug: true } } },
      }),
    ]);
    return { products, settings, videos: videos.map(toCatalogVideo) };
  }

  /** A coupon a customer may use right now, or 404 */
  async coupon(code: string) {
    const c = await this.prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    const now = new Date();
    const usable =
      c &&
      c.active &&
      (!c.validFrom || c.validFrom <= now) &&
      (!c.validTo || c.validTo >= now) &&
      (c.maxUses === null || c.usedCount < c.maxUses);
    if (!usable) throw new NotFoundException('This code isn’t valid.');
    return { code: c.code, percent: c.percent };
  }
}
