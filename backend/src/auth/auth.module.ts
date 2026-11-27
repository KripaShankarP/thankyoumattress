import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaSessionStore } from './prisma-session.store.js';
import { SessionAuth } from './session-auth.provider.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, AdminUsersController],
  providers: [AdminUsersService, PrismaSessionStore, SessionAuth],
})
export class AuthModule {}
