import { z } from 'zod';

/** Exactly 10 digits, starting 6–9 (an Indian mobile number, without +91) */
export const mobile = z
  .string()
  .trim()
  .regex(/^\d{10}$/, 'Enter a 10-digit mobile number')
  .regex(/^[6-9]/, 'Enter a valid Indian mobile number');

export const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address').max(120));

const name = z.string().trim().min(2, 'Please enter your name').max(80);

/** Where the code goes: a mobile number (SMS) or an email address */
const destination = z.discriminatedUnion('channel', [
  z.object({ channel: z.literal('SMS'), target: mobile }),
  z.object({ channel: z.literal('EMAIL'), target: email }),
]);

export const sendOtpSchema = destination;
export type SendOtp = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = destination.and(
  z.object({
    code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    /** Required the first time (new customer) */
    name: name.optional(),
  }),
);
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;

/** Name plus whichever contact the customer didn't sign in with */
export const updateProfileSchema = z.object({
  name,
  email: z.union([email, z.literal('')]).optional(),
  phone: z.union([mobile, z.literal('')]).optional(),
});
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
