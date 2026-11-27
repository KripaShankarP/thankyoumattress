import { type CanActivate, createParamDecorator, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { CustomerAuthService, CustomerUnauthorizedException, type CustomerIdentity } from './customer-auth.service.js';

export const CUSTOMER_COOKIE = 'ty_customer';

/** Reads one cookie from the raw header (no cookie-parser needed) */
export function readCookie(req: Request, name: string) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

type CustomerRequest = Request & { customer?: CustomerIdentity };

/**
 * Requires a signed-in customer (OTP session cookie). Customer routes are @Public() for the
 * admin authentication, so admin sessions never count here and customer sessions never open admin routes.
 */
@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(private readonly auth: CustomerAuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<CustomerRequest>();
    const customer = await this.auth.fromToken(readCookie(req, CUSTOMER_COOKIE));
    if (!customer) throw new CustomerUnauthorizedException();
    req.customer = customer;
    return true;
  }
}

/** The customer CustomerGuard signed in */
export const CurrentCustomer = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<CustomerRequest>().customer!,
);
