import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, Search, ShoppingBag } from 'lucide-react';
import { get } from '@/lib/api';
import { cn, formatDate, formatINR } from '@/lib/format';
import type { OrderRow, OrderStatus, Paged } from '@/lib/types';
import { Badge, Card, Empty, ErrorBox, Input, ORDER_STATUSES, PageHeader, Spinner, StatusBadge, statusLabel } from '@/components/ui';

export default function Orders() {
  const [sp, setSp] = useSearchParams();
  const status = (sp.get('status') ?? '') as OrderStatus | '';
  const page = Number(sp.get('page') ?? 1);
  const q = sp.get('q') ?? '';
  const [search, setSearch] = useState(q);

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setSp(next, { replace: true });
  };

  // Search as you type (debounced)
  useEffect(() => {
    const t = setTimeout(
      () =>
        setSp(
          (prev) => {
            const v = search.trim();
            if ((prev.get('q') ?? '') === v) return prev;
            const next = new URLSearchParams(prev);
            if (v) next.set('q', v);
            else next.delete('q');
            next.delete('page');
            return next;
          },
          { replace: true },
        ),
      350,
    );
    return () => clearTimeout(t);
  }, [search, setSp]);

  const params = new URLSearchParams({ page: String(page), pageSize: '20', ...(status ? { status } : {}), ...(q ? { q } : {}) });
  const orders = useQuery({
    queryKey: ['orders', params.toString()],
    queryFn: () => get<Paged<OrderRow>>(`/admin/orders?${params}`),
    placeholderData: keepPreviousData,
  });
  const pages = orders.data ? Math.max(1, Math.ceil(orders.data.total / orders.data.pageSize)) : 1;

  return (
    <>
      <PageHeader title="Orders" subtitle="Every order placed on the website. Open one to confirm it, verify the payment and update delivery." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
          {(['', ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s || 'all'}
              onClick={() => set({ status: s, page: '' })}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition',
                status === s ? 'bg-night text-white' : 'bg-white text-ink-soft ring-1 ring-ink/10 hover:text-ink',
              )}
            >
              {s ? statusLabel(s) : 'All'}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order ID, name, phone or city" className="pl-9" />
        </div>
      </div>

      <Card className="p-0 sm:p-0">
        {orders.isPending ? (
          <Spinner />
        ) : orders.isError ? (
          <div className="p-5">
            <ErrorBox error={orders.error} />
          </div>
        ) : orders.data.items.length === 0 ? (
          <Empty icon={ShoppingBag} title="No orders found" text={q || status ? 'Try another filter or search.' : 'Orders placed on the website will appear here.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-ink/10 text-left text-xs font-semibold tracking-wide text-ink-soft uppercase">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y divide-ink/5', orders.isFetching && 'opacity-60')}>
                {orders.data.items.map((o) => (
                  <tr key={o.id} className="group cursor-pointer hover:bg-sand/40">
                    <td className="px-5 py-3.5">
                      <Link to={`/orders/${o.id}`} className="font-mono font-semibold text-brand group-hover:underline">
                        {o.orderNo}
                      </Link>
                      <span className="block text-xs text-ink-soft">{formatDate(o.createdAt)}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="font-semibold">{o.name}</span>
                      <span className="block text-xs text-ink-soft">
                        {o.phone} · {o.city} {o.pincode}
                      </span>
                    </td>
                    <td className="max-w-64 px-3 py-3.5">
                      {o.items.map((i, k) => (
                        <span key={k} className="block truncate text-xs">
                          {i.qty} × {i.productName} <span className="text-ink-soft">· {[i.size, i.colour].filter(Boolean).join(' · ')}</span>
                        </span>
                      ))}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-3.5">
                      {o.paid >= o.total ? (
                        <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">Paid</Badge>
                      ) : o.paid > 0 ? (
                        <Badge className="bg-amber-50 text-amber-800 ring-amber-200">Part paid</Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-600 ring-zinc-200">Awaiting</Badge>
                      )}
                    </td>
                    <td className="tabular px-5 py-3.5 text-right font-semibold">
                      <Link to={`/orders/${o.id}`}>{formatINR(o.total)}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {orders.data && orders.data.total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
          <span>
            {orders.data.total} order{orders.data.total === 1 ? '' : 's'} · page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => set({ page: String(page - 1) })} className="grid size-9 place-items-center rounded-lg bg-white ring-1 ring-ink/10 disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </button>
            <button disabled={page >= pages} onClick={() => set({ page: String(page + 1) })} className="grid size-9 place-items-center rounded-lg bg-white ring-1 ring-ink/10 disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
