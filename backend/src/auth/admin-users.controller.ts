import { Body, Controller, ForbiddenException, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import type { AdminIdentity } from './admin-identity.js';
import { AdminUsersService } from './admin-users.service.js';
import { createAdminSchema, updateAdminSchema, type CreateAdmin, type UpdateAdmin } from './auth.schemas.js';

const ownerOnly = (user: AdminIdentity) => {
  if (user.role !== 'OWNER') throw new ForbiddenException('Only the owner can manage admins');
};

@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  list(@CurrentUser() user: AdminIdentity) {
    ownerOnly(user);
    return this.users.list();
  }

  @Post()
  create(@CurrentUser() user: AdminIdentity, @Body({ schema: createAdminSchema }) body: CreateAdmin) {
    ownerOnly(user);
    return this.users.create(body);
  }

  @Patch(':id')
  update(@CurrentUser() user: AdminIdentity, @Param('id') id: string, @Body({ schema: updateAdminSchema }) body: UpdateAdmin) {
    ownerOnly(user);
    return this.users.update(user, id, body);
  }
}
