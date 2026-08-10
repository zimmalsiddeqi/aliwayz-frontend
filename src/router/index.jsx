import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoadingScreen from '@components/common/LoadingScreen';
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';
import SellerGuard from './guards/SellerGuard';
import AdminGuard from './guards/AdminGuard';
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import RoleBasedHome from './guards/RoleBasedHome';

import {
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  CompleteProfilePage,
  HomePage,
  MarketplacePage,
  ProductDetailPage,
  CategoryPage,
  SearchPage,
  StoreProfilePage,
  CreateStorePage,
  EditStorePage,
  StoreAnalyticsPage,
  CreateListingPage,
  EditListingPage,
  MyListingsPage,
  InboxPage,
  ConversationPage,
  QRVerificationPage,
  MyProfilePage,
  PublicProfilePage,
  EditProfilePage,
  PurchaseHistoryPage,
  FavoritesPage,
  FollowingPage,
  NotificationsPage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminStoresPage,
  AdminProductsPage,
  AdminReportsPage,
  AdminLogsPage,
  CarsPage,
  PropertyPage,
  DailyUsePage,
  AdminBroadcastPage,
  AdminFeedbackPage,
  FAQPage,
} from './routes';

const router = createBrowserRouter(
  [
    // ── Auth (Guest only) ────────────────────────────────────
    {
      element: (
        <GuestGuard>
          <AuthLayout />
        </GuestGuard>
      ),
      children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/forgot-password', element: <ForgotPasswordPage /> },
        { path: '/reset-password', element: <ResetPasswordPage /> },
      ],
    },

    // ── Semi-protected ───────────────────────────────────────
    {
      element: <AuthLayout />,
      children: [
        { path: '/verify-email', element: <VerifyEmailPage /> },
        {
          path: '/complete-profile',
          element: (
            <AuthGuard>
              <CompleteProfilePage />
            </AuthGuard>
          ),
        },
      ],
    },

    // ── Seller Dashboard (MUST be BEFORE RootLayout) ─────────
    // This ensures /dashboard, /sell/*, /my-store/* paths
    // are matched before RootLayout's /store/:slug
    {
      element: (
        <SellerGuard>
          <DashboardLayout />
        </SellerGuard>
      ),
      children: [
        { path: '/dashboard', element: <MyListingsPage /> },
        { path: '/sell/create', element: <CreateListingPage /> },
        { path: '/sell/edit/:id', element: <EditListingPage /> },
        { path: '/sell/my-listings', element: <MyListingsPage /> },
        { path: '/my-store/edit', element: <EditStorePage /> },
        { path: '/my-store/analytics', element: <StoreAnalyticsPage /> },
      ],
    },

    // ── Admin (BEFORE RootLayout) ────────────────────────────
    {
      element: (
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      ),
      children: [
        { path: '/admin', element: <AdminDashboardPage /> },
        { path: '/admin/users', element: <AdminUsersPage /> },
        { path: '/admin/stores', element: <AdminStoresPage /> },
        { path: '/admin/products', element: <AdminProductsPage /> },
        { path: '/admin/reports', element: <AdminReportsPage /> },
        { path: '/admin/logs', element: <AdminLogsPage /> },
        { path: '/admin/broadcast', element: <AdminBroadcastPage /> },
        { path: '/admin/feedback', element: <AdminFeedbackPage /> },
      ],
    },

    // ── Main Layout (public + auth pages) ────────────────────
    {
      element: <RootLayout />,
      children: [
        // Role-based home
        { path: '/', element: <RoleBasedHome /> },
        { path: '/vehicles', element: <CarsPage /> },
        { path: '/real-estate', element: <PropertyPage /> },
        { path: '/essentials', element: <DailyUsePage /> },
        { path: '/faq', element: <FAQPage /> },

        // Public
        { path: '/marketplace', element: <MarketplacePage /> },
        { path: '/product/:id', element: <ProductDetailPage /> },
        { path: '/category/:slug', element: <CategoryPage /> },
        { path: '/search', element: <SearchPage /> },
        { path: '/store/:slug', element: <StoreProfilePage /> },
        { path: '/user/:username', element: <PublicProfilePage /> },

        // Auth required
        {
          path: '/inbox',
          element: (
            <AuthGuard>
              <InboxPage />
            </AuthGuard>
          ),
        },
        {
          path: '/inbox/:id',
          element: (
            <AuthGuard>
              <ConversationPage />
            </AuthGuard>
          ),
        },
        {
          path: '/notifications',
          element: (
            <AuthGuard>
              <NotificationsPage />
            </AuthGuard>
          ),
        },
        {
          path: '/profile',
          element: (
            <AuthGuard>
              <MyProfilePage />
            </AuthGuard>
          ),
        },
        {
          path: '/profile/edit',
          element: (
            <AuthGuard>
              <EditProfilePage />
            </AuthGuard>
          ),
        },
        {
          path: '/favorites',
          element: (
            <AuthGuard>
              <FavoritesPage />
            </AuthGuard>
          ),
        },
        {
          path: '/purchases',
          element: (
            <AuthGuard>
              <PurchaseHistoryPage />
            </AuthGuard>
          ),
        },
        {
          path: '/following',
          element: (
            <AuthGuard>
              <FollowingPage />
            </AuthGuard>
          ),
        },
        {
          path: '/qr/:productId',
          element: (
            <AuthGuard>
              <QRVerificationPage />
            </AuthGuard>
          ),
        },

        // Store creation inside RootLayout
        {
          path: '/store/create',
          element: (
            <SellerGuard>
              <CreateStorePage />
            </SellerGuard>
          ),
        },
      ],
    },

    // ── 404 ──────────────────────────────────────────────────
    {
      path: '*',
      element: (
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <div className="space-y-4 text-center">
            <h1 className="text-gradient text-6xl font-bold">404</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Page not found</p>
            <a href="/" className="btn-brand inline-block rounded-xl px-6 py-2.5">
              Go Home
            </a>
          </div>
        </div>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
