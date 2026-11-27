import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import { upload } from '@/lib/api';
import { cn, media } from '@/lib/format';
import { errText, useToast } from './ui';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif';
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';

/** Ordered product photos: the first one is the cover */
export function ImageList({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState<{ done: number; total: number; pct: number } | null>(null);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files];
    const urls: string[] = [];
    for (const [i, f] of list.entries()) {
      setBusy({ done: i, total: list.length, pct: 0 });
      try {
        urls.push((await upload(f, (pct) => setBusy({ done: i, total: list.length, pct }))).url);
      } catch (e) {
        toast('error', `${f.name}: ${errText(e)}`);
      }
    }
    setBusy(null);
    if (urls.length) onChange([...value, ...urls]);
    if (input.current) input.current.value = '';
  }

  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((url, i) => (
          <figure key={url + i} className={cn('group relative aspect-square overflow-hidden rounded-xl bg-sand ring-2', i === 0 ? 'ring-gold' : 'ring-transparent')}>
            <img src={media(url)} alt="" className="size-full object-cover" />
            {i === 0 && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-night">
                <Star className="size-3 fill-night" /> Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-night/80 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <span className="flex gap-1">
                <IconBtn label="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowLeft className="size-4" />
                </IconBtn>
                <IconBtn label="Move right" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                  <ArrowRight className="size-4" />
                </IconBtn>
              </span>
              <span className="flex gap-1">
                {i > 0 && (
                  <IconBtn label="Make cover" onClick={() => onChange([url, ...value.filter((_, k) => k !== i)])}>
                    <Star className="size-4" />
                  </IconBtn>
                )}
                <IconBtn label="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))}>
                  <Trash2 className="size-4" />
                </IconBtn>
              </span>
            </div>
          </figure>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={!!busy}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 text-sm font-semibold text-ink-soft transition hover:border-brand hover:text-brand"
        >
          {busy ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              <span>
                {busy.done + 1}/{busy.total} · {busy.pct}%
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="size-6" />
              Add photos
            </>
          )}
        </button>
      </div>
      <input ref={input} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={(e) => add(e.target.files)} />
      <p className="mt-2 text-xs text-ink-soft">JPG, PNG, WebP or AVIF up to 10 MB. Square photos look best. The first photo is the cover.</p>
    </div>
  );
}

function IconBtn({ label, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className="grid size-8 place-items-center rounded-lg bg-white/90 text-night hover:bg-white disabled:opacity-40" {...p}>
      {children}
    </button>
  );
}

/** One uploaded file (a video, or a poster image) */
export function SingleUpload({ kind, value, onChange }: { kind: 'video' | 'image'; value?: string; onChange: (url?: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [pct, setPct] = useState<number | null>(null);

  async function pick(f?: File) {
    if (!f) return;
    setPct(0);
    try {
      onChange((await upload(f, setPct)).url);
    } catch (e) {
      toast('error', errText(e));
    } finally {
      setPct(null);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        kind === 'video' ? (
          <video src={value} className="h-20 w-32 rounded-lg bg-black object-cover" muted />
        ) : (
          <img src={media(value)} alt="" className="h-20 w-32 rounded-lg bg-sand object-cover" />
        )
      ) : (
        <span className="grid h-20 w-32 place-items-center rounded-lg bg-sand text-ink-soft">
          <UploadCloud className="size-6" />
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={() => input.current?.click()} disabled={pct !== null} className="text-left text-sm font-semibold text-brand hover:underline disabled:opacity-60">
          {pct !== null ? `Uploading… ${pct}%` : value ? `Replace ${kind}` : `Upload ${kind}`}
        </button>
        {value && pct === null && (
          <button type="button" onClick={() => onChange(undefined)} className="text-left text-sm text-ink-soft hover:text-red-600">
            Remove
          </button>
        )}
        <span className="text-xs text-ink-soft">{kind === 'video' ? 'MP4, WebM or MOV up to 500 MB' : 'JPG, PNG or WebP up to 10 MB'}</span>
      </div>
      <input ref={input} type="file" accept={kind === 'video' ? VIDEO_ACCEPT : IMAGE_ACCEPT} hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
