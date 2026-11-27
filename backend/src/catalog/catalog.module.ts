import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CacheRefreshService } from './cache-refresh.service.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { SettingsService } from './settings.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService, SettingsService, CacheRefreshService],
  exports: [CatalogService, SettingsService, CacheRefreshService],
})
export class CatalogModule {}
