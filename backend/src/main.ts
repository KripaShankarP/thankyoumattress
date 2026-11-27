import { resolve } from 'node:path';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { instrument: ObserveInstrument });
  const config = app.get(ConfigService);
  const origins = [config.getOrThrow<string>('ADMIN_URL'), config.getOrThrow<string>('FRONTEND_URL')];

  app.set('trust proxy', 'loopback'); // the website and admin dev server proxy /api from this machine
  app.enableCsrfProtection({ trustedOrigins: origins });
  app.enableCors({ origin: origins, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] });
  app.useBodyParser('json', { limit: '1mb' }); // product payloads with long descriptions
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  // Uploaded images and videos: random file names, so they can be cached forever
  app.useStaticAssets(resolve(config.getOrThrow<string>('UPLOAD_DIR')), {
    prefix: '/uploads',
    immutable: true,
    maxAge: '365d',
    index: false,
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  });

  app.enableShutdownHooks();
  await app.listen(config.getOrThrow<number>('PORT'));
}
await bootstrap();
