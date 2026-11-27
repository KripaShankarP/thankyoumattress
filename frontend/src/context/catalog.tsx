"use client";

import { createContext, useContext } from "react";
import type { Catalog } from "@/lib/types";

const Ctx = createContext<Catalog | null>(null);

/** Hands the cached catalogue (fetched once in the root layout) to client components */
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  return <Ctx.Provider value={catalog}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return c;
}

export function useProduct(slug: string) {
  return useCatalog().products.find((p) => p.slug === slug);
}
