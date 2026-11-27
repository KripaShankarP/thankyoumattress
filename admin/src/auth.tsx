import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router';
import { ApiError, get } from '@/lib/api';
import type { Admin } from '@/lib/types';
import { Spinner } from '@/components/ui';

/** The signed-in admin, or null */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return (await get<{ user: Admin }>('/auth/me')).user;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 5 * 60_000,
  });
}

/** Wraps every admin page: sends signed-out visitors to /login */
export function RequireAuth() {
  const me = useMe();
  const location = useLocation();
  if (me.isPending) return <Spinner label="Checking sign-in…" />;
  if (!me.data) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
