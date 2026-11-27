import { Injectable } from '@nestjs/common';
import { AuthenticationStorage, type SessionRecord, type SessionStore } from '@nestjs/authentication';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

type Row = {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  mfa: Prisma.JsonValue;
  metadata: Prisma.JsonValue;
};

/** Optional fields come back absent, never null (the store contract) */
function toRecord(r: Row): SessionRecord {
  const rec: SessionRecord = {
    id: r.id,
    userId: r.userId,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
    lastActiveAt: r.lastActiveAt,
  };
  if (r.mfa !== null) rec.mfa = r.mfa as unknown as SessionRecord['mfa'];
  if (r.metadata !== null) rec.metadata = r.metadata as Record<string, unknown>;
  return rec;
}

/** Admin sessions live in PostgreSQL (AdminSession), so sign-ins survive restarts. */
@Injectable()
export class PrismaSessionStore implements SessionStore {
  constructor(
    private readonly prisma: PrismaService,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({ sessions: this });
  }

  async getSession(id: string) {
    const r = await this.prisma.adminSession.findUnique({ where: { id } });
    return r ? toRecord(r) : undefined;
  }

  async createSession(record: SessionRecord) {
    await this.prisma.$transaction([
      // keep the table bounded
      this.prisma.adminSession.deleteMany({ where: { expiresAt: { lt: record.createdAt } } }),
      this.prisma.adminSession.create({
        data: {
          id: record.id,
          userId: record.userId,
          createdAt: record.createdAt,
          expiresAt: record.expiresAt,
          lastActiveAt: record.lastActiveAt,
          mfa: (record.mfa as Prisma.InputJsonValue | undefined) ?? undefined,
          metadata: (record.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
        },
      }),
    ]);
  }

  async touchSession(id: string, lastActiveAt: Date) {
    // one conditional write: never revives a deleted session, only moves forward
    await this.prisma.adminSession.updateMany({
      where: { id, lastActiveAt: { lt: lastActiveAt } },
      data: { lastActiveAt },
    });
  }

  async deleteSession(id: string) {
    const { count } = await this.prisma.adminSession.deleteMany({ where: { id } });
    return count > 0;
  }

  async listUserSessions(userId: string) {
    const rows = await this.prisma.adminSession.findMany({ where: { userId } });
    return rows.map(toRecord);
  }

  async deleteUserSessions(userId: string) {
    await this.prisma.adminSession.deleteMany({ where: { userId } });
  }
}
