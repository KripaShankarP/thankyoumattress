import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StoreSettings } from '../common/catalog.types.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** The single settings row, created with defaults the first time */
  async get(): Promise<StoreSettings> {
    const s = await this.prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
    return {
      gstPct: s.gstPct,
      offerPct: s.offerPct,
      deliveryPerPiece: s.deliveryPerPiece,
      freePincodePrefixes: s.freePincodePrefixes,
    };
  }

  async update(data: StoreSettings): Promise<StoreSettings> {
    await this.prisma.setting.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
    return this.get();
  }
}
