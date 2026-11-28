import { z } from 'zod';

/** Environment variables, checked at startup (the app refuses to start when one is wrong). */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.url().default('http://localhost:3000'),
  ADMIN_URL: z.url().default('http://localhost:5173'),
  REVALIDATE_SECRET: z.string().min(16),
  UPLOAD_DIR: z.string().default('./uploads'),
  /** Secret mixed into OTP hashes (32+ characters) */
  OTP_SECRET: z.string().min(32),
  /** How sign-in codes are sent: console (development only), msg91 or fast2sms; none turns mobile sign-in off (email only) */
  SMS_PROVIDER: z.enum(['console', 'msg91', 'fast2sms', 'none']).default('console'),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  FAST2SMS_API_KEY: z.string().optional(),
  /** How sign-in emails are sent: log (development only) or smtp */
  MAIL_TRANSPORT: z.enum(['log', 'smtp']).default('log'),
  /** smtp://user:password@smtp.example.com:587 (STARTTLS) or smtps://…:465 */
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().default('Thankyou Mattresses <no-reply@thankyoumattresses.com>'),
});

export type Env = z.infer<typeof envSchema>;
