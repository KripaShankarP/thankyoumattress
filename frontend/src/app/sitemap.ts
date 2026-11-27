import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/api";

const base = "https://www.thankyoumattresses.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();
  const pages = ["", "/shop", "/videos", "/about", "/contact", "/warranty-terms"].map((p) => ({ url: `${base}${p}` }));
  return [...pages, ...products.map((p) => ({ url: `${base}/product/${p.slug}` }))];
}
