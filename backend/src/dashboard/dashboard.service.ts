import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const live = { status: { not: 'CANCELLED' as const } };

    const [byStatus, revenue, revenue30, today, pendingPayments, newEnquiries, products, recent, daily] = await Promise.all([
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.order.aggregate({ where: live, _sum: { total: true } }),
      this.prisma.order.aggregate({ where: { ...live, createdAt: { gte: monthAgo } }, _sum: { total: true }, _count: { _all: true } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.payment.count({ where: { status: 'PENDING', order: live } }),
      this.prisma.enquiry.count({ where: { status: 'NEW' } }),
      this.prisma.product.count({ where: { active: true } }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, orderNo: true, createdAt: true, name: true, city: true, status: true, total: true },
      }),
      this.prisma.$queryRaw<{ day: Date; orders: bigint; total: bigint | null }[]>`
        SELECT date_trunc('day', "createdAt") AS day, count(*) AS orders, sum(total) AS total
        FROM "Order" WHERE "createdAt" >= ${monthAgo} AND status <> 'CANCELLED'
        GROUP BY 1 ORDER BY 1`,
    ]);

    return {
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])),
      revenue: revenue._sum.total ?? 0,
      last30: { revenue: revenue30._sum.total ?? 0, orders: revenue30._count._all },
      ordersToday: today,
      pendingPayments,
      newEnquiries,
      activeProducts: products,
      recentOrders: recent,
      daily: daily.map((d) => ({ day: d.day.toISOString().slice(0, 10), orders: Number(d.orders), total: Number(d.total ?? 0) })),
    };
  }
}
