import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { ArrowRight, CalendarClock, IndianRupee, MessageSquare, Package, ShoppingBag, Wallet } from 'lucide-react';
import { get } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/format';
import type { Dashboard as Stats } from '@/lib/types';
import { useMe } from '@/auth';
import { Card, Empty, ErrorBox, ORDER_STATUSES, PageHeader, Spinner, StatusBadge } from '@/components/ui';

function Stat({ icon: Icon, label, value, hint, to, tone = 'bg-brand/10 text-brand' }: { icon: React.ElementType; label: string; value: React.ReactNode; hint?: string; to?: string; tone?: string }) {
  const body = (
    <div className="flex h-full items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-ink/[0.07] transition hover:ring-brand/30">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-ink-soft">{label}</span>
        <span className="tabular mt-0.5 block text-2xl font-bold tracking-tight">{value}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
      </span>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

/** Orders per day for the last 30 days (empty days included) */
function Chart({ daily }: { daily: Stats['daily'] }) {
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5);
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.getDate(), ...(byDay.get(key) ?? { orders: 0, total: 0 }) };
  });
  const max = Math.max(1, ...days.map((d) => d.total));
  return (
    <div className="flex h-44 items-end gap-1">
      {days.map((d) => (
        <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
          <div
            className="rounded-t-md bg-brand/80 transition group-hover:bg-gold"
            style={{ height: `${Math.max(d.total ? 4 : 1, (d.total / max) * 100)}%`, opacity: d.total ? 1 : 0.25 }}
          />
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-night px-2.5 py-1.5 text-xs text-white group-hover:block">
            {formatDate(d.key, false)} · {d.orders} order{d.orders === 1 ? '' : 's'} · {formatINR(d.total)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const me = useMe().data!;
  const q = useQuery({ queryKey: ['dashboard'], queryFn: () => get<Stats>('/admin/dashboard') });
  if (q.isPending) return <Spinner />;
  if (q.isError) return <ErrorBox error={q.error} />;
  const s = q.data;
  const hour = new Date().getHours();

  return (
    <>
      <PageHeader title={`Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${me.name.split(' ')[0]}`} subtitle="Here’s what’s happening in the store." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ShoppingBag} label="New orders" value={s.ordersByStatus.NEW ?? 0} hint={`${s.ordersToday} placed today`} to="/orders?status=NEW" />
        <Stat icon={Wallet} label="Payments to verify" value={s.pendingPayments} hint="Advance payments pending" to="/orders" tone="bg-amber-100 text-amber-700" />
        <Stat icon={IndianRupee} label="Last 30 days" value={formatINR(s.last30.revenue)} hint={`${s.last30.orders} orders · all-time ${formatINR(s.revenue)}`} tone="bg-emerald-100 text-emerald-700" />
        <Stat icon={MessageSquare} label="New enquiries" value={s.newEnquiries} hint={`${s.activeProducts} products live`} to="/enquiries" tone="bg-gold/20 text-amber-700" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Sales · last 30 days">
          <Chart daily={s.daily} />
        </Card>
        <Card title="Orders by status">
          <ul className="space-y-2.5">
            {ORDER_STATUSES.map((st) => (
              <li key={st}>
                <Link to={`/orders?status=${st}`} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-sand/60">
                  <StatusBadge status={st} />
                  <span className="tabular font-semibold">{s.ordersByStatus[st] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        className="mt-6"
        title="Latest orders"
        action={
          <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            All orders <ArrowRight className="size-4" />
          </Link>
        }
      >
        {s.recentOrders.length === 0 ? (
          <Empty icon={Package} title="No orders yet" text="Orders placed on the website show up here." />
        ) : (
          <ul className="divide-y divide-ink/5">
            {s.recentOrders.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-sand/40 sm:px-2">
                  <span className="font-mono text-sm font-semibold">{o.orderNo}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {o.name} · <span className="text-ink-soft">{o.city}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <CalendarClock className="size-3.5" /> {formatDate(o.createdAt)}
                  </span>
                  <StatusBadge status={o.status} />
                  <span className="tabular w-24 text-right font-semibold">{formatINR(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
