import 'dotenv/config';
import { StandardSchemaValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

/** Needs the database from .env, seeded (npm run db:seed) */
describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  afterAll(() => app.close());

  it('serves the public catalogue', async () => {
    const res = await request(app.getHttpServer()).get('/api/catalog').expect(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.settings).toHaveProperty('gstPct');
  });

  it('keeps admin routes behind sign-in', () => request(app.getHttpServer()).get('/api/admin/dashboard').expect(401));

  it('rejects a wrong password like an unknown email', async () => {
    const wrong = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: process.env.ADMIN_EMAIL, password: 'definitely-wrong' })
      .expect(401);
    const unknown = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: 'nobody@example.com', password: 'definitely-wrong' })
      .expect(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it('signs an admin in and opens the dashboard', async () => {
    const signIn = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
      .expect(200);
    // The session cookie is `Secure`: browsers send it to localhost, supertest's agent doesn't over http, so pass it on
    const cookie = signIn.get('Set-Cookie')!.map((c) => c.split(';')[0]);
    const res = await request(app.getHttpServer()).get('/api/admin/dashboard').set('Cookie', cookie).expect(200);
    expect(res.body).toHaveProperty('activeProducts');
  });

  describe('customer sign-in', () => {
    const order = {
      lines: [{ slug: 'royale-series', model: 'Royale', thickness: 4, size: '72 x 30', colour: 'Grey', qty: 1 }],
      customer: { name: 'E2E Buyer', address: 'Test address 123', city: 'Delhi', pincode: '110043' },
    };

    it('refuses an order from a visitor who is not signed in', () =>
      request(app.getHttpServer()).post('/api/orders').send(order).expect(401));

    it.each(['98765', '98765432100', '98765abcde', '1234567890'])('rejects the mobile number %s', async (target) => {
      await request(app.getHttpServer()).post('/api/customer/otp/send').send({ channel: 'SMS', target }).expect(400);
    });

    it('signs in with an emailed code and places an order (needs MAIL_TRANSPORT=log)', async () => {
      const email = `e2e-${Date.now()}@example.com`;
      const sent = await request(app.getHttpServer()).post('/api/customer/otp/send').send({ channel: 'EMAIL', target: email }).expect(200);
      expect(sent.body.devCode).toMatch(/^\d{6}$/);

      await request(app.getHttpServer())
        .post('/api/customer/otp/verify')
        .send({ channel: 'EMAIL', target: email, code: '000000', name: 'E2E Buyer' })
        .expect((r) => expect([422]).toContain(r.status));

      const verified = await request(app.getHttpServer())
        .post('/api/customer/otp/verify')
        .send({ channel: 'EMAIL', target: email, code: sent.body.devCode, name: 'E2E Buyer' })
        .expect(200);
      const cookie = verified.get('Set-Cookie')!.map((c) => c.split(';')[0]);

      // signed in with email: a 10-digit delivery number is required
      await request(app.getHttpServer()).post('/api/orders').set('Cookie', cookie).send(order).expect(422);
      const placed = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ...order, customer: { ...order.customer, phone: '9811122233' } })
        .expect(201);
      const mine = await request(app.getHttpServer()).get('/api/customer/orders').set('Cookie', cookie).expect(200);
      expect(mine.body[0].orderNo).toBe(placed.body.id);

      // a customer session never opens admin routes
      await request(app.getHttpServer()).get('/api/admin/dashboard').set('Cookie', cookie).expect(401);
    });
  });
});
