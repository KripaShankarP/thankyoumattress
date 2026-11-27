import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { ExternalLink, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Settings, ShoppingBag, TicketPercent, Video, X } from 'lucide-react';
import { get, post } from '@/lib/api';
import { cn, SITE_URL } from '@/lib/format';
import type { Dashboard } from '@/lib/types';
import { useMe } from '@/auth';


const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: ShoppingBag, badge: 'orders' as const },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/videos', label: 'Videos', icon: Video },
  { to: '/enquiries', label: 'Enquiries', icon: MessageSquare, badge: 'enquiries' as const },
  { to: '/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const me = useMe().data!;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Counts for the sidebar badges, refreshed every minute
  const stats = useQuery({ queryKey: ['dashboard'], queryFn: () => get<Dashboard>('/admin/dashboard'), refetchInterval: 60_000 });
  const counts = { orders: stats.data?.ordersByStatus.NEW ?? 0, enquiries: stats.data?.newEnquiries ?? 0 };

  async function signOut() {
    await post('/auth/sign-out').catch(() => {});
    qc.setQueryData(['me'], null);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
    navigate('/login');
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-night text-white">
      <div className="flex h-20 items-center justify-between px-5">
        <img src="/wordmark-light.png" alt="Thankyou Mattresses" className="h-11 w-auto" />
        <button className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <p className="px-5 pb-2 text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase">Store admin</p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-white text-night shadow-sm' : 'text-white/70 hover:bg-white/[0.07] hover:text-white',
              )
            }
          >
            <n.icon className="size-[18px]" />
            <span className="flex-1">{n.label}</span>
            {n.badge && counts[n.badge] > 0 && (
              <span className="grid min-w-6 place-items-center rounded-full bg-gold px-1.5 text-xs font-bold text-night">{counts[n.badge]}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href={SITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white">
          <ExternalLink className="size-[18px]" /> View website
        </a>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-gold text-sm font-bold text-night">{me.name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{me.name}</span>
            <span className="block truncate text-xs text-white/50">{me.role === 'OWNER' ? 'Owner' : 'Staff'} · {me.email}</span>
          </span>
          <button onClick={signOut} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-night/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">{sidebar}</aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink/10 bg-white/85 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl ring-1 ring-ink/10" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <img src="/wordmark.png" alt="Thankyou Mattresses" className="h-9 w-auto" />
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
