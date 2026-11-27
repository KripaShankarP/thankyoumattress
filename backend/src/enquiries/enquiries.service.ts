import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateEnquiry, ListEnquiries, UpdateEnquiry } from './enquiries.schemas.js';

@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(e: CreateEnquiry) {
    await this.prisma.enquiry.create({
      data: {
        name: e.name,
        phone: e.phone,
        email: e.email || null,
        message: e.message || 'Interested — please call back',
        productSlug: e.product || null,
      },
    });
    return { ok: true };
  }

  list(q: ListEnquiries) {
    return this.prisma.enquiry.findMany({
      where: q.status ? { status: q.status } : {},
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async update(id: string, { status }: UpdateEnquiry) {
    const { count } = await this.prisma.enquiry.updateMany({ where: { id }, data: { status } });
    if (!count) throw new NotFoundException('Enquiry not found');
    return this.prisma.enquiry.findUniqueOrThrow({ where: { id } });
  }
}
