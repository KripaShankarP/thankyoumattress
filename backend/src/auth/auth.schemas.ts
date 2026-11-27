import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});
export type SignIn = z.infer<typeof signInSchema>;

const newPassword = z.string().min(8, 'Use at least 8 characters').max(200);

export const changePasswordSchema = z.object({ current: z.string().min(1).max(200), next: newPassword });
export type ChangePassword = z.infer<typeof changePasswordSchema>;

const role = z.enum(['OWNER', 'STAFF']);

export const createAdminSchema = z.object({
  email: z.email().max(200),
  name: z.string().trim().min(2).max(80),
  password: newPassword,
  role: role.default('STAFF'),
});
export type CreateAdmin = z.infer<typeof createAdminSchema>;

export const updateAdminSchema = z
  .object({ name: z.string().trim().min(2).max(80), role, active: z.boolean(), password: newPassword })
  .partial();
export type UpdateAdmin = z.infer<typeof updateAdminSchema>;
