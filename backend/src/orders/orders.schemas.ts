import { z } from 'zod';
import { mobile } from '../customers/customers.schemas.js';

const text = (max: number) => z.string().trim().max(max);

export const cartLineSchema = z.object({
  slug: text(120).min(1),
  model: text(80).min(1),
  thickness: z.number().int().min(0).max(24),
  size: text(40).min(1),
  comfort: text(80).optional(),
  colour: text(60).optional(),
  qty: z.number().int().min(1).max(20),
});

export const createOrderSchema = z.object({
  lines: z.array(cartLineSchema).min(1, 'Your cart is empty').max(50),
  coupon: text(40).optional(),
  customer: z.object({
    /** Name for delivery */
    name: text(80).min(2, 'Please enter your name'),
    /** Delivery mobile; ignored when the customer signed in with a verified number */
    phone: mobile.optional(),
    email: z.union([z.email().max(120), z.literal('')]).optional(),
    address: text(400).min(8, 'Please enter your full address'),
    city: text(80).min(1, 'Please enter your city'),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
    notes: text(500).optional(),
  }),
});
export type CreateOrder = z.infer<typeof createOrderSchema>;

export const orderStatus = z.enum(['NEW', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']);

export const listOrdersSchema = z.object({
  status: orderStatus.optional(),
  q: text(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListOrders = z.infer<typeof listOrdersSchema>;

export const updateStatusSchema = z.object({ status: orderStatus, note: text(500).optional() });
export type UpdateStatus = z.infer<typeof updateStatusSchema>;

const paymentStatus = z.enum(['PENDING', 'VERIFIED', 'FAILED']);

export const addPaymentSchema = z.object({
  method: z.enum(['UPI', 'BANK_TRANSFER']).default('UPI'),
  amount: z.number().int().min(1),
  utr: text(60).optional(),
  proofUrl: text(300).optional(),
  status: paymentStatus.default('VERIFIED'),
  note: text(500).optional(),
});
export type AddPayment = z.infer<typeof addPaymentSchema>;

export const updatePaymentSchema = z.object({ status: paymentStatus, utr: text(60).optional(), note: text(500).optional() });
export type UpdatePayment = z.infer<typeof updatePaymentSchema>;
