import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Film, MonitorPlay as Youtube, Pencil, Play, Plus, Star, Trash2 } from 'lucide-react';
import { ApiError, del, get, post, put } from '@/lib/api';
import { cn, media } from '@/lib/format';
import type { ProductRow, Video } from '@/lib/types';
import { Badge, Button, Card, Empty, ErrorBox, errText, Field, Input, Modal, PageHeader, Select, Spinner, Toggle, useToast } from '@/components/ui';
import { SingleUpload } from '@/components/MediaUpload';

type Form = {
  title: string;
  source: 'youtube' | 'file';
  youtube: string;
  fileUrl?: string;
  posterUrl?: string;
  isShort: boolean;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  productId: string;
};

const toForm = (v?: Video): Form => ({
  title: v?.title ?? '',
  source: v && !v.youtubeId ? 'file' : 'youtube',
  youtube: v?.youtubeId ? `https://youtu.be/${v.youtubeId}` : '',
  fileUrl: v?.fileUrl ?? undefined,
  posterUrl: v?.posterUrl ?? undefined,
  isShort: v?.isShort ?? true,
  featured: v?.featured ?? false,
  active: v?.active ?? true,
  sortOrder: v?.sortOrder ?? 0,
  productId: v?.productId ?? '',
});

const poster = (v: Video) => v.posterUrl ?? (v.youtubeId ? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg` : null);

export default function Videos() {
  const videos = useQuery({ queryKey: ['videos'], queryFn: () => get<Video[]>('/admin/videos') });
  const [editing, setEditing] = useState<Video | 'new' | null>(null);
  const [filter, setFilter] = useState<'all' | 'long' | 'short'>('all');
  const list = (videos.data ?? []).filter((v) => filter === 'all' || (filter === 'short' ? v.isShort : !v.isShort));

  return (
    <>
      <PageHeader
        title="Videos"
        subtitle="YouTube links or your own video files. Link a video to a product to show it on that product’s page."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Add video
          </Button>
        }
      />
      <div className="mb-4 flex gap-1">
        {(['all', 'long', 'short'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full px-3.5 py-2 text-sm font-semibold', filter === f ? 'bg-night text-white' : 'bg-white text-ink-soft ring-1 ring-ink/10')}>
            {f === 'all' ? 'All' : f === 'long' ? 'Full videos' : 'Shorts'}
          </button>
        ))}
      </div>
      {videos.isPending ? (
        <Spinner />
      ) : videos.isError ? (
        <ErrorBox error={videos.error} />
      ) : list.length === 0 ? (
        <Card>
          <Empty icon={Film} title="No videos" text="Add a YouTube link or upload a video." action={<Button onClick={() => setEditing('new')}>Add video</Button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => {
            const src = poster(v);
            return (
              <button key={v.id} onClick={() => setEditing(v)} className="group overflow-hidden rounded-2xl bg-white text-left ring-1 ring-ink/[0.07] transition hover:ring-brand/40">
                <span className={cn('relative block overflow-hidden bg-night', v.isShort ? 'aspect-[4/5]' : 'aspect-video')}>
                  {src ? (
                    <img src={media(src)} alt="" className="size-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <video src={`${v.fileUrl}#t=0.5`} preload="metadata" muted className="size-full object-cover" />
                  )}
                  <span className="absolute top-2 left-2 flex gap-1">
                    {v.youtubeId ? <Badge className="bg-red-600 text-white ring-red-600"><Youtube className="size-3" /> YouTube</Badge> : <Badge className="bg-night text-white ring-night"><Play className="size-3" /> File</Badge>}
                  </span>
                  {v.featured && <Star className="absolute top-2 right-2 size-5 fill-gold text-gold" />}
                  {!v.active && <span className="absolute inset-0 grid place-items-center bg-night/60 text-sm font-semibold text-white">Hidden</span>}
                </span>
                <span className="block p-3">
                  <span className="line-clamp-2 text-sm font-semibold">{v.title}</span>
                  <span className="mt-1 flex items-center justify-between text-xs text-ink-soft">
                    <span className="truncate">{v.product?.name ?? 'Not linked to a product'}</span>
                    <Pencil className="size-3.5 shrink-0 opacity-0 group-hover:opacity-100" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      {editing && <VideoModal video={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function VideoModal({ video, onClose }: { video?: Video; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [f, setF] = useState<Form>(() => toForm(video));
  const [error, setError] = useState<unknown>(null);
  const products = useQuery({ queryKey: ['products'], queryFn: () => get<ProductRow[]>('/admin/products') });
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const done = (msg: string) => {
    qc.invalidateQueries({ queryKey: ['videos'] });
    toast('ok', msg);
    onClose();
  };
  const save = useMutation({
    mutationFn: () => {
      const body = {
        title: f.title,
        youtube: f.source === 'youtube' ? f.youtube : undefined,
        fileUrl: f.source === 'file' ? f.fileUrl : undefined,
        posterUrl: f.posterUrl,
        isShort: f.isShort,
        featured: f.featured,
        active: f.active,
        sortOrder: Number(f.sortOrder) || 0,
        productId: f.productId || undefined,
      };
      return video ? put(`/admin/videos/${video.id}`, body) : post('/admin/videos', body);
    },
    onSuccess: () => done(video ? 'Video saved' : 'Video added'),
    onError: setError,
  });
  const remove = useMutation({ mutationFn: () => del(`/admin/videos/${video!.id}`), onSuccess: () => done('Video deleted'), onError: (e) => toast('error', errText(e)) });

  return (
    <Modal open onClose={onClose} title={video ? 'Edit video' : 'Add video'} wide>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          save.mutate();
        }}
      >
        {error != null && (
          <div className="sm:col-span-2">
            <ErrorBox error={error instanceof ApiError ? new Error(error.messages.map((m) => m.replace(/^[\w.]+:\s*/, '')).join(' · ')) : error} />
          </div>
        )}
        <Field label="Title" className="sm:col-span-2">
          {(id) => <Input id={id} required minLength={2} maxLength={200} value={f.title} onChange={(e) => set('title', e.target.value)} />}
        </Field>
        <div className="flex gap-2 sm:col-span-2">
          {(['youtube', 'file'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set('source', s)}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold', f.source === s ? 'border-brand bg-brand/5 text-brand' : 'border-ink/10 text-ink-soft')}
            >
              {s === 'youtube' ? <Youtube className="size-4" /> : <Film className="size-4" />}
              {s === 'youtube' ? 'YouTube link' : 'Upload a file'}
            </button>
          ))}
        </div>
        {f.source === 'youtube' ? (
          <Field label="YouTube link" hint="Paste any YouTube or Shorts link" className="sm:col-span-2">
            {(id) => <Input id={id} required value={f.youtube} placeholder="https://youtube.com/shorts/…" onChange={(e) => set('youtube', e.target.value)} />}
          </Field>
        ) : (
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-sm font-semibold">Video file</p>
            <SingleUpload kind="video" value={f.fileUrl} onChange={(u) => set('fileUrl', u)} />
          </div>
        )}
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-semibold">Poster image {f.source === 'youtube' && <span className="font-normal text-ink-soft">(optional — YouTube’s thumbnail is used otherwise)</span>}</p>
          <SingleUpload kind="image" value={f.posterUrl} onChange={(u) => set('posterUrl', u)} />
        </div>
        <Field label="Show on product page">
          {(id) => (
            <Select id={id} value={f.productId} onChange={(e) => set('productId', e.target.value)}>
              <option value="">— None (general video) —</option>
              {(products.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Display order" hint="Lower numbers come first">
          {(id) => <Input id={id} type="number" min={0} value={f.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />}
        </Field>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
          <Toggle checked={f.isShort} onChange={(v) => set('isShort', v)} label="Vertical short" hint="9:16 reel / Short" />
          <Toggle checked={f.featured} onChange={(v) => set('featured', v)} label="Main video" hint="The big video on Home & Videos" />
          <Toggle checked={f.active} onChange={(v) => set('active', v)} label="Show on website" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 sm:col-span-2">
          {video ? (
            <Button type="button" variant="ghost" className="text-red-600" loading={remove.isPending} onClick={() => confirm('Delete this video?') && remove.mutate()}>
              <Trash2 className="size-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={save.isPending} disabled={f.source === 'file' && !f.fileUrl}>
              {video ? 'Save' : 'Add video'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
