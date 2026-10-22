import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Zap,
  Sparkles,
  User,
  CheckCircle2,
  Edit3,
  Building2,
  MapPin,
  Clock,
} from 'lucide-react';
import useMyStore from '@hooks/useMyStore';
import useAuthStore from '@store/auth.store';
import StoreService from '@api/services/store.service';
import UserService from '@api/services/user.service';
import { queryKeys } from '@lib/queryClient';
import Spinner from '@components/ui/Spinner';
import Avatar from '@components/ui/Avatar';
import CarListingForm from '@features/sell/components/CarListingForm';
import PropertyListingForm from '@features/sell/components/PropertyListingForm';
import DailyProductForm from '@features/sell/components/DailyProductForm';
import PersonalSellerOnboarding, {
  isPersonalProfileComplete,
} from '@features/sell/components/PersonalSellerOnboarding';
import BusinessSellerOnboarding from '@features/sell/components/BusinessSellerOnboarding';
import { MAIN_CATEGORIES, CATEGORY_IDS } from '@utils/constants';
import {
  parseStoreMeta,
  getTodayHoursStatus,
} from '@utils/sellerMeta';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

const getBusinessCategory = (storeObj, metaObj) => {
  const bt = (metaObj?.businessType || '').toLowerCase();
  if (
    bt === 'automotive' ||
    bt === 'car_dealership' ||
    bt === 'auto_parts'
  ) {
    return MAIN_CATEGORIES.VEHICLES;
  }
  if (
    bt === 'real_estate' ||
    bt === 'real_estate_agency' ||
    bt === 'property_management'
  ) {
    return MAIN_CATEGORIES.REAL_ESTATE;
  }
  if (
    bt === 'marketplace' ||
    bt === 'retail_store' ||
    bt === 'electronics_shop' ||
    bt === 'furniture_home' ||
    bt === 'online_store' ||
    bt === 'home_business' ||
    bt === 'other_business'
  ) {
    return MAIN_CATEGORIES.ESSENTIALS;
  }

  const catId = storeObj?.category_id || storeObj?.categories?.id;
  if (catId === CATEGORY_IDS.AUTOMOTIVE || catId === CATEGORY_IDS.VEHICLES) {
    return MAIN_CATEGORIES.VEHICLES;
  }
  if (catId === CATEGORY_IDS.PROPERTY || catId === CATEGORY_IDS.REAL_ESTATE) {
    return MAIN_CATEGORIES.REAL_ESTATE;
  }
  if (catId === CATEGORY_IDS.OTHER) {
    return MAIN_CATEGORIES.ESSENTIALS;
  }

  const catSlug = (storeObj?.categories?.slug || '').toLowerCase();
  if (catSlug.includes('vehicle') || catSlug.includes('automotive')) {
    return MAIN_CATEGORIES.VEHICLES;
  }
  if (catSlug.includes('real-estate') || catSlug.includes('property')) {
    return MAIN_CATEGORIES.REAL_ESTATE;
  }
  if (catSlug.includes('marketplace') || catSlug.includes('essentials')) {
    return MAIN_CATEGORIES.ESSENTIALS;
  }

  return null;
};

