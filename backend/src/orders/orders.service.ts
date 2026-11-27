import { randomBytes } from 'node:crypto';
import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import type { OrderStatus } from '../generated/prisma/enums.js';
import { CatalogService } from '../catalog/catalog.service.js';
import { SettingsService } from '../catalog/settings.service.js';
import { priceCart, type AppliedCoupon } from '../common/pricing.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CustomerAuthService, type CustomerIdentity } from '../customers/customer-auth.service.js';
import type { AddPayment, CreateOrder, ListOrders, UpdatePayment, UpdateStatus } from './orders.schemas.js';

const newOrderNo = () => `TY${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`;

const orderDetail = {
  items: true,
  payments: { orderBy: { createdAt: 'asc' } },
  statusLogs: { orderBy: { createdAt: 'asc' }, include: { admin: { select: { name: true } } } },
  customer: { select: { id: true, _count: { select: { orders: true } } } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
    private readonly settings: SettingsService,
    private readonly customers: CustomerAuthService,
  ) {}

  /** Prices the cart on the server and saves the signed-in customer's order with a pending advance payment */
  async create(customer: CustomerIdentity, input: CreateOrder) {
    const [products, settings] = await Promise.all([this.catalog.products(), this.settings.get()]);
    let coupon: AppliedCoupon | undefined;
    if (input.coupon) {
      try {
        coupon = await this.catalog.coupon(input.coupon);
      } catch {
        throw new UnprocessableEntityException(`Coupon ${input.coupon.toUpperCase()} is no longer valid — remove it and try again`);
      }
    }
    const c = input.customer;
    // The verified number they signed in with, else the 10-digit number given at checkout
    const phone = customer.phoneVerified && customer.phone ? customer.phone : (c.phone ?? customer.phone);
    if (!phone) throw new UnprocessableEntityException('Please enter a 10-digit mobile number for delivery');
    const cart = priceCart(products, settings, input.lines, coupon, c.pincode);
    if (!cart.lines.length) throw new UnprocessableEntityException('Your cart is empty');
    const noColour = cart.lines.find((l) => l.needsColour);
    if (noColour) throw new UnprocessableEntityException(`Please choose a colour for ${noColour.name}`);
    const productIds = new Map(products.map((p) => [p.slug, p.id]));

    const order = await this.prisma.$transaction(async (tx) => {
      if (coupon) {
        // count the use only while uses are left (safe under concurrent orders)
        const used = await tx.$executeRaw`UPDATE "Coupon" SET "usedCount" = "usedCount" + 1
          WHERE code = ${coupon.code} AND ("maxUses" IS NULL OR "usedCount" < "maxUses")`;
        if (!used) throw new ConflictException(`Coupon ${coupon.code} has just run out — remove it and try again`);
      }
      return tx.order.create({
        data: {
          orderNo: newOrderNo(),
          customerId: customer.id,
          name: c.name,
          phone,
          email: c.email || customer.email || null,
          address: c.address,
          city: c.city,
          pincode: c.pincode,
          notes: c.notes || null,
          deliveryZone: cart.zone,
          pieces: cart.pieces,
          subtotal: cart.subtotal,
          couponCode: cart.coupon ?? null,
          couponPct: cart.couponPct,
          discount: cart.discount,
          shipping: cart.shipping,
          gstPct: cart.gstPct,
          gst: cart.gst,
          total: cart.total,
          items: {
            create: cart.lines.map((l) => ({
              productId: productIds.get(l.slug) ?? null,
              productSlug: l.slug,
              productName: l.name,
              image: l.image,
              model: l.model,
              thickness: l.thickness,
              size: l.size,
              comfort: l.comfort ?? null,
              colour: l.colour ?? null,
              qty: l.qty,
              unitPrice: l.unitPrice,
              lineTotal: l.lineTotal,
            })),
          },
          payments: { create: { method: 'UPI', amount: cart.total, status: 'PENDING' } },
          statusLogs: { create: { to: 'NEW', note: 'Order placed on the website' } },
        },
        select: { orderNo: true, total: true },
      });
    });
    if (!customer.phone) await this.customers.rememberPhone(customer.id, phone);
    return { id: order.orderNo, total: order.total };
  }

  async list(q: ListOrders) {
    const search = q.q?.trim();
    const where: Prisma.OrderWhereInput = {
      ...(q.status ? { status: q.status } : {}),
      ...(search
        ? {
            OR: [
              { orderNo: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search.replace(/\D/g, '') || search } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        select: {
          id: true,
          orderNo: true,
          createdAt: true,
          status: true,
          name: true,
          phone: true,
          city: true,
          pincode: true,
          pieces: true,
          total: true,
          items: { select: { productName: true, qty: true, colour: true, size: true } },
          payments: { select: { status: true, amount: true } },
        },
      }),
    ]);
    return {
      items: items.map(({ payments, ...o }) => ({
        ...o,
        paid: payments.filter((p) => p.status === 'VERIFIED').reduce((s, p) => s + p.amount, 0),
      })),
      total,
      page: q.page,
      pageSize: q.pageSize,
    };
  }

  async get(id: string) {
    const order = await this.prisma.order.findFirst({ where: { OR: [{ id }, { orderNo: id }] }, include: orderDetail });
    if (!order) throw new NotFoundException('Order not found');
    const { customer, statusLogs, ...rest } = order;
    return {
      ...rest,
      customerOrders: customer._count.orders,
      statusLogs: statusLogs.map(({ admin, adminId: _adminId, ...log }) => ({ ...log, by: admin?.name ?? null })),
      paid: order.payments.filter((p) => p.status === 'VERIFIED').reduce((s, p) => s + p.amount, 0),
    };
  }

  async updateStatus(id: string, adminId: string, { status, note }: UpdateStatus) {
    const current = await this.prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!current) throw new NotFoundException('Order not found');
    if (current.status !== status) {
      await this.prisma.order.update({
        where: { id },
        data: { status, statusLogs: { create: { from: current.status, to: status as OrderStatus, note, adminId } } },
      });
    } else if (note) {
      await this.prisma.orderStatusLog.create({ data: { orderId: id, from: status, to: status, note, adminId } });
    }
    return this.get(id);
  }

  async addPayment(id: string, p: AddPayment) {
    const exists = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Order not found');
    await this.prisma.payment.create({
      data: { ...p, orderId: id, verifiedAt: p.status === 'VERIFIED' ? new Date() : null },
    });
    return this.get(id);
  }

  async updatePayment(orderId: string, paymentId: string, p: UpdatePayment) {
    const { count } = await this.prisma.payment.updateMany({
      where: { id: paymentId, orderId },
      data: { ...p, verifiedAt: p.status === 'VERIFIED' ? new Date() : null },
    });
    if (!count) throw new NotFoundException('Payment not found');
    return this.get(orderId);
  }
}
