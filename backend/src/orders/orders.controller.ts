import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';
import type { AdminIdentity } from '../auth/admin-identity.js';
import type { CustomerIdentity } from '../customers/customer-auth.service.js';
import { CurrentCustomer, CustomerGuard } from '../customers/customer.guard.js';
import { OrdersService } from './orders.service.js';
import {
  addPaymentSchema,
  createOrderSchema,
  listOrdersSchema,
  updatePaymentSchema,
  updateStatusSchema,
  type AddPayment,
  type CreateOrder,
  type ListOrders,
  type UpdatePayment,
  type UpdateStatus,
} from './orders.schemas.js';

/** Checkout on the website: only a customer signed in with an OTP can order */
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Public()
  @UseGuards(CustomerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post()
  create(@CurrentCustomer() customer: CustomerIdentity, @Body({ schema: createOrderSchema }) body: CreateOrder) {
    return this.orders.create(customer, body);
  }
}

@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@Query({ schema: listOrdersSchema }) query: ListOrders) {
    return this.orders.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orders.get(id);
  }

  @Patch(':id/status')
  status(@Param('id') id: string, @CurrentUser() admin: AdminIdentity, @Body({ schema: updateStatusSchema }) body: UpdateStatus) {
    return this.orders.updateStatus(id, admin.id, body);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body({ schema: addPaymentSchema }) body: AddPayment) {
    return this.orders.addPayment(id, body);
  }

  @Patch(':id/payments/:paymentId')
  updatePayment(
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
    @Body({ schema: updatePaymentSchema }) body: UpdatePayment,
  ) {
    return this.orders.updatePayment(id, paymentId, body);
  }
}
