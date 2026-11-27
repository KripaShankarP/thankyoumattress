"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
};

interface CustomerCtx {
  /** undefined while loading, null when signed out */
  customer: Customer | null | undefined;
  setCustomer: (c: Customer | null) => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<CustomerCtx | null>(null);

/** The customer signed in with their mobile number + OTP (session cookie set by the backend) */
export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    fetch("/api/customer/me")
      .then((r) => (r.ok ? r.json() : { customer: null }))
      .then((d) => live && setCustomer(d.customer ?? null))
      .catch(() => live && setCustomer(null));
    return () => {
      live = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/customer/sign-out", { method: "POST" }).catch(() => {});
    setCustomer(null);
  }, []);

  return <Ctx.Provider value={{ customer, setCustomer, signOut }}>{children}</Ctx.Provider>;
}

export function useCustomer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCustomer must be used inside <CustomerProvider>");
  return c;
}

/** Keeps only digits, at most 10: for mobile number inputs */
export const tenDigits = (v: string) => v.replace(/\D/g, "").slice(0, 10);
export const isMobile = (v: string) => /^[6-9]\d{9}$/.test(v);
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const showPhone = (p: string) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
