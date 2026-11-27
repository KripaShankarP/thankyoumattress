import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { listProductsSchema, productInputSchema, type ListProducts, type ProductInput } from './products.schemas.js';

@Controller('admin/products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query({ schema: listProductsSchema }) query: ListProducts) {
    return this.products.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.products.get(id);
  }

  @Post()
  create(@Body({ schema: productInputSchema }) body: ProductInput) {
    return this.products.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body({ schema: productInputSchema }) body: ProductInput) {
    return this.products.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
