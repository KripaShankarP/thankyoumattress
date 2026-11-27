export const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const formatDate = (d: string | Date, withTime = true) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(new Date(d));

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const offerPrice = (mrp: number, offerPct: number) => Math.round((mrp * (100 - offerPct)) / 100);

/** wa.me link for an Indian mobile number */
export const whatsappLink = (phone: string, text?: string) => {
  const digits = phone.replace(/\D/g, '');
  const n = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

/** Where the public website runs (its /images/... files are the original product photos) */
export const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'http://localhost:3000';

/** A media URL the admin can load: uploads come through the /uploads proxy, original photos from the website */
export const media = (url: string) => (url.startsWith('/images/') ? `${SITE_URL}${url}` : url);
