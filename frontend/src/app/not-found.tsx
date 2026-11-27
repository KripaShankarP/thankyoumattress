import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
      <p className="font-display text-8xl text-brand">z z z</p>
      <h1 className="mt-6 font-display text-4xl">This page is fast asleep.</h1>
      <p className="mt-3 text-ink-soft">We couldn’t find what you were looking for.</p>
      <Link href="/shop" className="mt-8 rounded-full bg-ink px-8 py-4 font-semibold text-cream hover:bg-brand">
        Browse mattresses
      </Link>
    </section>
  );
}
