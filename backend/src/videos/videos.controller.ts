import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { VideosService } from './videos.service.js';
import { videoInputSchema, type VideoInput } from './videos.schemas.js';

@Controller('admin/videos')
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  @Get()
  list() {
    return this.videos.list();
  }

  @Post()
  create(@Body({ schema: videoInputSchema }) body: VideoInput) {
    return this.videos.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body({ schema: videoInputSchema }) body: VideoInput) {
    return this.videos.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.videos.remove(id);
  }
}
