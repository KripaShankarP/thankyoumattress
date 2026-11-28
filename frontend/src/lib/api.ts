import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Catalog } from "./types";
import snapshot from "@/data/catalog-snapshot.json";

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
  try {
    const res = await fetch(`${API_URL}/api/catalog`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Backend answered ${res.status}`);
    return await res.json();
  } catch (e) {
    // Backend not reachable (e.g. a deploy before the API is hosted): show the bundled catalogue instead of failing
    console.warn(`Catalogue from ${API_URL} unavailable (${(e as Error).message}); using the bundled snapshot`);
    return snapshot as unknown as Catalog;
  }
}

export async function getProduct(slug: string) {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug);
}
