import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StoreController } from './store.controller.js';
import { StoreService } from './store.service.js';

@Module({
  imports: [PrismaModule, CatalogModule],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
