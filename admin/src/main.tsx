import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import './index.css';
import { setUnauthorizedHandler } from '@/lib/api';
import { RequireAuth } from '@/auth';
import Layout from '@/components/Layout';
import { Spinner, ToastProvider } from '@/components/ui';
import Login from '@/pages/Login';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const Products = lazy(() => import('@/pages/Products'));
const ProductEditor = lazy(() => import('@/pages/ProductEditor'));
const Videos = lazy(() => import('@/pages/Videos'));
const Enquiries = lazy(() => import('@/pages/Enquiries'));
const Coupons = lazy(() => import('@/pages/Coupons'));
const SettingsPage = lazy(() => import('@/pages/Settings'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 15_000 } },
});
// A 401 anywhere means the session ended: forget the admin, which sends them to /login
setUnauthorizedHandler(() => queryClient.setQueryData(['me'], null));

const page = (el: React.ReactNode) => <Suspense fallback={<Spinner />}>{el}</Suspense>;

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: page(<Dashboard />) },
          { path: 'orders', element: page(<Orders />) },
          { path: 'orders/:id', element: page(<OrderDetail />) },
          { path: 'products', element: page(<Products />) },
          { path: 'products/new', element: page(<ProductEditor />) },
          { path: 'products/:id', element: page(<ProductEditor />) },
          { path: 'videos', element: page(<Videos />) },
          { path: 'enquiries', element: page(<Enquiries />) },
          { path: 'coupons', element: page(<Coupons />) },
          { path: 'settings', element: page(<SettingsPage />) },
          { path: '*', element: <p className="py-20 text-center text-ink-soft">Page not found.</p> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
