const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const formatINR = (n: number) => inr.format(n);

export const discountPct = (price: number, mrp: number) => Math.round(((mrp - price) / mrp) * 100);

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