export default function CreateListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const rawCategory = searchParams.get('category');
  const selectedCategory = rawCategory
    ? rawCategory === 'real_estate' || rawCategory === 'real-estate'
      ? MAIN_CATEGORIES.REAL_ESTATE
      : rawCategory === 'automotive' || rawCategory === 'vehicles'
        ? MAIN_CATEGORIES.VEHICLES
        : MAIN_CATEGORIES.ESSENTIALS
    : null;

  const onboardingParam = searchParams.get('onboarding'); // 'personal' | 'business' | 'business-edit' | null
  const forceChooseScreen = searchParams.get('choose') === '1';

  const {
    store,
    hasStore,
    isLoading: storeLoading,
    refetch: refetchStore,
  } = useMyStore();

  const storeMeta = parseStoreMeta(store);
  const savedSellerMode = user?.id
    ? localStorage.getItem(`aliwayz_seller_mode_${user.id}`)
    : null;
  const hasBusinessProfile = Boolean(
    hasStore && (storeMeta.isBusinessProfile || savedSellerMode === 'business')
  );
  const personalComplete =
    isPersonalProfileComplete(user) &&
    (hasStore ||
      (user?.id &&
        localStorage.getItem(`aliwayz_personal_seller_ready_${user.id}`) === 'true'));
  const hasPersonalProfile = Boolean(
    hasStore &&
      !hasBusinessProfile &&
      (storeMeta.isPersonalProfile || personalComplete || savedSellerMode === 'personal')
  );

  // Automatically resolve mode when the seller already has a Business or Personal seller profile
  // so clicking "New Listing" from Seller Dashboard goes straight to listing creation without re-prompting.
  const defaultSellerMode = hasBusinessProfile
    ? 'business'
    : hasPersonalProfile
      ? 'personal'
      : hasStore
        ? 'quick'
        : selectedCategory
          ? 'quick'
          : null;

  const mode = forceChooseScreen
    ? null
    : searchParams.get('mode') || defaultSellerMode;

  // Active seller identity when creating a listing ('quick' | 'personal' | 'business')
  const [sellerIdentityOverride, setSellerIdentityOverride] = useState(null);
  const activeSellerIdentity =
    sellerIdentityOverride ||
    (mode === 'business'
      ? 'business'
      : mode === 'personal'
        ? 'personal'
        : hasBusinessProfile
          ? 'business'
          : hasPersonalProfile
            ? 'personal'
            : 'quick');

  const isBusinessSeller = Boolean(
    activeSellerIdentity === 'business' ||
    mode === 'business' ||
    (hasBusinessProfile && activeSellerIdentity !== 'personal')
  );

  const businessCategory = isBusinessSeller
    ? getBusinessCategory(store, storeMeta)
    : null;

  // If business seller has an assigned business category and an incompatible category was passed in URL, align it
  useEffect(() => {
    if (isBusinessSeller && businessCategory && rawCategory) {
      if (selectedCategory && selectedCategory !== businessCategory) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('category', businessCategory);
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [isBusinessSeller, businessCategory, rawCategory, selectedCategory, searchParams, setSearchParams]);

  // Auto-create shop for Quick Listing (preserves existing Quick Listing behavior 100%)
  const autoCreateMutation = useMutation({
    mutationFn: async () => {
      // Ensure buyer role is upgraded to 'both' so backend allows store creation
      if (!user?.role || user.role === 'buyer') {
        try {
          const roleRes = await UserService.updateRole({ role: 'both' });
          const updatedU = roleRes?.data?.user || roleRes?.data || roleRes?.user;
          if (updatedU && typeof updatedU === 'object') {
            setUser({ ...updatedU, role: updatedU.role || 'both' });
          } else {
            setUser({ role: 'both' });
          }
        } catch {
          setUser({ role: 'both' });
        }
      }

      const rawName = `${user?.full_name || user?.username || 'My'} Listings`;
      return StoreService.create({
        store_name: rawName.length >= 3 ? rawName : 'My Listings',
        category_id: CATEGORY_IDS.OTHER,
        description: 'Personal listings',
        location_city: user?.location_city || '',
      });
    },
    onSuccess: () => {
      setUser({ role: user?.role === 'admin' ? 'admin' : 'both' });
      queryClient.invalidateQueries({
        queryKey: ['my-store'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
      refetchStore();
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('mode', 'quick');
      nextParams.delete('onboarding');
      setSearchParams(nextParams);
      toast.success('All set! Now add your listing.');
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes('already')) {
        refetchStore();
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('mode', 'quick');
        nextParams.delete('onboarding');
        setSearchParams(nextParams);
      } else {
        toast.error(msg);
      }
    },
  });

  // Loading state
  if (storeLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Handlers for the 3 Sell Entry options
  const handleSelectQuickListing = () => {
    setSellerIdentityOverride('quick');
    if (user?.id && !hasBusinessProfile) {
      localStorage.setItem(`aliwayz_seller_mode_${user.id}`, 'quick');
    }
    if (!hasStore) {
      autoCreateMutation.mutate();
    } else {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('mode', 'quick');
      nextParams.delete('onboarding');
      nextParams.delete('choose');
      setSearchParams(nextParams);
    }
  };

  const handleSelectPersonalSeller = (forceEdit = false) => {
    setSellerIdentityOverride('personal');
    if (user?.id) {
      localStorage.setItem(`aliwayz_seller_mode_${user.id}`, 'personal');
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('mode', 'personal');
    nextParams.delete('choose');
    if (forceEdit || !personalComplete || !hasStore) {
      nextParams.set('onboarding', 'personal');
    } else {
      nextParams.delete('onboarding');
    }
    setSearchParams(nextParams);
  };

  const handleSelectBusinessSeller = (forceEdit = false) => {
    setSellerIdentityOverride('business');
    if (user?.id && hasBusinessProfile) {
      localStorage.setItem(`aliwayz_seller_mode_${user.id}`, 'business');
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('mode', 'business');
    nextParams.delete('choose');
    if (forceEdit) {
      nextParams.set('onboarding', 'business-edit');
    } else if (!hasBusinessProfile) {
      nextParams.set('onboarding', 'business');
    } else {
      nextParams.delete('onboarding');
    }
    setSearchParams(nextParams);
  };

  // 1. Show 3-Option Sell Entry Screen when no mode is selected (or when user has no store in quick mode)
  if (!mode || (mode === 'quick' && !hasStore)) {
    return (
      <>
        <Helmet>
          <title>Sell on Aliwayz — Choose How to Sell</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="mx-auto max-w-3xl">
          <SellEntryScreen
            user={user}
            store={store}
            hasStore={hasStore}
            hasBusinessProfile={hasBusinessProfile}
            personalComplete={personalComplete}
            storeMeta={storeMeta}
            isQuickCreating={autoCreateMutation.isPending}
            onSelectQuick={handleSelectQuickListing}
            onSelectPersonal={handleSelectPersonalSeller}
            onSelectBusiness={handleSelectBusinessSeller}
            onBack={() => navigate(-1)}
          />
        </div>
      </>
    );
  }

  // 2. Personal Seller Onboarding Step (when missing required info or editing personal profile)
  if (
    mode === 'personal' &&
    (onboardingParam === 'personal' || !personalComplete || !hasStore)
  ) {
    return (
      <>
        <Helmet>
          <title>Personal Seller Setup — Aliwayz</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <PersonalSellerOnboarding
          user={user}
          existingStore={store}
          onBack={() => {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('onboarding');
            if (!personalComplete || !hasStore) {
              nextParams.delete('mode');
            }
            setSearchParams(nextParams);
          }}
          onComplete={(res) => {
            if (res?.store) {
              queryClient.setQueryData(['my-store', user?.id], res.store);
            }
            refetchStore();
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('mode', 'personal');
            nextParams.delete('onboarding');
            nextParams.delete('choose');
            setSearchParams(nextParams);
          }}
        />
      </>
    );
  }

  // 3. Business Seller Onboarding Step (when creating, reviewing, or editing business profile)
  if (
    mode === 'business' &&
    (onboardingParam === 'business' ||
      onboardingParam === 'business-edit' ||
      !hasBusinessProfile)
  ) {
    return (
      <>
        <Helmet>
          <title>Business Seller Setup — Aliwayz</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <BusinessSellerOnboarding
          user={user}
          existingStore={store}
          initialEditMode={onboardingParam === 'business-edit'}
          onBack={() => {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('onboarding');
            nextParams.delete('step');
            if (!hasBusinessProfile) {
              nextParams.delete('mode');
            }
            setSearchParams(nextParams);
          }}
          onComplete={(savedStore) => {
            if (savedStore) {
              queryClient.setQueryData(['my-store', user?.id], savedStore);
            }
            if (user?.id) {
              localStorage.setItem(`aliwayz_seller_mode_${user.id}`, 'business');
            }
            refetchStore();
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('mode', 'business');
            nextParams.delete('onboarding');
            nextParams.delete('choose');
            nextParams.delete('step');
            setSearchParams(nextParams);
          }}
        />
      </>
    );
  }

  const handleBack = () => {
    if (selectedCategory === MAIN_CATEGORIES.REAL_ESTATE) {
      const stepStr = searchParams.get('step');
      const step = stepStr ? parseInt(stepStr, 10) : 0;
      if (step > 0) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('category', selectedCategory);
        nextParams.set('intent', searchParams.get('intent') || '');
        nextParams.set('type', searchParams.get('type') || '');
        nextParams.set('step', String(step - 1));
        setSearchParams(nextParams);
        return;
      }
    }
    if (selectedCategory) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      nextParams.delete('step');
      nextParams.delete('intent');
      nextParams.delete('type');
      setSearchParams(nextParams);
    } else if (!hasStore && searchParams.get('mode')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('mode');
      nextParams.delete('onboarding');
      setSearchParams(nextParams);
    } else {
      navigate(-1);
    }
  };

  const wantedRequestId =
    searchParams.get('wanted_request_id') ||
    location.state?.wantedRequestId ||
    null;
  const wantedTitle =
    location.state?.wantedTitle || searchParams.get('wanted_title') || '';
  const wantedContext = wantedRequestId
    ? {
        wantedRequestId,
        wantedTitle,
        buyerId: location.state?.buyerId,
        budgetMin: location.state?.budget_min,
        budgetMax: location.state?.budget_max,
        locationCity: location.state?.location_city,
      }
    : null;

  const isGuidedSellerMode = mode === 'personal' || mode === 'business';

  return (
    <>
      <Helmet>
        <title>Create Listing — Aliwayz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto max-w-2xl">
        {/* Matching Wanted Request Context Banner */}
        {wantedContext && (
          <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/40 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">
                  Matching Buyer Request:{' '}
                  {wantedContext.wantedTitle || 'Wanted Item'}
                </p>
                <p className="text-[11px] text-indigo-700/90 dark:text-indigo-400/90">
                  Once this listing is published, the buyer will be automatically notified with your match proposal!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seller Identity Selector & Profile Bar (Shown for Personal & Business Seller flows, or when user has a Business Profile) */}
        {(isGuidedSellerMode || hasBusinessProfile) && (
          <SellerIdentityBar
            mode={mode}
            activeIdentity={activeSellerIdentity}
            onChangeIdentity={(nextId) => {
              if (nextId === 'business' && !hasBusinessProfile) {
                handleSelectBusinessSeller(false);
                return;
              }
              setSellerIdentityOverride(nextId);
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('mode', nextId);
              setSearchParams(nextParams);
            }}
            user={user}
            store={store}
            storeMeta={storeMeta}
            hasBusinessProfile={hasBusinessProfile}
            onEditProfile={() => {
              if (activeSellerIdentity === 'business') {
                handleSelectBusinessSeller(true);
              } else {
                handleSelectPersonalSeller(true);
              }
            }}
            onChangeMode={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete('mode');
              nextParams.delete('onboarding');
              nextParams.set('choose', '1');
              setSearchParams(nextParams);
            }}
          />
        )}

        {/* Category Selector */}
        {!selectedCategory && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ArrowLeft size={16} />
                {hasStore ? 'Back' : 'Selling Options'}
              </button>
            </div>
            <CategorySelector
              allowedCategory={businessCategory}
              isBusiness={isBusinessSeller}
              businessStoreName={store?.store_name}
              onSelect={(cat) => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('category', cat);
                if (mode) nextParams.set('mode', mode);
                if (wantedRequestId)
                  nextParams.set('wanted_request_id', wantedRequestId);
                setSearchParams(nextParams);
              }}
            />
          </div>
        )}

        {/* Category-Specific Form */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>

              {(selectedCategory === MAIN_CATEGORIES.VEHICLES ||
                selectedCategory === 'vehicles' ||
                selectedCategory === 'automotive') && (
                <CarListingForm
                  store={store}
                  wantedContext={wantedContext}
                  sellerIdentity={activeSellerIdentity}
                  onChangeIdentity={setSellerIdentityOverride}
                  requireReview={isGuidedSellerMode}
                  user={user}
                />
              )}

              {(selectedCategory === MAIN_CATEGORIES.REAL_ESTATE ||
                selectedCategory === 'real-estate' ||
                selectedCategory === 'real_estate') && (
                <RealEstateWizard
                  store={store}
                  wantedContext={wantedContext}
                  sellerIdentity={activeSellerIdentity}
                  onChangeIdentity={setSellerIdentityOverride}
                  requireReview={isGuidedSellerMode}
                  user={user}
                />
              )}

              {(selectedCategory === MAIN_CATEGORIES.ESSENTIALS ||
                selectedCategory === 'essentials' ||
                selectedCategory === 'marketplace') && (
                <DailyProductForm
                  store={store}
                  wantedContext={wantedContext}
                  sellerIdentity={activeSellerIdentity}
                  onChangeIdentity={setSellerIdentityOverride}
                  requireReview={isGuidedSellerMode}
                  user={user}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// THREE-OPTION SELL ENTRY SCREEN
// ──────────────────────────────────────────────────────────────
function SellEntryScreen({
  user,
  store,
  hasBusinessProfile,
  personalComplete,
  storeMeta,
  isQuickCreating,
  onSelectQuick,
  onSelectPersonal,
  onSelectBusiness,
  onBack,
}) {
  const todayHours =
    hasBusinessProfile && storeMeta.hasStorefront
      ? getTodayHoursStatus(storeMeta.businessHours)
      : null;

  return (
    <motion.div
      className="space-y-6 py-2 sm:py-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Title & Subtitle */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(91, 110, 245, 0.12)',
            color: 'var(--color-brand)',
          }}
        >
          <Sparkles size={13} />
          Sell on Aliwayz
        </span>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          How would you like to sell?
        </h1>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Post a single item in seconds, sell under your personal name, or launch a branded business storefront.
        </p>
      </div>

      {/* Three Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* OPTION A: QUICK LISTING */}
        <div
          className="flex flex-col justify-between rounded-3xl p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background:
              'linear-gradient(145deg, rgba(91,110,245,0.10), rgba(139,92,246,0.04))',
            borderColor: 'rgba(91,110,245,0.35)',
            boxShadow: '0 4px 20px rgba(91,110,245,0.08)',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                  boxShadow: '0 4px 12px var(--color-brand-glow)',
                }}
              >
                <Zap size={20} className="text-white" />
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: 'rgba(91, 110, 245, 0.14)',
                  color: 'var(--color-brand)',
                }}
              >
                Fastest
              </span>
            </div>

            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Quick Listing
              </h2>
              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Post an item, vehicle, or property right away with zero setup.
              </p>
            </div>

            <ul
              className="space-y-2 text-xs pt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>List in under 60 seconds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>No profile setup needed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Goods, Autos &amp; Real Estate</span>
              </li>
            </ul>
          </div>

          <div className="pt-5 mt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onSelectQuick}
              disabled={isQuickCreating}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
              }}
            >
              {isQuickCreating ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span>Post Quick Listing</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* OPTION B: PERSONAL SELLER */}
        <div
          className="flex flex-col justify-between rounded-3xl p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brand)',
                }}
              >
                <User size={20} />
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Individual
              </span>
            </div>

            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Personal Seller
              </h2>
              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Sell under your personal name and build trust with local buyers in your city.
              </p>
            </div>

            {/* Existing Personal Profile Preview */}
            <div
              className="p-3 rounded-2xl border flex items-center gap-2.5"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Avatar
                src={user?.avatar_url}
                name={user?.full_name || user?.username}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-bold truncate"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {user?.full_name || user?.username || 'Your Account'}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {personalComplete
                    ? `${user?.location_city} · Active`
                    : 'Quick 1-step setup'}
                </p>
              </div>
              {personalComplete && (
                <button
                  type="button"
                  onClick={() => onSelectPersonal(true)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:underline"
                  style={{ color: 'var(--color-brand)' }}
                  title="Edit personal profile"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="pt-5 mt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => onSelectPersonal(false)}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-brand)',
                color: 'var(--color-brand)',
              }}
            >
              <span>
                {personalComplete
                  ? 'Continue as Personal'
                  : 'Set Up Personal Profile'}
              </span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* OPTION C: BUSINESS SELLER */}
        <div
          className="flex flex-col justify-between rounded-3xl p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brand)',
                }}
              >
                <Store size={20} />
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Dealers &amp; Shops
              </span>
            </div>

            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Business Seller
              </h2>
              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Create a branded storefront for your dealership, brokerage, retail shop, or online brand.
              </p>
            </div>

            {hasBusinessProfile ? (
              <div
                className="p-3 rounded-2xl border space-y-1.5"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={store?.logo_url}
                    name={store?.store_name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-bold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {store?.store_name}
                    </p>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {storeMeta.businessTypeLabel || 'Business Storefront'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {store?.slug && (
                      <Link
                        to={`/store/${store.slug}`}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        View
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectBusiness(true)}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:underline"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                {todayHours && (
                  <p
                    className="text-[11px] flex items-center gap-1 pt-1 border-t"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{todayHours.fullLabel}</span>
                  </p>
                )}
              </div>
            ) : (
              <ul
                className="space-y-2 text-xs pt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Custom logo, cover &amp; store URL</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Storefront address or service area</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Business hours &amp; contact info</span>
                </li>
              </ul>
            )}
          </div>

          <div className="pt-5 mt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => onSelectBusiness(false)}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-brand)',
                color: 'var(--color-brand)',
              }}
            >
              <span>
                {hasBusinessProfile
                  ? 'Continue as Business'
                  : 'Set Up Storefront'}
              </span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────
