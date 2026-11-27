import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <section className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6">
      <Suspense fallback={<div className="h-[420px] w-full max-w-md" />}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
