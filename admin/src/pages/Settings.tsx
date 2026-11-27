import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Trash2, UserPlus } from 'lucide-react';
import { del, get, patch, post, put } from '@/lib/api';
import { formatDate, formatINR, offerPrice } from '@/lib/format';
import type { AdminAccount, Colour, Settings as StoreSettings } from '@/lib/types';
import { useMe } from '@/auth';
import { Badge, Button, Card, ErrorBox, errText, Field, Input, Modal, PageHeader, Select, Spinner, Toggle, useToast } from '@/components/ui';

export default function Settings() {
  const me = useMe().data!;
  return (
    <>
      <PageHeader title="Settings" subtitle="Store-wide prices and charges, cover colours and who can sign in." />
      <div className="grid gap-6 xl:grid-cols-2">
        <StoreCard />
        <ColoursCard />
        {me.role === 'OWNER' && <AdminsCard />}
        <PasswordCard />
      </div>
    </>
  );
}

function StoreCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: ['settings'], queryFn: () => get<StoreSettings>('/admin/settings') });
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const s = draft ?? q.data;
  const save = useMutation({
    mutationFn: (body: StoreSettings) => put<StoreSettings>('/admin/settings', body),
    onSuccess: (saved) => {
      qc.setQueryData(['settings'], saved);
      qc.invalidateQueries({ queryKey: ['products'] });
      setDraft(null);
      toast('ok', 'Settings saved — the website is updated');
    },
    onError: (e) => toast('error', errText(e)),
  });
  if (q.isPending) return <Card title="Prices & charges"><Spinner /></Card>;
  if (q.isError || !s) return <ErrorBox error={q.error} />;
  const set = (patch: Partial<StoreSettings>) => setDraft({ ...s, ...patch });

  return (
    <Card title="Prices & charges">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(s);
        }}
      >
        <Field label="Store offer (% off MRP)" hint={`An MRP of ₹10,000 sells for ${formatINR(offerPrice(10000, s.offerPct))}`}>
          {(id) => <Input id={id} type="number" min={0} max={90} required value={s.offerPct} onChange={(e) => set({ offerPct: Number(e.target.value) })} />}
        </Field>
        <Field label="GST (%)" hint="Added on top at checkout">
          {(id) => <Input id={id} type="number" min={0} max={40} required value={s.gstPct} onChange={(e) => set({ gstPct: Number(e.target.value) })} />}
        </Field>
        <Field label="Delivery outside free area (₹ per piece)">
          {(id) => <Input id={id} type="number" min={0} required value={s.deliveryPerPiece} onChange={(e) => set({ deliveryPerPiece: Number(e.target.value) })} />}
        </Field>
        <Field label="Free delivery pincodes" hint="Pincode starts, comma separated. 110 = all of Delhi; add 122, 201, 121 for Gurgaon, Noida, Faridabad.">
          {(id) => (
            <Input
              id={id}
              value={s.freePincodePrefixes.join(', ')}
              onChange={(e) => set({ freePincodePrefixes: e.target.value.split(/[,\s]+/).filter(Boolean) })}
            />
          )}
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          {draft && (
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              Undo
            </Button>
          )}
          <Button type="submit" loading={save.isPending} disabled={!draft}>
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ColoursCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: ['colours'], queryFn: () => get<Colour[]>('/admin/colours') });
  const [editing, setEditing] = useState<Colour | 'new' | null>(null);
  const toggle = useMutation({
    mutationFn: (c: Colour) => put(`/admin/colours/${c.id}`, { name: c.name, hex: c.hex, sortOrder: c.sortOrder, active: !c.active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['colours'] }),
    onError: (e) => toast('error', errText(e)),
  });

  return (
    <Card
      title="Cover colours"
      action={
        <Button size="sm" variant="secondary" onClick={() => setEditing('new')}>
          <Plus className="size-4" /> Colour
        </Button>
      }
    >
      <p className="mb-4 text-sm text-ink-soft">Customers pick one of these before ordering a mattress. Turn one off to stop offering it.</p>
      {q.isPending ? (
        <Spinner />
      ) : q.isError ? (
        <ErrorBox error={q.error} />
      ) : (
        <ul className="divide-y divide-ink/5">
          {q.data.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2.5">
              <span className="size-8 shrink-0 rounded-full ring-1 ring-black/10 ring-inset" style={{ background: c.hex }} />
              <button onClick={() => setEditing(c)} className="min-w-0 flex-1 text-left">
                <span className="block font-semibold hover:underline">{c.name}</span>
                <span className="block font-mono text-xs text-ink-soft">
                  {c.hex}
                  {c._count?.products ? ` · chosen on ${c._count.products} product${c._count.products === 1 ? '' : 's'}` : ''}
                </span>
              </button>
              <Toggle checked={c.active} onChange={() => toggle.mutate(c)} label="" />
            </li>
          ))}
        </ul>
      )}
      {editing && <ColourModal colour={editing === 'new' ? undefined : editing} count={q.data?.length ?? 0} onClose={() => setEditing(null)} />}
    </Card>
  );
}

