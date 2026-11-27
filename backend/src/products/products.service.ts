import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { CacheRefreshService } from '../catalog/cache-refresh.service.js';
import { SettingsService } from '../catalog/settings.service.js';
import { offerPrice } from '../common/pricing.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListProducts, ProductInput } from './products.schemas.js';

const detailInclude = {
  images: { orderBy: { sortOrder: 'asc' } },
  sizes: { orderBy: { sortOrder: 'asc' } },
  variants: { orderBy: { sortOrder: 'asc' }, include: { prices: true } },
  constructions: { orderBy: { sortOrder: 'asc' } },
  comfortOptions: { orderBy: { sortOrder: 'asc' } },
  colours: { select: { colourId: true } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly refresh: CacheRefreshService,
  ) {}

  async list(q: ListProducts) {
    const search = q.q?.trim();
    const [offerPct, rows] = await Promise.all([
      this.settings.get().then((s) => s.offerPct),
      this.prisma.product.findMany({
        where: {
          ...(q.category ? { category: q.category } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { slug: { contains: search, mode: 'insensitive' } },
                  { code: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          slug: true,
          code: true,
          name: true,
          category: true,
          active: true,
          featured: true,
          sortOrder: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true } },
          variants: { select: { prices: { select: { mrp: true } } } },
          _count: { select: { orderItems: true, variants: true, sizes: true } },
        },
      }),
    ]);
    return rows.map(({ images, variants, _count, ...p }) => {
      const mrps = variants.flatMap((v) => v.prices.map((x) => x.mrp));
      const from = mrps.length ? Math.min(...mrps) : 0;
      return {
        ...p,
        cover: images[0]?.url ?? null,
        fromMrp: from,
        fromPrice: offerPrice(from, offerPct),
        orders: _count.orderItems,
        priceRows: _count.variants,
        sizes: _count.sizes,
      };
    });
  }

  /** The product in the same shape the editor sends back */
  async get(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id }, include: detailInclude });
    if (!p) throw new NotFoundException('Product not found');
    return {
      id: p.id,
      slug: p.slug,
      code: p.code ?? '',
      name: p.name,
      category: p.category,
      tagline: p.tagline,
      description: p.description,
      features: p.features,
      firmness: p.firmness,
      warrantyYears: p.warrantyYears ?? undefined,
      cloth: p.cloth ?? '',
      badge: p.badge ?? '',
      featured: p.featured,
      active: p.active,
      hasColours: p.hasColours,
      sortOrder: p.sortOrder,
      images: p.images.map((i) => i.url),
      sizes: p.sizes.map((s) => s.label),
      variants: p.variants.map((v) => ({
        model: v.model,
        thickness: v.thickness,
        prices: p.sizes.map((s) => v.prices.find((x) => x.sizeId === s.id)?.mrp ?? null),
      })),
      constructions: p.constructions.map(({ name, detail }) => ({ name, detail })),
      comfortOptions: p.comfortOptions.map((c) => c.name),
      colourIds: p.colours.map((c) => c.colourId),
      updatedAt: p.updatedAt,
    };
  }

  async create(input: ProductInput) {
    const id = await this.save(null, input);
    await this.refresh.catalogChanged();
    return this.get(id);
  }

  async update(id: string, input: ProductInput) {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Product not found');
    await this.save(id, input);
    await this.refresh.catalogChanged();
    return this.get(id);
  }

  /** Orders keep their own copy of name and price, so deleting never changes a bill */
  async remove(id: string) {
    const { count } = await this.prisma.product.deleteMany({ where: { id } });
    if (!count) throw new NotFoundException('Product not found');
    await this.refresh.catalogChanged();
  }

  /** Writes the product and replaces its images, price list and options in one transaction */
  private async save(id: string | null, input: ProductInput) {
    const {
      images,
      sizes,
      variants,
      constructions,
      comfortOptions,
      colourIds,
      code,
      cloth,
      badge,
      warrantyYears,
      ...scalars
    } = input;
    const data = { ...scalars, code: code ?? null, cloth: cloth ?? null, badge: badge ?? null, warrantyYears: warrantyYears ?? null };
    try {
      return await this.prisma.$transaction(async (tx) => {
        let productId: string;
        if (id) {
          await tx.product.update({ where: { id }, data });
          await Promise.all([
            tx.productImage.deleteMany({ where: { productId: id } }),
            tx.productVariant.deleteMany({ where: { productId: id } }), // prices cascade
            tx.productConstruction.deleteMany({ where: { productId: id } }),
            tx.comfortOption.deleteMany({ where: { productId: id } }),
            tx.productColour.deleteMany({ where: { productId: id } }),
          ]);
          await tx.productSize.deleteMany({ where: { productId: id } });
          productId = id;
        } else {
          productId = (await tx.product.create({ data, select: { id: true } })).id;
        }

        await tx.productImage.createMany({ data: images.map((url, i) => ({ productId, url, sortOrder: i })) });
        const sizeRows = await tx.productSize.createManyAndReturn({
          data: sizes.map((label, i) => ({ productId, label, sortOrder: i })),
          select: { id: true, label: true },
        });
        const sizeId = new Map(sizeRows.map((s) => [s.label, s.id]));
        const variantRows = await tx.productVariant.createManyAndReturn({
          data: variants.map((v, i) => ({ productId, model: v.model, thickness: v.thickness, sortOrder: i })),
          select: { id: true, model: true, thickness: true },
        });
        await tx.variantPrice.createMany({
          data: variants.flatMap((v) => {
            const variantId = variantRows.find((r) => r.model === v.model && r.thickness === v.thickness)!.id;
            return v.prices.flatMap((mrp, i) => (mrp === null ? [] : [{ variantId, sizeId: sizeId.get(sizes[i])!, mrp }]));
          }),
        });
        await tx.productConstruction.createMany({ data: constructions.map((c, i) => ({ productId, ...c, sortOrder: i })) });
        await tx.comfortOption.createMany({ data: comfortOptions.map((name, i) => ({ productId, name, sortOrder: i })) });
        if (colourIds.length) {
          await tx.productColour.createMany({ data: [...new Set(colourIds)].map((colourId) => ({ productId, colourId })) });
        }
        return productId;
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') throw new ConflictException(`Another product already uses the link "${input.slug}"`);
        if (e.code === 'P2003') throw new ConflictException('One of the chosen colours no longer exists');
      }
      throw e;
    }
  }
}
