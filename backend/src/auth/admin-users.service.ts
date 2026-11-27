import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordHasher, SessionService } from '@nestjs/authentication';
import { Prisma } from '../generated/prisma/client.js';
import type { AdminRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AdminIdentity } from './admin-identity.js';

const identity = { id: true, email: true, name: true, role: true } as const;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionService,
  ) {}

  findActive(id: string): Promise<AdminIdentity | null> {
    return this.prisma.adminUser.findFirst({ where: { id, active: true }, select: identity });
  }

  /** The admin, or null when the email or the password is wrong (same timing either way) */
  async verify(email: string, password: string): Promise<AdminIdentity | null> {
    const found = await this.prisma.adminUser.findFirst({
      where: { email: email.trim().toLowerCase(), active: true },
      select: { ...identity, passwordHash: true },
    });
    // No account: verify() checks a dummy hash, so the timing doesn't reveal which emails exist
    const valid = await this.hasher.verify(password, found?.passwordHash);
    if (!valid || !found) return null;
    const { passwordHash, ...user } = found;
    const data: Prisma.AdminUserUpdateInput = { lastLoginAt: new Date() };
    if (this.hasher.needsRehash(passwordHash)) data.passwordHash = await this.hasher.hash(password);
    await this.prisma.adminUser.update({ where: { id: user.id }, data });
    return user;
  }

  async changePassword(userId: string, current: string, next: string) {
    const row = await this.prisma.adminUser.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
    if (!(await this.verify(row.email, current))) throw new ForbiddenException('Current password is wrong');
    await this.prisma.adminUser.update({ where: { id: userId }, data: { passwordHash: await this.hasher.hash(next) } });
  }

  list() {
    return this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: { ...identity, active: true, lastLoginAt: true, createdAt: true },
    });
  }

  async create(data: { email: string; name: string; password: string; role: AdminRole }) {
    try {
      return await this.prisma.adminUser.create({
        data: {
          email: data.email.trim().toLowerCase(),
          name: data.name,
          role: data.role,
          passwordHash: await this.hasher.hash(data.password),
        },
        select: identity,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
        throw new ConflictException('An admin with this email already exists');
      throw e;
    }
  }

  async update(actor: AdminIdentity, id: string, data: { name?: string; role?: AdminRole; active?: boolean; password?: string }) {
    if (id === actor.id && (data.active === false || (data.role && data.role !== actor.role)))
      throw new ForbiddenException('You cannot deactivate yourself or change your own role');
    const exists = await this.prisma.adminUser.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Admin not found');
    const { password, ...rest } = data;
    const user = await this.prisma.adminUser.update({
      where: { id },
      data: { ...rest, ...(password ? { passwordHash: await this.hasher.hash(password) } : {}) },
      select: identity,
    });
    // A deactivated admin or a reset password signs that admin out everywhere
    if (data.active === false || password) await this.sessions.revokeAll(id);
    return user;
  }
}
