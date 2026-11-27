import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, MessageSquare, Phone } from 'lucide-react';
import { get, patch } from '@/lib/api';
import { cn, formatDate, whatsappLink } from '@/lib/format';
import type { Enquiry } from '@/lib/types';
import { Badge, Card, Empty, ErrorBox, errText, PageHeader, Select, Spinner, useToast } from '@/components/ui';

const STATUS = {
  NEW: ['New', 'bg-blue-50 text-blue-700 ring-blue-200'],
  CALLED: ['Called', 'bg-amber-50 text-amber-800 ring-amber-200'],
  CLOSED: ['Closed', 'bg-zinc-100 text-zinc-600 ring-zinc-200'],
} as const;
type Status = keyof typeof STATUS;

export default function Enquiries() {
  const qc = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState<Status | ''>('NEW');
  const list = useQuery({ queryKey: ['enquiries', status], queryFn: () => get<Enquiry[]>(`/admin/enquiries${status ? `?status=${status}` : ''}`) });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) => patch<Enquiry>(`/admin/enquiries/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enquiries'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (e) => toast('error', errText(e)),
  });

  return (
    <>
      <PageHeader title="Enquiries" subtitle="Call-back requests and bulk enquiries from the contact form." />
      <div className="mb-4 flex gap-1">
        {(['NEW', 'CALLED', 'CLOSED', ''] as const).map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={cn('rounded-full px-3.5 py-2 text-sm font-semibold', status === s ? 'bg-night text-white' : 'bg-white text-ink-soft ring-1 ring-ink/10')}>
            {s ? STATUS[s][0] : 'All'}
          </button>
        ))}
      </div>
      {list.isPending ? (
        <Spinner />
      ) : list.isError ? (
        <ErrorBox error={list.error} />
      ) : list.data.length === 0 ? (
        <Card>
          <Empty icon={MessageSquare} title="Nothing here" text="New enquiries from the website appear here." />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.data.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-xs text-ink-soft">
                    {formatDate(e.createdAt)}
                    {e.productSlug ? ` · about ${e.productSlug.replace(/-/g, ' ')}` : ''}
                  </p>
                </div>
                <Badge className={STATUS[e.status][1]}>{STATUS[e.status][0]}</Badge>
              </div>
              <p className="mt-3 text-sm whitespace-pre-line">{e.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a href={`tel:${e.phone}`} className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-dark">
                  <Phone className="size-4" /> {e.phone}
                </a>
                <a href={whatsappLink(e.phone, `Hello ${e.name}, this is Thankyou Mattresses replying to your enquiry.`)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700">
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
                {e.email && (
                  <a href={`mailto:${e.email}`} className="text-sm text-ink-soft hover:underline">
                    {e.email}
                  </a>
                )}
                <Select value={e.status} onChange={(ev) => update.mutate({ id: e.id, status: ev.target.value as Status })} className="ml-auto h-9 w-32" aria-label="Status">
                  <option value="NEW">New</option>
                  <option value="CALLED">Called</option>
                  <option value="CLOSED">Closed</option>
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
