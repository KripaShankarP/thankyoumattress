import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { StoreService } from './store.service.js';
import {
  colourSchema,
  couponSchema,
  settingsSchema,
  type ColourInput,
  type CouponInput,
  type SettingsInput,
} from './store.schemas.js';

@Controller('admin')
export class StoreController {
  constructor(private readonly store: StoreService) {}

  @Get('settings')
  settings() {
    return this.store.getSettings();
  }

  @Put('settings')
  updateSettings(@Body({ schema: settingsSchema }) body: SettingsInput) {
    return this.store.updateSettings(body);
  }

  @Get('colours')
  colours() {
    return this.store.listColours();
  }

  @Post('colours')
  createColour(@Body({ schema: colourSchema }) body: ColourInput) {
    return this.store.createColour(body);
  }

  @Put('colours/:id')
  updateColour(@Param('id') id: string, @Body({ schema: colourSchema }) body: ColourInput) {
    return this.store.updateColour(id, body);
  }

  @Delete('colours/:id')
  @HttpCode(204)
  removeColour(@Param('id') id: string) {
    return this.store.removeColour(id);
  }

  @Get('coupons')
  coupons() {
    return this.store.listCoupons();
  }

  @Post('coupons')
  createCoupon(@Body({ schema: couponSchema }) body: CouponInput) {
    return this.store.createCoupon(body);
  }

  @Put('coupons/:id')
  updateCoupon(@Param('id') id: string, @Body({ schema: couponSchema }) body: CouponInput) {
    return this.store.updateCoupon(id, body);
  }

  @Delete('coupons/:id')
  @HttpCode(204)
  removeCoupon(@Param('id') id: string) {
    return this.store.removeCoupon(id);
  }
}
