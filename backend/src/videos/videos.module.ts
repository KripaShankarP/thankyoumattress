import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { VideosController } from './videos.controller.js';
import { VideosService } from './videos.service.js';

@Module({
  imports: [PrismaModule, CatalogModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
