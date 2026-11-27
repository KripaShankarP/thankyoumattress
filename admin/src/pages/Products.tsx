import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Package, Plus, Search, Star } from 'lucide-react';
import { get } from '@/lib/api';
import { cn, formatINR, media, SITE_URL } from '@/lib/format';
import type { Category, ProductRow } from '@/lib/types';
import { Badge, Card, Empty, ErrorBox, Input, PageHeader, Spinner } from '@/components/ui';

export default function Products() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const products = useQuery({ queryKey: ['products'], queryFn: () => get<ProductRow[]>('/admin/products') });

  const list = (products.data ?? []).filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || `${p.name} ${p.slug} ${p.code ?? ''}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Mattresses and pillows on the website. Prices are MRPs; the store offer from Settings is applied on the site."
        actions={
          <Link to="/products/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark">
            <Plus className="size-4" /> Add product
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(['', 'MATTRESS', 'PILLOW'] as const).map((c) => (
            <button
              key={c || 'all'}
              onClick={() => setCategory(c)}
              className={cn('rounded-full px-3.5 py-2 text-sm font-semibold', category === c ? 'bg-night text-white' : 'bg-white text-ink-soft ring-1 ring-ink/10')}
            >
              {c === '' ? 'All' : c === 'MATTRESS' ? 'Mattresses' : 'Pillows'}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or code" className="pl-9" />
        </div>
      </div>

      {products.isPending ? (
        <Spinner />
      ) : products.isError ? (
        <ErrorBox error={products.error} />
      ) : list.length === 0 ? (
        <Card>
          <Empty icon={Package} title="No products" text="Add your first product to show it on the website." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-ink/[0.07] transition hover:ring-brand/40">
              <span className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-sand">
                {p.cover && <img src={media(p.cover)} alt="" className="size-full object-cover transition group-hover:scale-105" />}
              </span>
              <span className="min-w-0 flex-1 py-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold">{p.name}</span>
                  {p.featured && <Star className="size-4 shrink-0 fill-gold text-gold" />}
                </span>
                <span className="block text-xs text-ink-soft">
                  {p.code ? `${p.code} · ` : ''}
                  {p.category === 'MATTRESS' ? 'Mattress' : 'Pillow'} · {p.priceRows} price row{p.priceRows === 1 ? '' : 's'} × {p.sizes} size{p.sizes === 1 ? '' : 's'}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">from {formatINR(p.fromPrice)}</span>
                  <span className="text-xs text-ink-soft line-through">{formatINR(p.fromMrp)}</span>
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {p.active ? <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">Live</Badge> : <Badge className="bg-zinc-100 text-zinc-600 ring-zinc-200">Hidden</Badge>}
                  {p.orders > 0 && <Badge className="bg-blue-50 text-blue-700 ring-blue-200">{p.orders} sold</Badge>}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-ink-soft">
        Changes show on the <a href={SITE_URL} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">website</a> as soon as you save.
      </p>
    </>
  );
}
