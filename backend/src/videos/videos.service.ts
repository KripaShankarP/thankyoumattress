import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { CacheRefreshService } from '../catalog/cache-refresh.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { VideoInput } from './videos.schemas.js';

const select = {
  id: true,
  title: true,
  youtubeId: true,
  fileUrl: true,
  posterUrl: true,
  isShort: true,
  featured: true,
  active: true,
  sortOrder: true,
  productId: true,
  product: { select: { name: true, slug: true } },
  createdAt: true,
} satisfies Prisma.VideoSelect;

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refresh: CacheRefreshService,
  ) {}

  list() {
    return this.prisma.video.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], select });
  }

  async create(input: VideoInput) {
    const video = await this.write(() => this.prisma.video.create({ data: this.data(input), select }));
    await this.refresh.catalogChanged();
    return video;
  }

  async update(id: string, input: VideoInput) {
    const video = await this.write(async () => {
      const { count } = await this.prisma.video.updateMany({ where: { id }, data: this.data(input) });
      if (!count) throw new NotFoundException('Video not found');
      return this.prisma.video.findUniqueOrThrow({ where: { id }, select });
    });
    await this.refresh.catalogChanged();
    return video;
  }

  async remove(id: string) {
    const { count } = await this.prisma.video.deleteMany({ where: { id } });
    if (!count) throw new NotFoundException('Video not found');
    await this.refresh.catalogChanged();
  }

  private data(v: VideoInput) {
    return {
      title: v.title,
      youtubeId: v.youtubeId ?? null,
      fileUrl: v.fileUrl ?? null,
      posterUrl: v.posterUrl ?? null,
      isShort: v.isShort,
      featured: v.featured,
      active: v.active,
      sortOrder: v.sortOrder,
      productId: v.productId ?? null,
    };
  }

  private async write<T>(fn: () => Promise<T>) {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003')
        throw new UnprocessableEntityException('The chosen product no longer exists');
      throw e;
    }
  }
}
