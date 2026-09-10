import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';
import SellerGuard from './guards/SellerGuard';
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
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
  CarsPage,
  PropertyPage,
  DailyUsePage,
  VerificationPage,
  FAQPage,
  
  LegalIndexPage,
  PrivacyPolicyPage,
  TermsPage,
  CookiePolicyPage,
  SellerPolicyPage,
  BuyerPolicyPage,
  CommunityGuidelinesPage,
  ProhibitedItemsPage,
  AccountDeletionPage,
  DataDeletionPage,
  ReportAbusePage,
  IntellectualPropertyPage,
  CopyrightPage,
  DisclaimerPage,
  SafetyGuidelinesPage,
  ContactUsPage,
  AboutPage,
  WantedHomePage,
  WantedFeedPage,
  PostWantedPage,
  MyWantedRequestsPage,
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
        { path: '/my-store/verification', element: <VerificationPage /> },
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

        // Legal Center
        { path: '/legal',                       element: <LegalIndexPage /> },
        { path: '/legal/privacy-policy',        element: <PrivacyPolicyPage /> },
        { path: '/privacy',                     element: <PrivacyPolicyPage /> },
        { path: '/privacy-policy',              element: <PrivacyPolicyPage /> },
        { path: '/legal/terms',                 element: <TermsPage /> },
        { path: '/terms',                       element: <TermsPage /> },
        { path: '/terms-of-service',            element: <TermsPage /> },
        { path: '/legal/cookie-policy',         element: <CookiePolicyPage /> },
        { path: '/legal/seller-policy',         element: <SellerPolicyPage /> },
        { path: '/legal/buyer-policy',          element: <BuyerPolicyPage /> },
        { path: '/legal/community-guidelines',  element: <CommunityGuidelinesPage /> },
        { path: '/legal/prohibited-items',      element: <ProhibitedItemsPage /> },
        { path: '/legal/account-deletion',      element: <AccountDeletionPage /> },
        { path: '/account-deletion',            element: <AccountDeletionPage /> },
        { path: '/delete-account',              element: <AccountDeletionPage /> },
        { path: '/legal/data-deletion',         element: <DataDeletionPage /> },
        { path: '/data-deletion',               element: <DataDeletionPage /> },
        { path: '/legal/report-abuse',          element: <ReportAbusePage /> },
        { path: '/legal/intellectual-property', element: <IntellectualPropertyPage /> },
        { path: '/legal/copyright',             element: <CopyrightPage /> },
        { path: '/legal/disclaimer',            element: <DisclaimerPage /> },
        { path: '/legal/safety-guidelines',     element: <SafetyGuidelinesPage /> },
        { path: '/legal/contact',               element: <ContactUsPage /> },
        { path: '/contact',                     element: <ContactUsPage /> },
        { path: '/contact-us',                  element: <ContactUsPage /> },
        { path: '/legal/about',                 element: <AboutPage /> },
        { path: '/about',                       element: <AboutPage /> },
        { path: '/about-us',                    element: <AboutPage /> },

        // Wanted Hub
        { path: '/wanted',              element: <WantedHomePage /> },
        { path: '/wanted/feed',         element: <WantedFeedPage /> },
        { path: '/wanted/create',       element: <PostWantedPage /> },
        {
          path: '/wanted/my-requests',
          element: (
            <AuthGuard>
              <MyWantedRequestsPage />
            </AuthGuard>
          ),
        },

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
