import type { Metadata } from "next";
import { Suspense } from "react";
import { Account } from "./Account";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="h-[60vh]" />}>
        <Account />
      </Suspense>
    </section>
  );
}
