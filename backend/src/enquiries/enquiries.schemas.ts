import { z } from 'zod';
import { mobile } from '../customers/customers.schemas.js';

export const createEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: mobile,
  email: z.union([z.email().max(120), z.literal('')]).optional(),
  message: z.string().trim().max(1000).optional(),
  product: z.string().trim().max(120).optional(),
});
export type CreateEnquiry = z.infer<typeof createEnquirySchema>;

const status = z.enum(['NEW', 'CALLED', 'CLOSED']);
export const listEnquiriesSchema = z.object({ status: status.optional() });
export type ListEnquiries = z.infer<typeof listEnquiriesSchema>;
export const updateEnquirySchema = z.object({ status });
export type UpdateEnquiry = z.infer<typeof updateEnquirySchema>;
