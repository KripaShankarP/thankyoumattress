import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Lock } from 'lucide-react';
import { post } from '@/lib/api';
import type { Admin } from '@/lib/types';
import { useMe } from '@/auth';
import { Button, ErrorBox, Field, Input } from '@/components/ui';

export default function Login() {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  if (me.data) return <Navigate to={from} replace />;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const { user } = await post<{ user: Admin }>('/auth/sign-in', { email: f.get('email'), password: f.get('password') });
      qc.setQueryData(['me'], user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-night p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 -top-20 size-96 rounded-full bg-brand/40 blur-3xl" />
        <div className="absolute -bottom-24 right-0 size-96 rounded-full bg-gold/25 blur-3xl" />
        <img src="/wordmark-light.png" alt="Thankyou Mattresses" className="relative h-14 w-auto self-start" />
        <div className="relative">
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Orders, products & videos —<br />
            <span className="text-gold">all in one place.</span>
          </p>
          <p className="mt-4 max-w-md text-white/60">Manage the Thankyou Mattresses store: confirm orders, verify payments, upload products and keep prices up to date.</p>
        </div>
        <p className="relative text-sm text-white/40">Prestige Coir (India) Pvt. Ltd.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <img src="/wordmark.png" alt="Thankyou Mattresses" className="h-12 w-auto lg:hidden" />
          <div>
            <h1 className="text-2xl font-bold">Sign in to admin</h1>
            <p className="mt-1 text-sm text-ink-soft">Use the email and password given to you by the store owner.</p>
          </div>
          {error != null && <ErrorBox error={error} />}
          <Field label="Email">{(id) => <Input id={id} name="email" type="email" autoComplete="username" required autoFocus />}</Field>
          <Field label="Password">{(id) => <Input id={id} name="password" type="password" autoComplete="current-password" required />}</Field>
          <Button type="submit" loading={loading} className="w-full">
            <Lock className="size-4" /> Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
