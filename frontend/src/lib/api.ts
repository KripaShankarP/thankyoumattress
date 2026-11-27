import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Catalog } from "./types";

/** Where the NestJS backend runs (server side only) */
export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export const CATALOG_TAG = "catalog";

/**
 * The whole public catalogue, cached until the backend says it changed
 * (it calls /api/revalidate after every admin edit).
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("max");
  const res = await fetch(`${API_URL}/api/catalog`);
  if (!res.ok) throw new Error(`Backend answered ${res.status} for /api/catalog — is it running on ${API_URL}?`);
  return res.json();
}

export async function getProduct(slug: string) {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug);
}
