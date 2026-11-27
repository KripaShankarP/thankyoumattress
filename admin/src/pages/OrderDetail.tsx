import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Check, Copy, MapPin, MessageCircle, Phone, Plus, Printer, X } from 'lucide-react';
import { get, patch, post } from '@/lib/api';
import { cn, formatDate, formatINR, media, whatsappLink } from '@/lib/format';
import type { OrderDetail as Order, OrderStatus, PaymentMethod } from '@/lib/types';
import {
  Button,
  Card,
  ErrorBox,
  errText,
  Field,
  Input,
  Modal,
  ORDER_STATUSES,
  PaymentBadge,
  Select,
  Spinner,
  StatusBadge,
  statusLabel,
  Textarea,
  useToast,
} from '@/components/ui';

/** The next step offered as the main button for each status */
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { NEW: 'CONFIRMED', CONFIRMED: 'DISPATCHED', DISPATCHED: 'DELIVERED' };

export default function OrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const key = ['order', id];
  const order = useQuery({ queryKey: key, queryFn: () => get<Order>(`/admin/orders/${id}`) });
  const [statusOpen, setStatusOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const onSaved = (o: Order, msg: string) => {
    qc.setQueryData(key, o);
    qc.invalidateQueries({ queryKey: ['orders'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    toast('ok', msg);
  };

  const setStatus = useMutation({
    mutationFn: (body: { status: OrderStatus; note?: string }) => patch<Order>(`/admin/orders/${id}/status`, body),
    onSuccess: (o) => {
      onSaved(o, `Order marked ${statusLabel(o.status).toLowerCase()}`);
      setStatusOpen(false);
    },
    onError: (e) => toast('error', errText(e)),
  });

  const setPayment = useMutation({
    mutationFn: ({ paymentId, ...body }: { paymentId: string; status: 'VERIFIED' | 'FAILED'; utr?: string }) =>
      patch<Order>(`/admin/orders/${id}/payments/${paymentId}`, body),
    onSuccess: (o) => onSaved(o, 'Payment updated'),
    onError: (e) => toast('error', errText(e)),
  });

  if (order.isPending) return <Spinner />;
  if (order.isError) return <ErrorBox error={order.error} />;
  const o = order.data;
  const next = NEXT[o.status];
  const due = Math.max(0, o.total - o.paid);
  const address = `${o.address}, ${o.city} – ${o.pincode}`;

  return (
    <>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink print:hidden">
        <ArrowLeft className="size-4" /> Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold sm:text-3xl">{o.orderNo}</h1>
            <StatusBadge status={o.status} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Placed {formatDate(o.createdAt)} · {o.pieces} piece{o.pieces === 1 ? '' : 's'} · {formatINR(o.total)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
          <Button variant="secondary" onClick={() => setStatusOpen(true)}>
            Change status
          </Button>
          {next && (
            <Button loading={setStatus.isPending} onClick={() => setStatus.mutate({ status: next })}>
              <Check className="size-4" /> Mark {statusLabel(next).toLowerCase()}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card title="Items">
            <ul className="divide-y divide-ink/5">
              {o.items.map((i) => (
                <li key={i.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <img src={media(i.image)} alt="" className="size-16 shrink-0 rounded-xl bg-sand object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{i.productName}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {[i.model !== i.productName && i.model, i.thickness ? `${i.thickness}″` : null, `${i.size}${i.size === 'Standard' ? '' : ' in'}`, i.comfort]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {i.colour && (
                      <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                        Cover colour: {i.colour}
                      </p>
                    )}
                  </div>
                  <div className="tabular text-right text-sm">
                    <p className="font-semibold">{formatINR(i.lineTotal)}</p>
                    <p className="text-ink-soft">
                      {i.qty} × {formatINR(i.unitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="tabular mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
              <Row label="Subtotal" value={formatINR(o.subtotal)} />
              {o.discount > 0 && <Row label={`Coupon ${o.couponCode} (${o.couponPct}%)`} value={`−${formatINR(o.discount)}`} className="text-emerald-700" />}
              <Row label={`Delivery (${o.deliveryZone === 'delhi' ? 'Delhi, free' : `outside Delhi, ${o.pieces} pc`})`} value={o.shipping ? formatINR(o.shipping) : 'Free'} />
              <Row label={`GST (${o.gstPct}%)`} value={formatINR(o.gst)} />
              <Row label="Total" value={formatINR(o.total)} className="border-t border-ink/10 pt-2 text-base font-bold" />
              <Row label="Paid (verified)" value={formatINR(o.paid)} className="text-emerald-700" />
              {due > 0 && <Row label="Balance due" value={formatINR(due)} className="font-semibold text-amber-700" />}
            </dl>
          </Card>

          <Card
            title="Advance payment"
            action={
              <Button size="sm" variant="secondary" onClick={() => setPayOpen(true)} className="print:hidden">
                <Plus className="size-4" /> Record payment
              </Button>
            }
          >
            {o.payments.length === 0 ? (
              <p className="text-sm text-ink-soft">No payments recorded.</p>
            ) : (
              <ul className="space-y-3">
                {o.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-sand/50 p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {formatINR(p.amount)} · {p.method === 'UPI' ? 'UPI' : 'Bank transfer'} <PaymentBadge status={p.status} />
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {p.utr ? `Ref ${p.utr} · ` : ''}
                        {p.verifiedAt ? `verified ${formatDate(p.verifiedAt)}` : `added ${formatDate(p.createdAt)}`}
                        {p.note ? ` · ${p.note}` : ''}
                      </p>
                    </div>
                    {p.status === 'PENDING' && <VerifyPayment busy={setPayment.isPending} onVerify={(utr) => setPayment.mutate({ paymentId: p.id, status: 'VERIFIED', utr })} onFail={() => setPayment.mutate({ paymentId: p.id, status: 'FAILED' })} />}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-ink-soft print:hidden">
              Call the customer with the UPI / bank details, then enter the UPI reference (UTR) they share and verify it in your bank app before dispatching.
            </p>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Customer">
            <p className="text-lg font-semibold">{o.name}</p>
            <p className="text-sm text-ink-soft">
              {o.customerOrders > 1 ? `Returning customer · ${o.customerOrders} orders` : 'First order'}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a href={`tel:${o.phone}`} className="flex items-center gap-2 font-semibold text-brand hover:underline">
                <Phone className="size-4" /> {o.phone}
              </a>
              {o.email && (
                <a href={`mailto:${o.email}`} className="block text-ink-soft hover:underline">
                  {o.email}
                </a>
              )}
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ink-soft" /> {address}
              </p>
              {o.notes && <p className="rounded-xl bg-gold/15 p-3 text-amber-950">“{o.notes}”</p>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <a
                href={whatsappLink(o.phone, `Hello ${o.name}, thank you for your order ${o.orderNo} (${formatINR(o.total)}) with Thankyou Mattresses.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(`${o.name}\n${o.phone}\n${address}`).then(() => toast('ok', 'Address copied'))}
              >
                <Copy className="size-4" /> Copy address
              </Button>
            </div>
          </Card>

          <Card title="History">
            <ol className="relative space-y-4 border-l border-ink/10 pl-5">
              {o.statusLogs
                .slice()
                .reverse()
                .map((l) => (
                  <li key={l.id} className="relative">
                    <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-brand ring-4 ring-white" />
                    <p className="text-sm font-semibold">
                      {l.from && l.from !== l.to ? `${statusLabel(l.from)} → ${statusLabel(l.to)}` : l.from ? 'Note' : statusLabel(l.to)}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {formatDate(l.createdAt)}
                      {l.by ? ` · ${l.by}` : ''}
                    </p>
                    {l.note && <p className="mt-1 text-sm">{l.note}</p>}
                  </li>
                ))}
            </ol>
          </Card>
        </div>
      </div>

      <StatusModal open={statusOpen} onClose={() => setStatusOpen(false)} current={o.status} busy={setStatus.isPending} onSave={(b) => setStatus.mutate(b)} />
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        due={due}
        orderId={o.id}
        onSaved={(saved) => {
          onSaved(saved, 'Payment recorded');
          setPayOpen(false);
        }}
      />
    </>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex justify-between gap-4', className)}>
      <dt className="text-ink-soft">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function VerifyPayment({ busy, onVerify, onFail }: { busy: boolean; onVerify: (utr?: string) => void; onFail: () => void }) {
  const [utr, setUtr] = useState('');
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto print:hidden">
      <Input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="UTR / reference no." className="h-9 w-full sm:w-44" />
      <Button size="sm" loading={busy} onClick={() => onVerify(utr.trim() || undefined)}>
        <Check className="size-4" /> Verify
      </Button>
      <Button size="sm" variant="ghost" disabled={busy} onClick={onFail} title="Mark as failed">
        <X className="size-4" />
      </Button>
    </div>
  );
}

function StatusModal({ open, onClose, current, busy, onSave }: { open: boolean; onClose: () => void; current: OrderStatus; busy: boolean; onSave: (b: { status: OrderStatus; note?: string }) => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Change order status">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSave({ status: f.get('status') as OrderStatus, note: String(f.get('note') ?? '').trim() || undefined });
        }}
      >
        <Field label="Status">
          {(id) => (
            <Select id={id} name="status" defaultValue={current}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Note (optional)" hint="Saved in the order history, e.g. courier name or tracking number.">
          {(id) => <Textarea id={id} name="note" rows={3} maxLength={500} />}
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentModal({ open, onClose, due, orderId, onSaved }: { open: boolean; onClose: () => void; due: number; orderId: string; onSaved: (o: Order) => void }) {
  const toast = useToast();
  const save = useMutation({
    mutationFn: (body: { method: PaymentMethod; amount: number; utr?: string; note?: string; status: 'VERIFIED' | 'PENDING' }) =>
      post<Order>(`/admin/orders/${orderId}/payments`, body),
    onSuccess: onSaved,
    onError: (e) => toast('error', errText(e)),
  });
  return (
    <Modal open={open} onClose={onClose} title="Record a payment">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          save.mutate({
            method: f.get('method') as PaymentMethod,
            amount: Number(f.get('amount')),
            utr: String(f.get('utr') ?? '').trim() || undefined,
            note: String(f.get('note') ?? '').trim() || undefined,
            status: f.get('verified') ? 'VERIFIED' : 'PENDING',
          });
        }}
      >
        <Field label="Amount (₹)">{(id) => <Input id={id} name="amount" type="number" min={1} required defaultValue={due || undefined} />}</Field>
        <Field label="Method">
          {(id) => (
            <Select id={id} name="method" defaultValue="UPI">
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
            </Select>
          )}
        </Field>
        <Field label="UTR / reference no." className="sm:col-span-2">
          {(id) => <Input id={id} name="utr" maxLength={60} />}
        </Field>
        <Field label="Note (optional)" className="sm:col-span-2">
          {(id) => <Input id={id} name="note" maxLength={500} />}
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input type="checkbox" name="verified" defaultChecked className="size-4 accent-brand" /> I have checked this payment in the bank account
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            Save payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
