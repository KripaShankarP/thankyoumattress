import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { AlertCircle, ArrowLeft, ExternalLink, Plus, Save, Trash2, X } from 'lucide-react';
import { ApiError, del, get, post, put } from '@/lib/api';
import { cn, formatINR, offerPrice, SITE_URL } from '@/lib/format';
import type { Colour, Firmness, ProductInput, Settings } from '@/lib/types';
import { Button, Card, ErrorBox, errText, Field, Input, Modal, Select, Spinner, Textarea, Toggle, useToast } from '@/components/ui';
import { ImageList } from '@/components/MediaUpload';

const STD_SIZES = ['72 x 30', '72 x 36', '72 x 48', '72 x 60', '72 x 72', '75 x 35', '78 x 35'];

const blank = (): ProductInput => ({
  slug: '',
  code: '',
  name: '',
  category: 'MATTRESS',
  tagline: '',
  description: [],
  features: [],
  firmness: 'MEDIUM',
  warrantyYears: undefined,
  cloth: '',
  badge: '',
  featured: false,
  active: true,
  hasColours: true,
  sortOrder: 0,
  images: [],
  sizes: [...STD_SIZES],
  variants: [{ model: '', thickness: 5, prices: STD_SIZES.map(() => null) }],
  constructions: [],
  comfortOptions: [],
  colourIds: [],
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export default function ProductEditor() {
  const { id } = useParams();
  const existing = useQuery({
    queryKey: ['product', id],
    queryFn: () => get<ProductInput & { id: string }>(`/admin/products/${id}`),
    enabled: !!id,
  });
  if (id && existing.isPending) return <Spinner />;
  if (id && existing.isError) return <ErrorBox error={existing.error} />;
  // key: a fresh editor (and fresh state) per product
  return <Editor key={id ?? 'new'} id={id} initial={existing.data ?? blank()} />;
}

function Editor({ id, initial }: { id?: string; initial: ProductInput }) {
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [p, setP] = useState<ProductInput>(() => ({ ...initial, code: initial.code ?? '', cloth: initial.cloth ?? '', badge: initial.badge ?? '' }));
  const [slugTouched, setSlugTouched] = useState(!!id);
  // Kept as typed; turned into lists when saving
  const [descText, setDescText] = useState(initial.description.join('\n\n'));
  const [featText, setFeatText] = useState(initial.features.join('\n'));
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const settings = useQuery({ queryKey: ['settings'], queryFn: () => get<Settings>('/admin/settings') });
  const colours = useQuery({ queryKey: ['colours'], queryFn: () => get<Colour[]>('/admin/colours') });
  const offer = settings.data?.offerPct ?? 0;

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setP((x) => ({ ...x, [k]: v }));

  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...p,
        sortOrder: Number(p.sortOrder) || 0,
        description: descText.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
        features: featText.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      return id ? put<ProductInput & { id: string }>(`/admin/products/${id}`, body) : post<ProductInput & { id: string }>('/admin/products', body);
    },
    onSuccess: (saved) => {
      setErrors([]);
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.setQueryData(['product', saved.id], saved);
      toast('ok', id ? 'Product saved — the website is updated' : 'Product created');
      if (!id) navigate(`/products/${saved.id}`, { replace: true });
    },
    onError: (e) => {
      setErrors(e instanceof ApiError ? e.messages : [errText(e)]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const remove = useMutation({
    mutationFn: () => del(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast('ok', 'Product deleted');
      navigate('/products');
    },
    onError: (e) => toast('error', errText(e)),
  });

  /* Price grid helpers */
  const setSizes = (sizes: string[], map: (prices: (number | null)[]) => (number | null)[]) =>
    setP((x) => ({ ...x, sizes, variants: x.variants.map((v) => ({ ...v, prices: map(v.prices) })) }));
  const addSize = () => setSizes([...p.sizes, ''], (pr) => [...pr, null]);
  const removeSize = (i: number) => setSizes(p.sizes.filter((_, k) => k !== i), (pr) => pr.filter((_, k) => k !== i));
  const renameSize = (i: number, label: string) => set('sizes', p.sizes.map((s, k) => (k === i ? label : s)));
  const setVariant = (i: number, patch: Partial<ProductInput['variants'][number]>) =>
    set('variants', p.variants.map((v, k) => (k === i ? { ...v, ...patch } : v)));
  const setPrice = (vi: number, si: number, raw: string) => {
    const n = raw.trim() === '' ? null : Math.round(Number(raw));
    setVariant(vi, { prices: p.variants[vi].prices.map((x, k) => (k === si ? (Number.isFinite(n) && n !== 0 ? n : null) : x)) });
  };
  const addVariant = () => {
    const last = p.variants.at(-1);
    set('variants', [...p.variants, { model: last?.model ?? '', thickness: (last?.thickness ?? 4) + 1, prices: p.sizes.map(() => null) }]);
  };

  const isPillow = p.category === 'PILLOW';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="pb-28"
    >
      <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{id ? p.name || 'Edit product' : 'New product'}</h1>
          <p className="mt-1 text-sm text-ink-soft">Enter MRPs (list prices). The website shows them struck through with the {offer}% offer price.</p>
        </div>
        {id && initial.slug && (
          <a href={`${SITE_URL}/product/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
            View on website <ExternalLink className="size-4" />
          </a>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200" role="alert">
          <p className="flex items-center gap-2 font-semibold">
            <AlertCircle className="size-4" /> Please fix these before saving:
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-6">
            {errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                {(fid) => (
                  <Input
                    id={fid}
                    required
                    value={p.name}
                    placeholder="e.g. Royale Series"
                    onChange={(e) => {
                      set('name', e.target.value);
                      if (!slugTouched) set('slug', slugify(e.target.value));
                    }}
                  />
                )}
              </Field>
              <Field label="Web address" hint={`${SITE_URL.replace(/^https?:\/\//, '')}/product/${p.slug || '…'}`}>
                {(fid) => (
                  <Input
                    id={fid}
                    required
                    value={p.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set('slug', slugify(e.target.value));
                    }}
                  />
                )}
              </Field>
              <Field label="Product code" hint="Optional, e.g. M-002">
                {(fid) => <Input id={fid} value={p.code} onChange={(e) => set('code', e.target.value)} maxLength={20} />}
              </Field>
              <Field label="Category">
                {(fid) => (
                  <Select
                    id={fid}
                    value={p.category}
                    onChange={(e) => {
                      const category = e.target.value as ProductInput['category'];
                      setP((x) => ({
                        ...x,
                        category,
                        hasColours: category === 'MATTRESS',
                        // a fresh pillow starts with one "Standard" size
                        ...(category === 'PILLOW' && !id && x.variants.every((v) => v.prices.every((pr) => pr === null))
                          ? { sizes: ['Standard'], variants: [{ model: x.name || '', thickness: 0, prices: [null] }] }
                          : {}),
                      }));
                    }}
                  >
                    <option value="MATTRESS">Mattress</option>
                    <option value="PILLOW">Pillow</option>
                  </Select>
                )}
              </Field>
              <Field label="Feel">
                {(fid) => (
                  <Select id={fid} value={p.firmness} onChange={(e) => set('firmness', e.target.value as Firmness)}>
                    <option value="SOFT">Soft</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="FIRM">Firm</option>
                    <option value="DUAL_COMFORT">Dual comfort</option>
                  </Select>
                )}
              </Field>
              <Field label="Tagline" className="sm:col-span-2">
                {(fid) => <Input id={fid} required value={p.tagline} maxLength={200} placeholder="One line shown under the name" onChange={(e) => set('tagline', e.target.value)} />}
              </Field>
              <Field label="Badge" hint="Optional label on the card, e.g. Bestseller">
                {(fid) => <Input id={fid} value={p.badge} maxLength={40} onChange={(e) => set('badge', e.target.value)} />}
              </Field>
              <Field label="Warranty (years)">
                {(fid) => (
                  <Input
                    id={fid}
                    type="number"
                    min={0}
                    max={30}
                    value={p.warrantyYears ?? ''}
                    onChange={(e) => set('warrantyYears', e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                )}
              </Field>
              <Field label="Cover cloth" hint="Optional, e.g. Premium quilted cloth" className="sm:col-span-2">
                {(fid) => <Input id={fid} value={p.cloth} maxLength={120} onChange={(e) => set('cloth', e.target.value)} />}
              </Field>
            </div>
          </Card>

          <Card title="Photos">
            <ImageList value={p.images} onChange={(images) => set('images', images)} />
          </Card>

          <Card
            title="Sizes & MRP"
            action={
              !isPillow && (
                <Button type="button" size="sm" variant="secondary" onClick={addSize}>
                  <Plus className="size-4" /> Size
                </Button>
              )
            }
          >
            <p className="mb-3 text-sm text-ink-soft">
              One row per {isPillow ? 'variant' : 'model and thickness'}. Leave a box empty if that size isn’t sold. Grey numbers are what customers pay ({offer}% off).
            </p>
            <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="pr-2 pb-2 text-left text-xs font-semibold text-ink-soft">Model</th>
                    {!isPillow && <th className="pr-2 pb-2 text-left text-xs font-semibold text-ink-soft">Inch</th>}
                    {p.sizes.map((s, si) => (
                      <th key={si} className="pr-2 pb-2">
                        <div className="flex items-center gap-1">
                          <Input value={s} onChange={(e) => renameSize(si, e.target.value)} className="h-9 w-24 px-2 text-center text-xs font-semibold" aria-label={`Size ${si + 1}`} />
                          {p.sizes.length > 1 && (
                            <button type="button" onClick={() => removeSize(si)} className="text-ink-soft hover:text-red-600" aria-label={`Remove size ${s}`}>
                              <X className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map((v, vi) => (
                    <tr key={vi} className="align-top">
                      <td className="pr-2 pb-2">
                        <Input value={v.model} onChange={(e) => setVariant(vi, { model: e.target.value })} placeholder="Model" className="h-9 w-32 px-2" aria-label="Model" required />
                      </td>
                      {!isPillow && (
                        <td className="pr-2 pb-2">
                          <Input type="number" min={0} max={24} value={v.thickness} onChange={(e) => setVariant(vi, { thickness: Number(e.target.value) })} className="h-9 w-16 px-2" aria-label="Thickness in inches" />
                        </td>
                      )}
                      {p.sizes.map((_, si) => {
                        const mrp = v.prices[si];
                        return (
                          <td key={si} className="pr-2 pb-2">
                            <Input
                              type="number"
                              min={1}
                              inputMode="numeric"
                              value={mrp ?? ''}
                              onChange={(e) => setPrice(vi, si, e.target.value)}
                              placeholder="—"
                              className="tabular h-9 w-24 px-2 text-right"
                              aria-label={`MRP ${v.model} ${v.thickness}″ ${p.sizes[si]}`}
                            />
                            <span className="tabular block pt-0.5 pr-1 text-right text-[11px] text-ink-soft">{mrp ? formatINR(offerPrice(mrp, offer)) : ' '}</span>
                          </td>
                        );
                      })}
                      <td className="pb-2">
                        {p.variants.length > 1 && (
                          <button type="button" onClick={() => set('variants', p.variants.filter((_, k) => k !== vi))} className="grid size-9 place-items-center text-ink-soft hover:text-red-600" aria-label="Remove row">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={addVariant} className="mt-2">
              <Plus className="size-4" /> Price row
            </Button>
          </Card>

          <Card title="Description">
            <Field label="About this product" hint="Separate paragraphs with an empty line.">
              {(fid) => (
                <Textarea id={fid} rows={7} value={descText} onChange={(e) => setDescText(e.target.value)} />
              )}
            </Field>
            <Field label="Highlights" hint="One per line, e.g. 7 year warranty" className="mt-4">
              {(fid) => (
                <Textarea id={fid} rows={4} value={featText} onChange={(e) => setFeatText(e.target.value)} />
              )}
            </Field>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Visibility">
            <div className="space-y-4">
              <Toggle checked={p.active} onChange={(v) => set('active', v)} label="Show on website" hint="Hidden products keep their orders but can’t be bought." />
              <Toggle checked={p.featured} onChange={(v) => set('featured', v)} label="Featured" hint="Shown in bestsellers on the home page." />
              <Field label="Display order" hint="Lower numbers come first.">
                {(fid) => <Input id={fid} type="number" min={0} value={p.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />}
              </Field>
            </div>
          </Card>

          <Card title="Cover colours">
            <Toggle checked={p.hasColours} onChange={(v) => set('hasColours', v)} label="Customer picks a colour" hint="They must choose one before ordering." />
            {p.hasColours && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-ink-soft">{p.colourIds.length ? 'Only the ticked colours:' : 'All active colours are offered. Tick some to offer only those:'}</p>
                <div className="flex flex-wrap gap-2">
                  {(colours.data ?? []).map((c) => {
                    const on = p.colourIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => set('colourIds', on ? p.colourIds.filter((x) => x !== c.id) : [...p.colourIds, c.id])}
                        className={cn('flex items-center gap-2 rounded-full border-2 py-1 pr-3 pl-1 text-sm font-medium', on ? 'border-brand bg-brand/5' : 'border-ink/10', !c.active && 'opacity-50')}
                        title={c.active ? undefined : 'Turned off in Settings'}
                      >
                        <span className="size-6 rounded-full ring-1 ring-black/10 ring-inset" style={{ background: c.hex }} />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <Link to="/settings" className="mt-3 inline-block text-xs font-semibold text-brand hover:underline">
                  Manage colours →
                </Link>
              </div>
            )}
          </Card>

          <Card title="Comfort options">
            <p className="mb-3 text-sm text-ink-soft">Choices that don’t change the price, e.g. Ortho-Bondo, Softy-Puff.</p>
            <ChipInput value={p.comfortOptions} onChange={(v) => set('comfortOptions', v)} placeholder="Add an option and press Enter" />
          </Card>

          <Card
            title="What’s inside"
            action={
              <Button type="button" size="sm" variant="secondary" onClick={() => set('constructions', [...p.constructions, { name: '', detail: '' }])}>
                <Plus className="size-4" /> Add
              </Button>
            }
          >
            {p.constructions.length === 0 && <p className="text-sm text-ink-soft">Layers or variants explained on the product page.</p>}
            <div className="space-y-3">
              {p.constructions.map((c, i) => (
                <div key={i} className="rounded-xl bg-sand/50 p-3">
                  <div className="flex gap-2">
                    <Input
                      value={c.name}
                      placeholder="Name, e.g. Softy-Bondo"
                      onChange={(e) => set('constructions', p.constructions.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))}
                      className="h-9"
                      required
                    />
                    <button type="button" onClick={() => set('constructions', p.constructions.filter((_, k) => k !== i))} className="grid size-9 shrink-0 place-items-center text-ink-soft hover:text-red-600" aria-label="Remove">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <Textarea
                    value={c.detail}
                    rows={2}
                    placeholder="Detail, e.g. Layer of softy foam over HD rebonded foam"
                    onChange={(e) => set('constructions', p.constructions.map((x, k) => (k === i ? { ...x, detail: e.target.value } : x)))}
                    className="mt-2"
                    required
                  />
                </div>
              ))}
            </div>
          </Card>

          {id && (
            <Card title="Danger zone">
              <p className="mb-3 text-sm text-ink-soft">Deleting removes the product from the website. Past orders keep their details.</p>
              <Button type="button" variant="secondary" className="text-red-600" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4" /> Delete product
              </Button>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/90 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/products" className="text-sm font-semibold text-ink-soft hover:text-ink">
            Cancel
          </Link>
          <Button type="submit" loading={save.isPending}>
            <Save className="size-4" /> {id ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`Delete ${p.name}?`}>
        <p className="text-sm text-ink-soft">The product disappears from the website straight away. This can’t be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>
            Keep it
          </Button>
          <Button type="button" variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>
            Delete
          </Button>
        </div>
      </Modal>
    </form>
  );
}

/** Small tag list: type and press Enter to add */
function ChipInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText('');
  };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-sand py-1 pr-1.5 pl-3 text-sm font-medium">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="grid size-5 place-items-center rounded-full hover:bg-ink/10" aria-label={`Remove ${v}`}>
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}
