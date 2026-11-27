import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule } from '@nestjs/authentication';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LogMailTransport, MailModule, SmtpTransport } from '@nestjs/mail';
import { createObserveModule } from '@nestjs/observe';
import { envSchema } from './config.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { EnquiriesModule } from './enquiries/enquiries.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { ProductsModule } from './products/products.module.js';
import { StoreModule } from './store/store.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { VideosModule } from './videos/videos.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    // Distributed tracing, logs and error telemetry. Sends nothing until `npx @nestjs/observe link` writes keys into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    // Every route needs a signed-in admin unless it is marked @Public()
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        session: {
          absoluteTtl: '7d',
          idleTtl: '1d',
          trustedOrigins: [config.getOrThrow<string>('ADMIN_URL'), config.getOrThrow<string>('FRONTEND_URL')],
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    // Sign-in codes by email: SMTP in production, logged to the terminal in development
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const smtp = config.get<string>('MAIL_TRANSPORT') === 'smtp';
        if (smtp && !config.get('SMTP_URL')) throw new Error('MAIL_TRANSPORT=smtp needs SMTP_URL in .env');
        if (!smtp && config.get('NODE_ENV') === 'production')
          throw new Error('MAIL_TRANSPORT=log is for development only: set smtp and SMTP_URL so customers receive their sign-in codes');
        return {
          transport: smtp ? new SmtpTransport({ url: config.getOrThrow<string>('SMTP_URL'), pool: true }) : new LogMailTransport(),
          from: config.getOrThrow<string>('MAIL_FROM'),
        };
      },
    }),
    AuthModule,
    CatalogModule,
    CustomersModule,
    OrdersModule,
    ProductsModule,
    VideosModule,
    StoreModule,
    EnquiriesModule,
    DashboardModule,
    UploadsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
