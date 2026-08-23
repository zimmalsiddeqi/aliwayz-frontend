import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Store, Zap } from 'lucide-react';
import useMyStore from '@hooks/useMyStore';
import useAuthStore from '@store/auth.store';
import StoreService from '@api/services/store.service';
import Spinner from '@components/ui/Spinner';
import Button from '@components/ui/Button';
import CarListingForm from '@features/sell/components/CarListingForm';
import PropertyListingForm from '@features/sell/components/PropertyListingForm';
import DailyProductForm from '@features/sell/components/DailyProductForm';
import { MAIN_CATEGORIES, MAIN_CATEGORY_CONFIG } from '@utils/constants';
import { cn, getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function CreateListingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);

  const { store, hasStore, isLoading: storeLoading, refetch: refetchStore } = useMyStore();

  // Auto-create shop for quick listings
  const autoCreateMutation = useMutation({
    mutationFn: () =>
      StoreService.create({
        store_name: `${user?.full_name || user?.username || 'My'} Listings`,
        description: 'Personal listings',
        location_city: '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-store'],
      });
      refetchStore();
      toast.success('All set! Now add your listing.');
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      if (msg.includes('already')) {
        refetchStore();
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

  // No shop — show options
  if (!hasStore) {
    return (
      <>
        <Helmet>
          <title>Sell — Aliwayz</title>
        </Helmet>

        <div className="mx-auto max-w-lg">
          <NoShopPrompt
            category={selectedCategory}
            isCreating={autoCreateMutation.isPending}
            onQuickStart={() => autoCreateMutation.mutate()}
            onCreateShop={() => navigate('/store/create')}
            onBack={() => navigate(-1)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sell — Aliwayz</title>
      </Helmet>

      <div className="mx-auto max-w-2xl">
        {/* Category Selector */}
        {!selectedCategory && <CategorySelector onSelect={setSelectedCategory} />}

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
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <ArrowLeft size={16} />
                  Change category
                </button>
              </div>

              {selectedCategory === MAIN_CATEGORIES.VEHICLES && <CarListingForm store={store} />}

              {selectedCategory === MAIN_CATEGORIES.REAL_ESTATE && (
                <RealEstateWizard
                  store={store}
                  onBackToCategory={() => setSelectedCategory(null)}
                />
              )}

              {selectedCategory === MAIN_CATEGORIES.ESSENTIALS && (
                <DailyProductForm store={store} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// NO SHOP PROMPT — Smart labels per category
// ──────────────────────────────────────────────────────────────
function NoShopPrompt({ category, isCreating, onQuickStart, onCreateShop, onBack }) {
  const getCategoryInfo = () => {
    switch (category) {
      case 'vehicles':
        return {
          emoji: '🚗',
          title: 'Ready to sell automotive?',
          quickLabel: 'List Now',
          quickDesc: 'Post your automotive listing right away — no shop needed',
          shopLabel: 'Set Up a Dealership Profile',
          shopDesc: 'Create a dealer profile for multiple automotive listings',
        };
      case 'real-estate':
        return {
          emoji: '🏠',
          title: 'Ready to list your property?',
          quickLabel: 'List My Property Now',
          quickDesc: 'Post your real estate listing right away',
          shopLabel: 'Set Up an Agent Profile',
          shopDesc: 'Create a real estate agent profile for multiple listings',
        };
      default:
        return {
          emoji: '🛒',
          title: 'Ready to start selling?',
          quickLabel: 'Quick Listing',
          quickDesc: 'Sell a single item without setting up a shop',
          shopLabel: 'Open a Shop',
          shopDesc: 'Create your own storefront for multiple products',
        };
    }
  };

  const info = getCategoryInfo();

  return (
    <motion.div
      className="space-y-6 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="space-y-3 text-center">
        <span className="block text-5xl">{info.emoji}</span>
        <h2
          className="text-2xl font-bold"
          style={{
            color: 'var(--color-text-primary)',
          }}
        >
          {info.title}
        </h2>
        <p
          className="mx-auto max-w-sm text-sm"
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          Choose how you'd like to get started
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Quick Listing — no shop needed */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onQuickStart}
          disabled={isCreating}
          className="flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(91,110,245,0.1), rgba(139,92,246,0.05))',
            border: '1px solid rgba(91,110,245,0.3)',
            boxShadow: '0 4px 20px rgba(91,110,245,0.1)',
          }}
        >
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
              boxShadow: '0 4px 15px var(--color-brand-glow)',
            }}
          >
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p
                className="text-base font-bold"
                style={{
                  color: 'var(--color-text-primary)',
                }}
              >
                {info.quickLabel}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                style={{
                  backgroundColor: 'var(--color-brand-glow)',
                  color: 'var(--color-brand)',
                }}
              >
                Recommended
              </span>
            </div>
            <p
              className="mt-0.5 text-xs"
              style={{
                color: 'var(--color-text-muted)',
              }}
            >
              {info.quickDesc}
            </p>
          </div>
          {isCreating ? (
            <Spinner size="sm" />
          ) : (
            <ArrowRight
              size={18}
              style={{
                color: 'var(--color-brand)',
              }}
            />
          )}
        </motion.button>

        {/* Create Shop */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onCreateShop}
          className="flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Store
              size={24}
              style={{
                color: 'var(--color-text-secondary)',
              }}
            />
          </div>
          <div className="flex-1">
            <p
              className="text-base font-bold"
              style={{
                color: 'var(--color-text-primary)',
              }}
            >
              {info.shopLabel}
            </p>
            <p
              className="mt-0.5 text-xs"
              style={{
                color: 'var(--color-text-muted)',
              }}
            >
              {info.shopDesc}
            </p>
          </div>
          <ArrowRight
            size={18}
            style={{
              color: 'var(--color-text-muted)',
            }}
          />
        </motion.button>
      </div>

      {/* Note */}
      <p
        className="px-4 text-center text-[11px]"
        style={{
          color: 'var(--color-text-muted)',
        }}
      >
        Quick listing automatically creates a basic profile for you. You can customize it later from
        your settings.
      </p>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────
// CATEGORY SELECTOR
// ──────────────────────────────────────────────────────────────
function CategorySelector({ onSelect }) {
  const SELL_CATEGORIES = [
    {
      id: MAIN_CATEGORIES.ESSENTIALS,
      label: 'Sell an Item',
      emoji: '🛒',
      desc: 'Electronics, fashion, home goods & more',
      gradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
      examples: 'iPhone, sneakers, furniture...',
    },
    {
      id: MAIN_CATEGORIES.VEHICLES,
      label: 'Sell Automotive',
      emoji: '🚗',
      desc: 'Cars, trucks, motorcycles & powersports',
      gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
      examples: 'Toyota Camry, Ford F-150...',
    },
    {
      id: MAIN_CATEGORIES.REAL_ESTATE,
      label: 'Sell Real Estate',
      emoji: '🏠',
      desc: 'Homes, apartments, land & commercial',
      gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
      examples: '3-bed house, studio apt...',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h2
          className="text-2xl font-bold"
          style={{
            color: 'var(--color-text-primary)',
          }}
        >
          What are you selling?
        </h2>
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          Pick a category to get started with the right listing form
        </p>
      </div>

      <div className="space-y-3">
        {SELL_CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(cat.id)}
            className="group flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110"
              style={{
                background: cat.gradient,
              }}
            >
              <span className="drop-shadow">{cat.emoji}</span>
            </div>
            <div className="flex-1">
              <h3
                className="text-base font-bold"
                style={{
                  color: 'var(--color-text-primary)',
                }}
              >
                {cat.label}
              </h3>
              <p
                className="mt-0.5 text-xs"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                {cat.desc}
              </p>
              <p
                className="mt-1 text-[11px] italic"
                style={{
                  color: 'var(--color-text-muted)',
                  opacity: 0.7,
                }}
              >
                e.g. {cat.examples}
              </p>
            </div>
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
              style={{
                color: 'var(--color-text-muted)',
              }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function RealEstateWizard({ store, onBackToCategory }) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState('');
  const [propertyType, setPropertyType] = useState('');

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
    setIntent(id);
    setStep(1);
  };

  const handleSelectType = (val) => {
    setPropertyType(val);
    setStep(2);
  };

  if (step === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="mb-4">
          <button
            onClick={onBackToCategory}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline text-[var(--color-text-muted)]"
          >
            <ArrowLeft size={16} />
            Back to categories
          </button>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">What do you want to do?</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Select the transaction type for your property</p>
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
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">{item.label}</h3>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{item.desc}</p>
              </div>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 text-[var(--color-text-muted)]" />
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="mb-4">
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline text-[var(--color-text-muted)]"
          >
            <ArrowLeft size={16} />
            Back to transaction type
          </button>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {intent === 'rent' ? 'What are you renting?' : intent === 'lease' ? 'What type of commercial space?' : 'What are you selling?'}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Selected: {intentLabel}</p>
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
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">{type.label}</span>
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
      onBack={() => setStep(1)}
    />
  );
}
