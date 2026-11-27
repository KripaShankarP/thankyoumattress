import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { CacheRefreshService } from '../catalog/cache-refresh.service.js';
import { SettingsService } from '../catalog/settings.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ColourInput, CouponInput, SettingsInput } from './store.schemas.js';

const unique = (what: string) => (e: unknown) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new ConflictException(`${what} already exists`);
  throw e;
};

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly refresh: CacheRefreshService,
  ) {}

  getSettings() {
    return this.settings.get();
  }

  async updateSettings(input: SettingsInput) {
    const s = await this.settings.update({ ...input, freePincodePrefixes: [...new Set(input.freePincodePrefixes)] });
    await this.refresh.catalogChanged();
    return s;
  }

  /* Colours */

  listColours() {
    return this.prisma.colour.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  }

  async createColour(input: ColourInput) {
    const c = await this.prisma.colour.create({ data: input }).catch(unique(`Colour "${input.name}"`));
    await this.refresh.catalogChanged();
    return c;
  }

  async updateColour(id: string, input: ColourInput) {
    const { count } = await this.prisma.colour.updateMany({ where: { id }, data: input }).catch(unique(`Colour "${input.name}"`));
    if (!count) throw new NotFoundException('Colour not found');
    await this.refresh.catalogChanged();
    return this.prisma.colour.findUniqueOrThrow({ where: { id } });
  }

  async removeColour(id: string) {
    const { count } = await this.prisma.colour.deleteMany({ where: { id } });
    if (!count) throw new NotFoundException('Colour not found');
    await this.refresh.catalogChanged();
  }

  /* Coupons (checked at checkout, so no website refresh needed) */

  listCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createCoupon(input: CouponInput) {
    return this.prisma.coupon.create({ data: { ...input, maxUses: input.maxUses ?? null } }).catch(unique(`Coupon ${input.code}`));
  }

  async updateCoupon(id: string, input: CouponInput) {
    const { count } = await this.prisma.coupon
      .updateMany({ where: { id }, data: { ...input, maxUses: input.maxUses ?? null } })
      .catch(unique(`Coupon ${input.code}`));
    if (!count) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.findUniqueOrThrow({ where: { id } });
  }

  async removeCoupon(id: string) {
    const { count } = await this.prisma.coupon.deleteMany({ where: { id } });
    if (!count) throw new NotFoundException('Coupon not found');
  }
}
