"use client";

import { useSyncExternalStore } from "react";
import type { Colour } from "@/lib/types";

/**
 * The cover colour picked in the BuyBox, shared with the Gallery (they are siblings
 * rendered by a server page, so a tiny external store is simpler than a provider).
 */
export type Preview = { colour: Colour; thickness: number };
let current: Preview | null = null;
const subs = new Set<() => void>();

export function setPreviewColour(c: Preview | null) {
  current = c;
  subs.forEach((f) => f());
}

function subscribe(f: () => void) {
  subs.add(f);
  return () => subs.delete(f);
}

export function usePreviewColour() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
