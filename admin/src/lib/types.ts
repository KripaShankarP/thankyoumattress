/** Shapes the backend answers with (see the services in backend/src) */

export type Role = 'OWNER' | 'STAFF';
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'FAILED';
export type PaymentMethod = 'UPI' | 'BANK_TRANSFER';

export interface OrderRow {
  id: string;
  orderNo: string;
  createdAt: string;
  status: OrderStatus;
  name: string;
  phone: string;
  city: string;
  pincode: string;
  pieces: number;
  total: number;
  paid: number;
  items: { productName: string; qty: number; colour: string | null; size: string }[];
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  utr: string | null;
  proofUrl: string | null;
  status: PaymentStatus;
  note: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNo: string;
  status: OrderStatus;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  pincode: string;
  notes: string | null;
  deliveryZone: string;
  pieces: number;
  subtotal: number;
  couponCode: string | null;
  couponPct: number;
  discount: number;
  shipping: number;
  gstPct: number;
  gst: number;
  total: number;
  paid: number;
  createdAt: string;
  customerOrders: number;
  items: {
    id: string;
    productSlug: string;
    productName: string;
    image: string;
    model: string;
    thickness: number;
    size: string;
    comfort: string | null;
    colour: string | null;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  payments: Payment[];
  statusLogs: { id: string; from: OrderStatus | null; to: OrderStatus; note: string | null; by: string | null; createdAt: string }[];
}

export interface Dashboard {
  ordersByStatus: Partial<Record<OrderStatus, number>>;
  revenue: number;
  last30: { revenue: number; orders: number };
  ordersToday: number;
  pendingPayments: number;
  newEnquiries: number;
  activeProducts: number;
  recentOrders: { id: string; orderNo: string; createdAt: string; name: string; city: string; status: OrderStatus; total: number }[];
  daily: { day: string; orders: number; total: number }[];
}

export type Category = 'MATTRESS' | 'PILLOW';
export type Firmness = 'SOFT' | 'MEDIUM' | 'FIRM' | 'DUAL_COMFORT';

export interface ProductRow {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  category: Category;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  cover: string | null;
  fromMrp: number;
  fromPrice: number;
  orders: number;
  priceRows: number;
  sizes: number;
}

/** What the product editor edits and sends (PUT /admin/products/:id) */
export interface ProductInput {
  slug: string;
  code: string;
  name: string;
  category: Category;
  tagline: string;
  description: string[];
  features: string[];
  firmness: Firmness;
  warrantyYears?: number;
  cloth: string;
  badge: string;
  featured: boolean;
  active: boolean;
  hasColours: boolean;
  sortOrder: number;
  images: string[];
  sizes: string[];
  variants: { model: string; thickness: number; prices: (number | null)[] }[];
  constructions: { name: string; detail: string }[];
  comfortOptions: string[];
  colourIds: string[];
}

export interface Video {
  id: string;
  title: string;
  youtubeId: string | null;
  fileUrl: string | null;
  posterUrl: string | null;
  isShort: boolean;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  productId: string | null;
  product: { name: string; slug: string } | null;
  createdAt: string;
}

export interface Colour {
  id: string;
  name: string;
  hex: string;
  active: boolean;
  sortOrder: number;
  _count?: { products: number };
}

export interface Coupon {
  id: string;
  code: string;
  percent: number;
  active: boolean;
  validFrom: string | null;
  validTo: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
}

export interface Settings {
  gstPct: number;
  offerPct: number;
  deliveryPerPiece: number;
  freePincodePrefixes: string[];
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  productSlug: string | null;
  status: 'NEW' | 'CALLED' | 'CLOSED';
  createdAt: string;
}

export interface AdminAccount extends Admin {
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
