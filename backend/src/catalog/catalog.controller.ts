import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { z } from 'zod';
import { CatalogService } from './catalog.service.js';

@Public()
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  /** Everything the website renders: products, videos, store settings */
  @Get('catalog')
  getCatalog() {
    return this.catalog.catalog();
  }

  @Get('coupons/:code')
  coupon(@Param('code', { schema: z.string().trim().min(1).max(40) }) code: string) {
    return this.catalog.coupon(code);
  }
}
