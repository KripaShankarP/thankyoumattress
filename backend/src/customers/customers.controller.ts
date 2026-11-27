import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CustomerAuthService, SESSION_TTL_MS, type CustomerIdentity } from './customer-auth.service.js';
import { CUSTOMER_COOKIE, CurrentCustomer, CustomerGuard, readCookie } from './customer.guard.js';
import {
  sendOtpSchema,
  updateProfileSchema,
  verifyOtpSchema,
  type SendOtp,
  type UpdateProfile,
  type VerifyOtp,
} from './customers.schemas.js';

/** Customer sign-in with a code sent by SMS or email, profile and order history */
@Public()
@Controller('customer')
export class CustomersController {
  constructor(
    private readonly auth: CustomerAuthService,
    private readonly config: ConfigService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/send')
  @HttpCode(200)
  send(@Body({ schema: sendOtpSchema }) body: SendOtp, @Req() req: Request) {
    return this.auth.sendOtp(body.channel, body.target, req.ip);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('otp/verify')
  @HttpCode(200)
  async verify(@Body({ schema: verifyOtpSchema }) body: VerifyOtp, @Res({ passthrough: true }) res: Response) {
    const { token, customer } = await this.auth.verifyOtp(body.channel, body.target, body.code, body.name);
    res.cookie(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/',
      maxAge: SESSION_TTL_MS, // express: milliseconds
    });
    return { customer };
  }

  @Post('sign-out')
  @HttpCode(204)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.signOut(readCookie(req, CUSTOMER_COOKIE));
    res.clearCookie(CUSTOMER_COOKIE, { path: '/' });
  }

  /** The signed-in customer, or `{ customer: null }` for a visitor (checked on every page, so not a 401) */
  @Get('me')
  async me(@Req() req: Request) {
    return { customer: await this.auth.fromToken(readCookie(req, CUSTOMER_COOKIE)) };
  }

  @UseGuards(CustomerGuard)
  @Patch('me')
  async update(@CurrentCustomer() customer: CustomerIdentity, @Body({ schema: updateProfileSchema }) body: UpdateProfile) {
    return { customer: await this.auth.updateProfile(customer, body) };
  }

  @UseGuards(CustomerGuard)
  @Get('orders')
  orders(@CurrentCustomer() customer: CustomerIdentity) {
    return this.auth.orders(customer.id);
  }
}
