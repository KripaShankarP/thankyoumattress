import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CustomerAuthService } from './customer-auth.service.js';
import { CustomerGuard } from './customer.guard.js';
import { CustomersController } from './customers.controller.js';
import { OtpSenderService } from './otp-sender.service.js';
import { SmsService } from './sms.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [CustomerAuthService, SmsService, OtpSenderService, CustomerGuard],
  exports: [CustomerAuthService, CustomerGuard],
})
export class CustomersModule {}
