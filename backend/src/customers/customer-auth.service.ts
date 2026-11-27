import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client.js';
import type { OtpChannel } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OtpSenderService } from './otp-sender.service.js';

const OTP_TTL_MS = 5 * 60_000;
const RESEND_AFTER_MS = 30_000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;
export const SESSION_TTL_MS = 30 * 24 * 3600_000;

export interface CustomerIdentity {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
}

type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  phoneVerifiedAt: Date | null;
  emailVerifiedAt: Date | null;
};

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
/** The customer column a channel signs in with */
const field = (channel: OtpChannel) => (channel === 'SMS' ? 'phone' : 'email');

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sender: OtpSenderService,
    private readonly config: ConfigService,
  ) {}

  private hashCode(channel: OtpChannel, target: string, code: string) {
    return createHmac('sha256', this.config.getOrThrow<string>('OTP_SECRET')).update(`${channel}:${target}:${code}`).digest('hex');
  }

  /** Sends a 6-digit code by SMS or email; at most one per 30 s and five per hour per destination */
  async sendOtp(channel: OtpChannel, target: string, ip?: string) {
    const now = Date.now();
    const recent = await this.prisma.otpCode.findMany({
      where: { channel, target, createdAt: { gte: new Date(now - 3600_000) } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    const wait = recent[0] ? RESEND_AFTER_MS - (now - recent[0].createdAt.getTime()) : 0;
    if (wait > 0) throw new HttpException(`Please wait ${Math.ceil(wait / 1000)} seconds before asking for a new code`, HttpStatus.TOO_MANY_REQUESTS);
    if (recent.length >= MAX_SENDS_PER_HOUR)
      throw new HttpException('Too many codes requested. Please try again in an hour.', HttpStatus.TOO_MANY_REQUESTS);

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    // a new code replaces any earlier one
    await this.prisma.otpCode.updateMany({ where: { channel, target, consumedAt: null }, data: { consumedAt: new Date() } });
    await this.prisma.otpCode.create({
      data: { channel, target, codeHash: this.hashCode(channel, target, code), expiresAt: new Date(now + OTP_TTL_MS), ip: ip ?? null },
    });
    await this.sender.send(channel, target, code);

    const existing = await this.prisma.customer.findFirst({ where: { [field(channel)]: target }, select: { id: true } });
    return {
      sent: true,
      resendAfter: RESEND_AFTER_MS / 1000,
      /** A returning customer doesn't need to give their name again */
      known: Boolean(existing),
      // Development only (SMS_PROVIDER=console / MAIL_TRANSPORT=log): shown on the page instead of being delivered
      ...(this.sender.printsCodes(channel) ? { devCode: code } : {}),
    };
  }

  /** Checks the code; on success signs the customer in (creating them the first time) */
  async verifyOtp(channel: OtpChannel, target: string, code: string, name?: string) {
    const otp = await this.prisma.otpCode.findFirst({ where: { channel, target, consumedAt: null }, orderBy: { createdAt: 'desc' } });
    if (!otp || otp.expiresAt < new Date()) throw new UnprocessableEntityException('This code has expired. Please ask for a new one.');

    // Count this attempt before checking it, in one conditional write, so parallel guesses can't exceed the limit
    const { count: allowed } = await this.prisma.otpCode.updateMany({
      where: { id: otp.id, consumedAt: null, attempts: { lt: MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    if (!allowed) throw new UnprocessableEntityException('Too many wrong codes. Please ask for a new one.');

    const given = Buffer.from(this.hashCode(channel, target, code));
    const valid = given.length === otp.codeHash.length && timingSafeEqual(given, Buffer.from(otp.codeHash));
    if (!valid) {
      const left = MAX_ATTEMPTS - otp.attempts - 1;
      throw new UnprocessableEntityException(left > 0 ? `Wrong code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Wrong code. Please ask for a new one.');
    }

    // A new customer must give a name; ask before the code is spent
    const key = field(channel);
    const existing = await this.prisma.customer.findFirst({ where: { [key]: target } });
    if (!existing && !name) throw new UnprocessableEntityException('Please enter your name');

    // consume once: a second request with the same code loses this race
    const { count } = await this.prisma.otpCode.updateMany({ where: { id: otp.id, consumedAt: null }, data: { consumedAt: new Date() } });
    if (!count) throw new UnprocessableEntityException('This code was already used. Please ask for a new one.');

    const verified = channel === 'SMS' ? { phoneVerifiedAt: new Date() } : { emailVerifiedAt: new Date() };
    const customer = existing
      ? await this.prisma.customer.update({
          where: { id: existing.id },
          data: { ...((channel === 'SMS' ? existing.phoneVerifiedAt : existing.emailVerifiedAt) ? {} : verified) },
        })
      : await this.prisma.customer.create({ data: { name: name!, [key]: target, ...verified } });

    const token = randomBytes(32).toString('base64url');
    await this.prisma.$transaction([
      this.prisma.customerSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
      this.prisma.customerSession.create({
        data: { id: sha256(token), customerId: customer.id, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
      }),
    ]);
    return { token, customer: this.identity(customer) };
  }

  /** The signed-in customer for a session cookie, or null */
  async fromToken(token: string | undefined): Promise<CustomerIdentity | null> {
    if (!token) return null;
    const s = await this.prisma.customerSession.findUnique({ where: { id: sha256(token) }, include: { customer: true } });
    if (!s || s.expiresAt < new Date()) return null;
    if (Date.now() - s.lastUsedAt.getTime() > 3600_000) {
      await this.prisma.customerSession.updateMany({ where: { id: s.id }, data: { lastUsedAt: new Date() } });
    }
    return this.identity(s.customer);
  }

  async signOut(token: string | undefined) {
    if (token) await this.prisma.customerSession.deleteMany({ where: { id: sha256(token) } });
  }

  /**
   * Updates the name and the contact the customer did NOT sign in with
   * (a verified number or email can only change by signing in with the new one).
   */
  async updateProfile(c: CustomerIdentity, data: { name: string; email?: string; phone?: string }) {
    const patch: Prisma.CustomerUpdateInput = { name: data.name };
    if (data.email !== undefined && !c.emailVerified) patch.email = data.email || null;
    if (data.phone !== undefined && !c.phoneVerified) patch.phone = data.phone || null;
    try {
      return this.identity(await this.prisma.customer.update({ where: { id: c.id }, data: patch }));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
        throw new ConflictException('That number or email is already used by another account. Sign in with it instead.');
      throw e;
    }
  }

  /** Saves a delivery number given at checkout on a customer who has none yet (if no other account uses it) */
  async rememberPhone(customerId: string, phone: string) {
    await this.prisma.customer.updateMany({ where: { id: customerId, phone: null }, data: { phone } }).catch(() => {});
  }

  async orders(customerId: string) {
    const rows = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      select: {
        orderNo: true,
        createdAt: true,
        status: true,
        name: true,
        address: true,
        city: true,
        pincode: true,
        subtotal: true,
        discount: true,
        shipping: true,
        gst: true,
        total: true,
        items: { select: { productName: true, productSlug: true, image: true, model: true, thickness: true, size: true, comfort: true, colour: true, qty: true, lineTotal: true } },
        payments: { select: { status: true, amount: true } },
      },
    });
    return rows.map(({ payments, ...o }) => ({
      ...o,
      paid: payments.filter((p) => p.status === 'VERIFIED').reduce((s, p) => s + p.amount, 0),
    }));
  }

  private identity(c: CustomerRow): CustomerIdentity {
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      phoneVerified: Boolean(c.phoneVerifiedAt),
      emailVerified: Boolean(c.emailVerifiedAt),
    };
  }
}

export class CustomerUnauthorizedException extends UnauthorizedException {
  constructor() {
    super('Please sign in to continue');
  }
}
