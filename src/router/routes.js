import { lazy } from 'react';

// ── Lazy loaded pages ──────────────────────────────────────────
// Auth
const LoginPage           = lazy(() => import('@features/auth/pages/LoginPage'));
const RegisterPage        = lazy(() => import('@features/auth/pages/RegisterPage'));
const VerifyEmailPage     = lazy(() => import('@features/auth/pages/VerifyEmailPage'));
const ForgotPasswordPage  = lazy(() => import('@features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('@features/auth/pages/ResetPasswordPage'));
const CompleteProfilePage = lazy(() => import('@features/auth/pages/CompleteProfilePage'));

// Home
const HomePage = lazy(() => import('@features/home/pages/HomePage'));
const CarsPage      = lazy(() => import('@features/home/pages/CarsPage'));
const PropertyPage  = lazy(() => import('@features/home/pages/PropertyPage'));
const DailyUsePage  = lazy(() => import('@features/home/pages/DailyUsePage'));
const FAQPage = lazy(() => import('@features/home/pages/FAQPage'));


// Marketplace
const MarketplacePage    = lazy(() => import('@features/marketplace/pages/MarketplacePage'));
const ProductDetailPage  = lazy(() => import('@features/marketplace/pages/ProductDetailPage'));
const CategoryPage       = lazy(() => import('@features/marketplace/pages/CategoryPage'));

// Search
const SearchPage = lazy(() => import('@features/search/pages/SearchPage'));

// Store
const StoreProfilePage    = lazy(() => import('@features/store/pages/StoreProfilePage'));
const CreateStorePage     = lazy(() => import('@features/store/pages/CreateStorePage'));
const EditStorePage       = lazy(() => import('@features/store/pages/EditStorePage'));
const StoreAnalyticsPage  = lazy(() => import('@features/store/pages/StoreAnalyticsPage'));

// Sell
const CreateListingPage = lazy(() => import('@features/sell/pages/CreateListingPage'));
const EditListingPage   = lazy(() => import('@features/sell/pages/EditListingPage'));
const MyListingsPage    = lazy(() => import('@features/sell/pages/MyListingsPage'));

// Chat
const InboxPage        = lazy(() => import('@features/chat/pages/InboxPage'));
const ConversationPage = lazy(() => import('@features/chat/pages/ConversationPage'));

// QR
const QRVerificationPage = lazy(() => import('@features/qr/pages/QRVerificationPage'));

// Profile
const MyProfilePage       = lazy(() => import('@features/profile/pages/MyProfilePage'));
const PublicProfilePage   = lazy(() => import('@features/profile/pages/PublicProfilePage'));
const EditProfilePage     = lazy(() => import('@features/profile/pages/EditProfilePage'));
const PurchaseHistoryPage = lazy(() => import('@features/profile/pages/PurchaseHistoryPage'));
const FavoritesPage       = lazy(() => import('@features/profile/pages/FavoritesPage'));
const FollowingPage       = lazy(() => import('@features/profile/pages/FollowingPage'));

// Notifications
const NotificationsPage = lazy(() => import('@features/notifications/pages/NotificationsPage'));

// Admin
const AdminDashboardPage = lazy(() => import('@features/admin/pages/AdminDashboardPage'));
const AdminUsersPage     = lazy(() => import('@features/admin/pages/AdminUsersPage'));
const AdminStoresPage    = lazy(() => import('@features/admin/pages/AdminStoresPage'));
const AdminProductsPage  = lazy(() => import('@features/admin/pages/AdminProductsPage'));
const AdminReportsPage   = lazy(() => import('@features/admin/pages/AdminReportsPage'));
const AdminLogsPage      = lazy(() => import('@features/admin/pages/AdminLogsPage'));
const AdminBroadcastPage = lazy(() => import('@features/admin/pages/AdminBroadcastPage'));
const AdminFeedbackPage = lazy(() => import('@features/admin/pages/AdminFeedbackPage'));
const AdminVerificationsPage = lazy(() => import('@features/admin/pages/AdminVerificationsPage'));
const AdminCategoriesPage = lazy(() => import('@features/admin/pages/AdminCategoriesPage'));

// Verification
const VerificationPage = lazy(() => import('@features/verification/pages/VerificationPage'));

// Legal
const LegalIndexPage           = lazy(() => import('@features/legal/pages/LegalIndexPage'));
const PrivacyPolicyPage        = lazy(() => import('@features/legal/pages/PrivacyPolicyPage'));
const TermsPage                = lazy(() => import('@features/legal/pages/TermsPage'));
const CookiePolicyPage         = lazy(() => import('@features/legal/pages/CookiePolicyPage'));
const SellerPolicyPage         = lazy(() => import('@features/legal/pages/SellerPolicyPage'));
const BuyerPolicyPage          = lazy(() => import('@features/legal/pages/BuyerPolicyPage'));
const CommunityGuidelinesPage  = lazy(() => import('@features/legal/pages/CommunityGuidelinesPage'));
const ProhibitedItemsPage      = lazy(() => import('@features/legal/pages/ProhibitedItemsPage'));
const AccountDeletionPage      = lazy(() => import('@features/legal/pages/AccountDeletionPage'));
const DataDeletionPage         = lazy(() => import('@features/legal/pages/DataDeletionPage'));
const ReportAbusePage          = lazy(() => import('@features/legal/pages/ReportAbusePage'));
const IntellectualPropertyPage = lazy(() => import('@features/legal/pages/IntellectualPropertyPage'));
const CopyrightPage            = lazy(() => import('@features/legal/pages/CopyrightPage'));
const DisclaimerPage           = lazy(() => import('@features/legal/pages/DisclaimerPage'));
const SafetyGuidelinesPage     = lazy(() => import('@features/legal/pages/SafetyGuidelinesPage'));
const ContactUsPage            = lazy(() => import('@features/legal/pages/ContactUsPage'));
const AboutPage                = lazy(() => import('@features/legal/pages/AboutPage'));

export {
  LoginPage, RegisterPage, VerifyEmailPage, ForgotPasswordPage,
  ResetPasswordPage, CompleteProfilePage,
  HomePage,
  MarketplacePage, ProductDetailPage, CategoryPage,
  SearchPage,
  StoreProfilePage, CreateStorePage, EditStorePage, StoreAnalyticsPage,
  CreateListingPage, EditListingPage, MyListingsPage,
  InboxPage, ConversationPage,
  QRVerificationPage,
  MyProfilePage, PublicProfilePage, EditProfilePage,
  PurchaseHistoryPage, FavoritesPage, FollowingPage,
  NotificationsPage,
  AdminDashboardPage, AdminUsersPage, AdminStoresPage,
  AdminProductsPage, AdminReportsPage, AdminLogsPage,
  AdminBroadcastPage, AdminFeedbackPage, AdminVerificationsPage,
  AdminCategoriesPage,
  VerificationPage,
  CarsPage, PropertyPage, DailyUsePage, FAQPage,
  
  LegalIndexPage, PrivacyPolicyPage, TermsPage, CookiePolicyPage,
  SellerPolicyPage, BuyerPolicyPage, CommunityGuidelinesPage,
  ProhibitedItemsPage, AccountDeletionPage, DataDeletionPage,
  ReportAbusePage, IntellectualPropertyPage, CopyrightPage,
  DisclaimerPage, SafetyGuidelinesPage, ContactUsPage, AboutPage,
};