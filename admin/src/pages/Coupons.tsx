import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, TicketPercent, Trash2 } from 'lucide-react';
import { del, get, post, put } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Coupon } from '@/lib/types';
import { Badge, Button, Card, Empty, ErrorBox, errText, Field, Input, Modal, PageHeader, Spinner, Toggle, useToast } from '@/components/ui';

const day = (d: string | null) => (d ? d.slice(0, 10) : '');

function state(c: Coupon) {
  const now = new Date();
  if (!c.active) return ['Off', 'bg-zinc-100 text-zinc-600 ring-zinc-200'] as const;
  if (c.validTo && new Date(c.validTo) < now) return ['Expired', 'bg-zinc-100 text-zinc-600 ring-zinc-200'] as const;
  if (c.validFrom && new Date(c.validFrom) > now) return ['Scheduled', 'bg-blue-50 text-blue-700 ring-blue-200'] as const;
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return ['Used up', 'bg-zinc-100 text-zinc-600 ring-zinc-200'] as const;
  return ['Live', 'bg-emerald-50 text-emerald-700 ring-emerald-200'] as const;
}

export default function Coupons() {
  const coupons = useQuery({ queryKey: ['coupons'], queryFn: () => get<Coupon[]>('/admin/coupons') });
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);
  return (
    <>
      <PageHeader
        title="Coupons"
        subtitle="Extra % off that customers enter at checkout, on top of the store offer."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> New coupon
          </Button>
        }
      />
      {coupons.isPending ? (
        <Spinner />
      ) : coupons.isError ? (
        <ErrorBox error={coupons.error} />
      ) : coupons.data.length === 0 ? (
        <Card>
          <Empty icon={TicketPercent} title="No coupons" />
        </Card>
      ) : (
        <Card className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-ink/10 text-left text-xs font-semibold tracking-wide text-ink-soft uppercase">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-3 py-3">Discount</th>
                  <th className="px-3 py-3">Valid</th>
                  <th className="px-3 py-3">Used</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {coupons.data.map((c) => {
                  const [label, cls] = state(c);
                  return (
                    <tr key={c.id} onClick={() => setEditing(c)} className="cursor-pointer hover:bg-sand/40">
                      <td className="px-5 py-3.5 font-mono font-semibold">{c.code}</td>
                      <td className="px-3 py-3.5">{c.percent}% off</td>
                      <td className="px-3 py-3.5 text-ink-soft">
                        {c.validFrom || c.validTo ? `${c.validFrom ? formatDate(c.validFrom, false) : 'now'} → ${c.validTo ? formatDate(c.validTo, false) : 'no end'}` : 'Always'}
                      </td>
                      <td className="tabular px-3 py-3.5">
                        {c.usedCount}
                        {c.maxUses !== null ? ` / ${c.maxUses}` : ''}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={cls}>{label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {editing && <CouponModal coupon={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function CouponModal({ coupon, onClose }: { coupon?: Coupon; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [active, setActive] = useState(coupon?.active ?? true);
  const [error, setError] = useState<unknown>(null);
  const done = (msg: string) => {
    qc.invalidateQueries({ queryKey: ['coupons'] });
    toast('ok', msg);
    onClose();
  };
  const save = useMutation({
    mutationFn: (body: object) => (coupon ? put(`/admin/coupons/${coupon.id}`, body) : post('/admin/coupons', body)),
    onSuccess: () => done('Coupon saved'),
    onError: setError,
  });
  const remove = useMutation({ mutationFn: () => del(`/admin/coupons/${coupon!.id}`), onSuccess: () => done('Coupon deleted'), onError: (e) => toast('error', errText(e)) });

  return (
    <Modal open onClose={onClose} title={coupon ? `Edit ${coupon.code}` : 'New coupon'}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const max = String(f.get('maxUses') ?? '');
          save.mutate({
            code: f.get('code'),
            percent: Number(f.get('percent')),
            active,
            validFrom: f.get('validFrom') || undefined,
            validTo: f.get('validTo') ? `${f.get('validTo')}T23:59:59` : undefined,
            maxUses: max ? Number(max) : undefined,
          });
        }}
      >
        {error != null && (
          <div className="sm:col-span-2">
            <ErrorBox error={error} />
          </div>
        )}
        <Field label="Code" hint="Letters and numbers, e.g. DIWALI10">
          {(id) => <Input id={id} name="code" required defaultValue={coupon?.code} className="font-mono uppercase" maxLength={30} />}
        </Field>
        <Field label="Discount (%)">{(id) => <Input id={id} name="percent" type="number" min={1} max={90} required defaultValue={coupon?.percent ?? 5} />}</Field>
        <Field label="Starts (optional)">{(id) => <Input id={id} name="validFrom" type="date" defaultValue={day(coupon?.validFrom ?? null)} />}</Field>
        <Field label="Ends (optional)">{(id) => <Input id={id} name="validTo" type="date" defaultValue={day(coupon?.validTo ?? null)} />}</Field>
        <Field label="Max uses (optional)" hint={coupon ? `Used ${coupon.usedCount} times so far` : 'Leave empty for unlimited'}>
          {(id) => <Input id={id} name="maxUses" type="number" min={1} defaultValue={coupon?.maxUses ?? ''} />}
        </Field>
        <div className="flex items-end pb-2">
          <Toggle checked={active} onChange={setActive} label="Active" />
        </div>
        <div className="mt-2 flex items-center justify-between sm:col-span-2">
          {coupon ? (
            <Button type="button" variant="ghost" className="text-red-600" loading={remove.isPending} onClick={() => confirm(`Delete ${coupon.code}?`) && remove.mutate()}>
              <Trash2 className="size-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={save.isPending}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
