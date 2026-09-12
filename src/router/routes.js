import { lazy } from 'react';

// Retry helper for smooth automatic updates on new deployments
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasBeenRefreshed = sessionStorage.getItem('page_force_refreshed') === 'true';
    try {
      const component = await componentImport();
      sessionStorage.setItem('page_force_refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenRefreshed) {
        sessionStorage.setItem('page_force_refreshed', 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });
}


// ── Lazy loaded pages ──────────────────────────────────────────
// Auth
const LoginPage           = lazyWithRetry(() => import('@features/auth/pages/LoginPage'));
const RegisterPage        = lazyWithRetry(() => import('@features/auth/pages/RegisterPage'));
const VerifyEmailPage     = lazyWithRetry(() => import('@features/auth/pages/VerifyEmailPage'));
const ForgotPasswordPage  = lazyWithRetry(() => import('@features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazyWithRetry(() => import('@features/auth/pages/ResetPasswordPage'));
const CompleteProfilePage = lazyWithRetry(() => import('@features/auth/pages/CompleteProfilePage'));

// Home
const HomePage     = lazyWithRetry(() => import('@features/home/pages/HomePage'));
const CarsPage     = lazyWithRetry(() => import('@features/home/pages/CarsPage'));
const PropertyPage = lazyWithRetry(() => import('@features/home/pages/PropertyPage'));
const DailyUsePage = lazyWithRetry(() => import('@features/home/pages/DailyUsePage'));
const FAQPage      = lazyWithRetry(() => import('@features/home/pages/FAQPage'));

// Marketplace
const MarketplacePage   = lazyWithRetry(() => import('@features/marketplace/pages/MarketplacePage'));
const ProductDetailPage = lazyWithRetry(() => import('@features/marketplace/pages/ProductDetailPage'));
const CategoryPage      = lazyWithRetry(() => import('@features/marketplace/pages/CategoryPage'));

// Search
const SearchPage = lazyWithRetry(() => import('@features/search/pages/SearchPage'));

// Store
const StoreProfilePage   = lazyWithRetry(() => import('@features/store/pages/StoreProfilePage'));
const CreateStorePage    = lazyWithRetry(() => import('@features/store/pages/CreateStorePage'));
const EditStorePage      = lazyWithRetry(() => import('@features/store/pages/EditStorePage'));
const StoreAnalyticsPage = lazyWithRetry(() => import('@features/store/pages/StoreAnalyticsPage'));

// Sell
const CreateListingPage = lazyWithRetry(() => import('@features/sell/pages/CreateListingPage'));
const EditListingPage   = lazyWithRetry(() => import('@features/sell/pages/EditListingPage'));
const MyListingsPage    = lazyWithRetry(() => import('@features/sell/pages/MyListingsPage'));

// Chat
const InboxPage        = lazyWithRetry(() => import('@features/chat/pages/InboxPage'));
const ConversationPage = lazyWithRetry(() => import('@features/chat/pages/ConversationPage'));

// QR
const QRVerificationPage = lazyWithRetry(() => import('@features/qr/pages/QRVerificationPage'));

// Profile
const MyProfilePage       = lazyWithRetry(() => import('@features/profile/pages/MyProfilePage'));
const PublicProfilePage   = lazyWithRetry(() => import('@features/profile/pages/PublicProfilePage'));
const EditProfilePage     = lazyWithRetry(() => import('@features/profile/pages/EditProfilePage'));
const PurchaseHistoryPage = lazyWithRetry(() => import('@features/profile/pages/PurchaseHistoryPage'));
const FavoritesPage       = lazyWithRetry(() => import('@features/profile/pages/FavoritesPage'));
const FollowingPage       = lazyWithRetry(() => import('@features/profile/pages/FollowingPage'));

// Notifications
const NotificationsPage = lazyWithRetry(() => import('@features/notifications/pages/NotificationsPage'));

// Verification
const VerificationPage = lazyWithRetry(() => import('@features/verification/pages/VerificationPage'));

// Legal
const LegalIndexPage           = lazyWithRetry(() => import('@features/legal/pages/LegalIndexPage'));
const PrivacyPolicyPage        = lazyWithRetry(() => import('@features/legal/pages/PrivacyPolicyPage'));
const TermsPage                = lazyWithRetry(() => import('@features/legal/pages/TermsPage'));
const CookiePolicyPage         = lazyWithRetry(() => import('@features/legal/pages/CookiePolicyPage'));
const SellerPolicyPage         = lazyWithRetry(() => import('@features/legal/pages/SellerPolicyPage'));
const BuyerPolicyPage          = lazyWithRetry(() => import('@features/legal/pages/BuyerPolicyPage'));
const CommunityGuidelinesPage  = lazyWithRetry(() => import('@features/legal/pages/CommunityGuidelinesPage'));
const ProhibitedItemsPage      = lazyWithRetry(() => import('@features/legal/pages/ProhibitedItemsPage'));
const AccountDeletionPage      = lazyWithRetry(() => import('@features/legal/pages/AccountDeletionPage'));
const DataDeletionPage         = lazyWithRetry(() => import('@features/legal/pages/DataDeletionPage'));
const ReportAbusePage          = lazyWithRetry(() => import('@features/legal/pages/ReportAbusePage'));
const IntellectualPropertyPage = lazyWithRetry(() => import('@features/legal/pages/IntellectualPropertyPage'));
const CopyrightPage            = lazyWithRetry(() => import('@features/legal/pages/CopyrightPage'));
const DisclaimerPage           = lazyWithRetry(() => import('@features/legal/pages/DisclaimerPage'));
const SafetyGuidelinesPage     = lazyWithRetry(() => import('@features/legal/pages/SafetyGuidelinesPage'));
const ContactUsPage            = lazyWithRetry(() => import('@features/legal/pages/ContactUsPage'));
const AboutPage                = lazyWithRetry(() => import('@features/legal/pages/AboutPage'));

// Wanted
const WantedFeedPage        = lazyWithRetry(() => import('@features/wanted/pages/WantedFeedPage'));
const PostWantedPage        = lazyWithRetry(() => import('@features/wanted/pages/PostWantedPage'));
const MyWantedRequestsPage  = lazyWithRetry(() => import('@features/wanted/pages/MyWantedRequestsPage'));

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
  VerificationPage,
  CarsPage, PropertyPage, DailyUsePage, FAQPage,
  
  LegalIndexPage, PrivacyPolicyPage, TermsPage, CookiePolicyPage,
  SellerPolicyPage, BuyerPolicyPage, CommunityGuidelinesPage,
  ProhibitedItemsPage, AccountDeletionPage, DataDeletionPage,
  ReportAbusePage, IntellectualPropertyPage, CopyrightPage,
  DisclaimerPage, SafetyGuidelinesPage, ContactUsPage, AboutPage,
  WantedFeedPage, PostWantedPage, MyWantedRequestsPage,
};