function ColourModal({ colour, count, onClose }: { colour?: Colour; count: number; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [hex, setHex] = useState(colour?.hex ?? '#2c4a9a');
  const [error, setError] = useState<unknown>(null);
  const done = (msg: string) => {
    qc.invalidateQueries({ queryKey: ['colours'] });
    toast('ok', msg);
    onClose();
  };
  const save = useMutation({
    mutationFn: (body: object) => (colour ? put(`/admin/colours/${colour.id}`, body) : post('/admin/colours', body)),
    onSuccess: () => done('Colour saved'),
    onError: setError,
  });
  const remove = useMutation({ mutationFn: () => del(`/admin/colours/${colour!.id}`), onSuccess: () => done('Colour deleted'), onError: (e) => toast('error', errText(e)) });
  return (
    <Modal open onClose={onClose} title={colour ? `Edit ${colour.name}` : 'New colour'}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          save.mutate({ name: f.get('name'), hex, active: colour?.active ?? true, sortOrder: Number(f.get('sortOrder')) || 0 });
        }}
      >
        {error != null && <ErrorBox error={error} />}
        <Field label="Name">{(id) => <Input id={id} name="name" required maxLength={40} defaultValue={colour?.name} placeholder="e.g. Teal" />}</Field>
        <Field label="Colour">
          {(id) => (
            <div className="flex items-center gap-3">
              <input id={id} type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-ink/15" />
              <Input value={hex} onChange={(e) => setHex(e.target.value)} className="w-32 font-mono" aria-label="Hex code" />
            </div>
          )}
        </Field>
        <Field label="Display order">{(id) => <Input id={id} name="sortOrder" type="number" min={0} defaultValue={colour?.sortOrder ?? count} />}</Field>
        <div className="flex items-center justify-between">
          {colour ? (
            <Button type="button" variant="ghost" className="text-red-600" loading={remove.isPending} onClick={() => confirm(`Delete ${colour.name}? Past orders keep it.`) && remove.mutate()}>
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

function AdminsCard() {
  const me = useMe().data!;
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: ['admins'], queryFn: () => get<AdminAccount[]>('/admin/users') });
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState<AdminAccount | null>(null);
  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string; active?: boolean; password?: string }) => patch(`/admin/users/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast('ok', 'Admin updated');
      setResetting(null);
    },
    onError: (e) => toast('error', errText(e)),
  });
  const create = useMutation({
    mutationFn: (body: object) => post('/admin/users', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast('ok', 'Admin added');
      setAdding(false);
    },
    onError: (e) => toast('error', errText(e)),
  });

  return (
    <Card
      title="Admins"
      action={
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
          <UserPlus className="size-4" /> Add
        </Button>
      }
    >
      <p className="mb-4 text-sm text-ink-soft">Staff can manage orders, products and videos. Only owners manage admins.</p>
      {q.isPending ? (
        <Spinner />
      ) : q.isError ? (
        <ErrorBox error={q.error} />
      ) : (
        <ul className="divide-y divide-ink/5">
          {q.data.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-night text-sm font-bold text-gold">{a.name.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold">
                  {a.name} {a.id === me.id && <span className="text-xs font-normal text-ink-soft">(you)</span>}
                </span>
                <span className="block truncate text-xs text-ink-soft">
                  {a.email} · {a.lastLoginAt ? `last sign-in ${formatDate(a.lastLoginAt)}` : 'never signed in'}
                </span>
              </span>
              <Badge className={a.role === 'OWNER' ? 'bg-gold/20 text-amber-900 ring-gold/40' : 'bg-sand text-ink-soft ring-ink/10'}>{a.role === 'OWNER' ? 'Owner' : 'Staff'}</Badge>
              {!a.active && <Badge className="bg-zinc-100 text-zinc-600 ring-zinc-200">Disabled</Badge>}
              {a.id !== me.id && (
                <span className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setResetting(a)}>
                    <KeyRound className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: a.id, active: !a.active })}>
                    {a.active ? 'Disable' : 'Enable'}
                  </Button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add an admin">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            create.mutate({ name: f.get('name'), email: f.get('email'), password: f.get('password'), role: f.get('role') });
          }}
        >
          <Field label="Name">{(id) => <Input id={id} name="name" required minLength={2} />}</Field>
          <Field label="Email">{(id) => <Input id={id} name="email" type="email" required />}</Field>
          <Field label="Password" hint="At least 8 characters. Share it with them privately.">
            {(id) => <Input id={id} name="password" type="text" required minLength={8} autoComplete="new-password" />}
          </Field>
          <Field label="Role">
            {(id) => (
              <Select id={id} name="role" defaultValue="STAFF">
                <option value="STAFF">Staff</option>
                <option value="OWNER">Owner</option>
              </Select>
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              Add admin
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetting} onClose={() => setResetting(null)} title={`New password for ${resetting?.name ?? ''}`}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({ id: resetting!.id, password: String(new FormData(e.currentTarget).get('password')) });
          }}
        >
          <Field label="New password" hint="They are signed out everywhere and must use this one.">
            {(id) => <Input id={id} name="password" type="text" required minLength={8} autoComplete="new-password" />}
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setResetting(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={update.isPending}>
              Set password
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [error, setError] = useState<unknown>(null);
  const change = useMutation({
    mutationFn: (body: { current: string; next: string }) => post('/auth/password', body),
    onSuccess: () => {
      setError(null);
      toast('ok', 'Password changed');
    },
    onError: setError,
  });
  return (
    <Card title="Your password">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          if (f.get('next') !== f.get('confirm')) return setError(new Error('The new passwords don’t match'));
          change.mutate({ current: String(f.get('current')), next: String(f.get('next')) }, { onSuccess: () => form.reset() });
        }}
      >
        {error != null && <ErrorBox error={error} />}
        <Field label="Current password">{(id) => <Input id={id} name="current" type="password" required autoComplete="current-password" />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password">{(id) => <Input id={id} name="next" type="password" required minLength={8} autoComplete="new-password" />}</Field>
          <Field label="Repeat new password">{(id) => <Input id={id} name="confirm" type="password" required minLength={8} autoComplete="new-password" />}</Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={change.isPending}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  );
}