// SELLER IDENTITY BAR
// ──────────────────────────────────────────────────────────────
function SellerIdentityBar({
  activeIdentity,
  user,
  store,
  storeMeta,
  hasBusinessProfile,
  onEditProfile,
  onChangeMode,
}) {
  const isBusiness = activeIdentity === 'business' && hasBusinessProfile;
  const displayName = isBusiness
    ? store?.store_name || 'Business Storefront'
    : user?.full_name || user?.username || store?.store_name || 'Personal Seller';
  const displayAvatar = isBusiness
    ? store?.logo_url || user?.avatar_url
    : user?.avatar_url || store?.logo_url;
  const locationText = isBusiness
    ? store?.location_city || user?.location_city
    : user?.location_city || store?.location_city;

  return (
    <div
      className="mb-5 rounded-2xl px-4 py-3 border flex flex-wrap items-center justify-between gap-3"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={displayAvatar} name={displayName} size="sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-sm font-bold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {displayName}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgba(91, 110, 245, 0.12)',
                color: 'var(--color-brand)',
              }}
            >
              {isBusiness
                ? storeMeta.businessTypeLabel || 'Business Storefront'
                : 'Personal Seller'}
            </span>
          </div>
          {locationText && (
            <p
              className="text-[11px] flex items-center gap-1 mt-0.5 truncate"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <MapPin size={11} />
              {locationText}
            </p>
          )}
        </div>
      </div>

      {/* Profile Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          title={isBusiness ? 'Edit business storefront' : 'Edit personal seller profile'}
        >
          <Edit3 className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
          <span>{isBusiness ? 'Edit Storefront' : 'Edit Profile'}</span>
        </button>

        <button
          type="button"
          onClick={onChangeMode}
          className="text-xs font-medium px-2 py-1 hover:underline"
          style={{ color: 'var(--color-text-muted)' }}
          title="Switch selling mode"
        >
          Switch Mode
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// CATEGORY SELECTOR
// ──────────────────────────────────────────────────────────────
function CategorySelector({
  onSelect,
  allowedCategory = null,
  isBusiness = false,
  businessStoreName = '',
}) {
  const SELL_CATEGORIES = [
    {
      id: MAIN_CATEGORIES.ESSENTIALS,
      label: 'Marketplace & Goods',
      emoji: '🛍️',
      desc: 'Electronics, furniture, apparel, home & everyday items',
      gradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
    },
    {
      id: MAIN_CATEGORIES.VEHICLES,
      label: 'Vehicles & Automotive',
      emoji: '🚗',
      desc: 'Cars, trucks, SUVs, motorcycles, boats & auto parts',
      gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    },
    {
      id: MAIN_CATEGORIES.REAL_ESTATE,
      label: 'Real Estate & Rentals',
      emoji: '🏠',
      desc: 'Homes for sale, apartments for rent, commercial & land',
      gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
    },
  ];

  const visibleCategories = allowedCategory
    ? SELL_CATEGORIES.filter((c) => c.id === allowedCategory)
    : SELL_CATEGORIES;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="space-y-1.5 text-center">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          {allowedCategory ? 'Your Business Category' : 'What are you listing today?'}
        </h2>
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          {allowedCategory
            ? (businessStoreName
                ? `Create listings under ${businessStoreName}'s registered business category.`
                : 'Create listings under your registered business category.')
            : 'Select a category to open the right listing form'}
        </p>
      </div>

      <div className="space-y-3">
        {visibleCategories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(cat.id)}
            className="group flex w-full items-center gap-4 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="flex h-13 w-13 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl sm:text-3xl transition-transform group-hover:scale-105"
              style={{
                background: cat.gradient,
              }}
            >
              <span className="drop-shadow">{cat.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-bold"
                style={{
                  color: 'var(--color-text-primary)',
                }}
              >
                {cat.label}
              </h3>
              <p
                className="mt-0.5 text-xs sm:text-sm"
                style={{
                  color: 'var(--color-text-secondary)',
                }}
              >
                {cat.desc}
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:translate-x-0.5 flex-shrink-0"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <ArrowRight size={16} />
            </div>
          </motion.button>
        ))}

        {/* Bulk Upload Option (only show for marketplace or when not category-restricted) */}
        {(!allowedCategory || allowedCategory === MAIN_CATEGORIES.ESSENTIALS) && (
          <Link
            to="/sell/bulk"
            className="group flex items-center justify-between rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 mt-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                }}
              >
                📊
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Listing multiple products?
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Import inventory in bulk using a CSV or Excel spreadsheet
                </p>
              </div>
            </div>
            <span
              className="flex items-center gap-1 text-xs font-semibold shrink-0"
              style={{ color: 'var(--color-brand)' }}
            >
              Bulk Upload{' '}
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function RealEstateWizard({
  store,
  wantedContext,
  sellerIdentity,
  onChangeIdentity,
  requireReview,
  user,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const stepStr = searchParams.get('step');
  const step = stepStr ? parseInt(stepStr, 10) : 0;
  const intent = searchParams.get('intent') || '';
  const propertyType = searchParams.get('type') || '';

  const INTENTS = [
    {
      id: 'sale',
      label: 'Sell a Property',
      desc: 'I’m looking for a buyer.',
      emoji: '🏡',
      gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    },
    {
      id: 'rent',
      label: 'Rent a Property',
      desc: 'I’m looking for a tenant.',
      emoji: '🔑',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    },
    {
      id: 'lease',
      label: 'Lease Commercial Space',
      desc: 'I’m looking for a business/tenant.',
      emoji: '🏢',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    },
    {
      id: 'vacation',
      label: 'Vacation Rental',
      desc: 'Short-term stays.',
      emoji: '🌴',
      gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    },
  ];

  const PROPERTY_TYPES_BY_INTENT = {
    sale: [
      { value: 'single_family', label: 'Single-Family Home' },
      { value: 'townhome', label: 'Townhouse' },
      { value: 'condo', label: 'Condo / Co-op' },
      { value: 'multi_family', label: 'Multi-Family' },
      { value: 'apartment', label: 'Apartment Building' },
      { value: 'mobile_home', label: 'Mobile / Manufactured Home' },
      { value: 'land', label: 'Land / Lot' },
      { value: 'commercial', label: 'Commercial Property' },
      { value: 'office', label: 'Office' },
      { value: 'retail', label: 'Retail' },
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'industrial', label: 'Industrial / Warehouse' },
      { value: 'mixed_use', label: 'Mixed Use' },
      { value: 'parking', label: 'Parking' },
    ],
    rent: [
      { value: 'apartment', label: 'Apartment' },
      { value: 'single_family', label: 'House' },
      { value: 'townhome', label: 'Townhouse' },
      { value: 'condo', label: 'Condo' },
      { value: 'room', label: 'Room' },
      { value: 'basement', label: 'Basement' },
      { value: 'duplex', label: 'Duplex' },
      { value: 'multi_family', label: 'Multi-Family' },
      { value: 'mobile_home', label: 'Mobile / Manufactured' },
      { value: 'student_housing', label: 'Student Housing' },
      { value: 'senior_housing', label: 'Senior Housing' },
    ],
    lease: [
      { value: 'office', label: 'Office' },
      { value: 'retail', label: 'Retail' },
      { value: 'restaurant', label: 'Restaurant / Food Service' },
      { value: 'medical', label: 'Medical' },
      { value: 'industrial', label: 'Warehouse' },
      { value: 'industrial_flex', label: 'Industrial / Flex Space' },
      { value: 'land', label: 'Commercial Land' },
      { value: 'parking', label: 'Parking' },
      { value: 'storage', label: 'Storage' },
      { value: 'mixed_use', label: 'Mixed Use' },
    ],
    vacation: [
      { value: 'single_family', label: 'House' },
      { value: 'condo', label: 'Condo' },
      { value: 'apartment', label: 'Apartment' },
      { value: 'cabin', label: 'Cabin' },
      { value: 'guest_house', label: 'Guest House' },
      { value: 'room', label: 'Room' },
    ],
  };

  const handleSelectIntent = (id) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('category', 'real-estate');
    nextParams.set('intent', id);
    nextParams.set('step', '1');
    setSearchParams(nextParams);
  };

  const handleSelectType = (val) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('category', 'real-estate');
    nextParams.set('intent', intent);
    nextParams.set('type', val);
    nextParams.set('step', '2');
    setSearchParams(nextParams);
  };

  if (step === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Real Estate Listing Type
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Choose whether you are selling, renting, leasing, or listing a vacation stay
          </p>
        </div>
        <div className="space-y-3">
          {INTENTS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectIntent(item.id)}
              className="group flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110"
                style={{ background: item.gradient }}
              >
                <span className="drop-shadow">{item.emoji}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  {item.label}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {item.desc}
                </p>
              </div>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1 text-[var(--color-text-muted)]"
              />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  if (step === 1) {
    const types = PROPERTY_TYPES_BY_INTENT[intent] || [];
    const intentLabel = INTENTS.find((i) => i.id === intent)?.label || '';
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {intent === 'rent'
              ? 'What property are you renting out?'
              : intent === 'lease'
                ? 'What commercial space are you leasing?'
                : intent === 'vacation'
                  ? 'What vacation property are you listing?'
                  : 'What property are you selling?'}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Category: Real Estate • {intentLabel}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => handleSelectType(type.value)}
              className="flex w-full items-center justify-between rounded-xl p-4 text-left transition-all hover:bg-[var(--glass-bg-strong)]"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {type.label}
              </span>
              <ArrowRight size={16} className="text-[var(--color-text-muted)]" />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <PropertyListingForm
      store={store}
      intent={intent}
      propertyType={propertyType}
      wantedContext={wantedContext}
      sellerIdentity={sellerIdentity}
      onChangeIdentity={onChangeIdentity}
      requireReview={requireReview}
      user={user}
    />
  );
}
