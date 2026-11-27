import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/format';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

/* ───────── Buttons ───────── */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md';
  loading?: boolean;
};

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-55',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-5 text-sm',
        variant === 'primary' && 'bg-brand text-white shadow-sm hover:bg-brand-dark',
        variant === 'gold' && 'bg-gold text-night shadow-sm hover:brightness-95',
        variant === 'secondary' && 'bg-white text-ink ring-1 ring-ink/15 hover:bg-sand/60',
        variant === 'ghost' && 'text-ink-soft hover:bg-ink/5 hover:text-ink',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ───────── Form fields ───────── */

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: (id: string) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children(id)}
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

const inputBase =
  'rounded-xl border border-ink/15 bg-white text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-sand/50';

/** Defaults that a caller's own width, height or padding replace (instead of fighting them) */
const sized = (className = '', h = 'h-11') =>
  cn(inputBase, !/(^|\s)w-/.test(className) && 'w-full', !/(^|\s)h-/.test(className) && h, !/(^|\s)px-/.test(className) && 'px-3.5', className);

export const Input = ({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) => <input className={sized(className)} {...p} />;

export const Textarea = ({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={sized(cn('py-2.5 leading-relaxed', className), '')} {...p} />
);

export const Select = ({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={sized(cn('pr-8', className))} {...p} />
);

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-brand' : 'bg-ink/20')}
      >
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
}

/* ───────── Layout pieces ───────── */

export function Card({ className, children, title, action }: { className?: string; children: React.ReactNode; title?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className={cn('rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-ink/[0.07] sm:p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-soft">
      <Loader2 className="size-5 animate-spin" /> {label}
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
      <AlertCircle className="mt-0.5 size-5 shrink-0" />
      <span>{error instanceof Error ? error.message : 'Something went wrong'}</span>
    </div>
  );
}

export function Empty({ icon: Icon, title, text, action }: { icon: React.ElementType; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-sand text-ink-soft">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-soft">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ───────── Badges ───────── */

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  NEW: { label: 'New', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  DISPATCHED: { label: 'Dispatched', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  DELIVERED: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-zinc-100 text-zinc-600 ring-zinc-200' },
};
export const ORDER_STATUSES = Object.keys(STATUS) as OrderStatus[];
export const statusLabel = (s: OrderStatus) => STATUS[s].label;

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', className)}>{children}</span>;
}

export const StatusBadge = ({ status }: { status: OrderStatus }) => <Badge className={STATUS[status].cls}>{STATUS[status].label}</Badge>;

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map = {
    PENDING: ['Pending', 'bg-amber-50 text-amber-800 ring-amber-200'],
    VERIFIED: ['Verified', 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
    FAILED: ['Failed', 'bg-red-50 text-red-700 ring-red-200'],
  } as const;
  return <Badge className={map[status][1]}>{map[status][0]}</Badge>;
}

/* ───────── Modal ───────── */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-night/50 backdrop:backdrop-blur-sm',
        wide ? 'max-w-3xl' : 'max-w-lg',
      )}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-ink/5" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/* ───────── Toasts ───────── */

type Toast = { id: number; kind: 'ok' | 'error'; text: string };
const ToastCtx = createContext<(kind: Toast['kind'], text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl',
              t.kind === 'ok' ? 'bg-night' : 'bg-red-600',
            )}
          >
            {t.kind === 'ok' ? <CheckCircle2 className="size-4 shrink-0 text-gold" /> : <AlertCircle className="size-4 shrink-0" />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** Message for a failed mutation */
export const errText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');
