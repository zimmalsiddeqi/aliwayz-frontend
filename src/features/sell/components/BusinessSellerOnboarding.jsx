import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Camera,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Eye,
  EyeOff,
  Navigation,
  Shield,
  Sparkles,
  Instagram,
  Facebook,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import GoogleLocationPicker from '@components/common/GoogleLocationPicker';
import { useQueryClient } from '@tanstack/react-query';
import StoreService from '@api/services/store.service';
import UserService from '@api/services/user.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import { CATEGORY_IDS } from '@utils/constants';
import {
  BUSINESS_TYPES,
  DAYS_OF_WEEK,
  DEFAULT_BUSINESS_HOURS,
  TIME_OPTIONS,
  encodeStoreDescription,
  parseStoreMeta,
  formatHoursSummary,
  getTodayHoursStatus,
  getBusinessTypeLabel,
} from '@utils/sellerMeta';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Avatar from '@components/ui/Avatar';
import ImageCropperModal from '@components/modals/ImageCropperModal';
import BusinessLocationAndHoursStep from './BusinessLocationAndHoursStep';
import { cn, getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

const STEPS = [
  { id: 1, label: 'Business Profile' },
  { id: 2, label: 'Location & Hours' },
  { id: 3, label: 'Review & Publish' },
  { id: 4, label: 'Done' },
];

export default function BusinessSellerOnboarding({
  user,
  existingStore,
  initialEditMode = false,
  onBack,
  onComplete,
}) {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  const normalizeSocialUrl = (raw, domain) => {
    const val = (raw || '').trim();
    if (!val) return undefined;
    if (/^https?:\/\//i.test(val)) return val;
    const clean = val.replace(/^@+/, '').replace(new RegExp(`^(?:www\\.)?${domain.replace('.', '\\.')}\\/?`, 'i'), '').replace(/^\/+/, '');
    return clean ? `https://${domain}/${clean}` : undefined;
  };

  const parsedMeta = parseStoreMeta(existingStore);
  const hasExistingBusiness = Boolean(existingStore && parsedMeta.isBusinessProfile);

  const normalizeBusinessCategory = (rawType) => {
    if (!rawType) return BUSINESS_TYPES[0].value;
    if (BUSINESS_TYPES.some((b) => b.value === rawType)) return rawType;
    if (rawType === 'car_dealership' || rawType === 'auto_parts') return 'automotive';
    if (rawType === 'real_estate_agency' || rawType === 'property_management') return 'real_estate';
    return 'marketplace';
  };

  const [searchParams] = useSearchParams();
  const storageKey = user?.id
    ? `aliwayz_business_onboarding_${user.id}`
    : 'aliwayz_business_onboarding';

  // Session draft loader
  const getSavedSession = () => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (_e) {}
    return null;
  };
  const sessionData = getSavedSession();

  // 1. Initial step: URL query param -> sessionStorage -> existing business -> step 1
  const getInitialStep = () => {
    const paramStep = searchParams.get('step');
    if (paramStep) {
      const parsed = parseInt(paramStep, 10);
      if (parsed >= 1 && parsed <= 4) return parsed;
    }
    if (sessionData?.step && sessionData.step >= 1 && sessionData.step <= 4) {
      return sessionData.step;
    }
    if (hasExistingBusiness && !initialEditMode) {
      return 3;
    }
    return 1;
  };

  const [step, setStepState] = useState(getInitialStep);

  // Sync step with URL search param and sessionStorage
  const setStep = useCallback(
    (nextStepOrFn) => {
      setStepState((prev) => {
        const next =
          typeof nextStepOrFn === 'function' ? nextStepOrFn(prev) : nextStepOrFn;

        // Keep URL in sync so browser Back/Forward/Reload preserves step
        try {
          const currentParams = new URLSearchParams(window.location.search);
          currentParams.set('step', String(next));
          const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
          window.history.replaceState(null, '', newUrl);
        } catch (_e) {}

        // Keep sessionStorage in sync
        try {
          const raw = sessionStorage.getItem(storageKey);
          const curr = raw ? JSON.parse(raw) : {};
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              ...curr,
              step: next,
            })
          );
        } catch (_e) {}

        return next;
      });
    },
    [storageKey]
  );

  // Sync state if browser Back/Forward changes URL query param
  useEffect(() => {
    const urlStep = searchParams.get('step');
    if (urlStep) {
      const parsed = parseInt(urlStep, 10);
      if (parsed >= 1 && parsed <= 4 && parsed !== step) {
        setStepState(parsed);
      }
    }
  }, [searchParams, step]);

  const [formData, setFormData] = useState(() => {
    const draft = sessionData?.formData;
    return {
      businessType:
        draft?.businessType || normalizeBusinessCategory(parsedMeta.businessType),
      storeName:
        draft?.storeName || (hasExistingBusiness ? existingStore?.store_name || '' : ''),
      description: draft?.description || (parsedMeta.cleanDescription || ''),
      hasStorefront:
        draft?.hasStorefront !== undefined
          ? draft.hasStorefront
          : hasExistingBusiness
            ? parsedMeta.hasStorefront
            : true,
      streetAddress: draft?.streetAddress || (parsedMeta.streetAddress || ''),
      locationCity:
        draft?.locationCity ||
        (existingStore?.location_city || user?.location_city || ''),
      addressVisibility:
        draft?.addressVisibility || (parsedMeta.addressVisibility || 'exact'),
      businessPhone:
        draft?.businessPhone || (parsedMeta.businessPhone || user?.phone || ''),
      businessEmail:
        draft?.businessEmail || (parsedMeta.businessEmail || user?.email || ''),
      websiteUrl: draft?.websiteUrl || (parsedMeta.websiteUrl || ''),
      socialInstagram:
        draft?.socialInstagram || (existingStore?.social_instagram || ''),
      socialFacebook:
        draft?.socialFacebook || (existingStore?.social_facebook || ''),
      socialTiktok:
        draft?.socialTiktok || (existingStore?.social_tiktok || ''),
      businessHours:
        draft?.businessHours ||
        (parsedMeta.businessHours || { ...DEFAULT_BUSINESS_HOURS }),
    };
  });

  const [coords, setCoords] = useState(() => {
    if (sessionData?.coords?.lat && sessionData?.coords?.lng) {
      return sessionData.coords;
    }
    return {
      lat: existingStore?.location_lat || user?.location_lat || null,
      lng: existingStore?.location_lng || user?.location_lng || null,
    };
  });

  const [logoPreview, setLogoPreview] = useState(
    sessionData?.logoPreview || existingStore?.logo_url || null
  );
  const [bannerPreview, setBannerPreview] = useState(
    sessionData?.bannerPreview || existingStore?.banner_url || null
  );
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [cropperState, setCropperState] = useState({
    open: false,
    file: null,
    type: 'logo',
  });

  const [errors, setErrors] = useState({});
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStoreResult, setSavedStoreResult] = useState(
    () => sessionData?.savedStoreResult || existingStore || null
  );

  // Sync state into sessionStorage on every change
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      const curr = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          ...curr,
          step,
          formData,
          coords,
          logoPreview,
          bannerPreview,
          savedStoreResult,
        })
      );
    } catch (_e) {}
  }, [formData, coords, step, logoPreview, bannerPreview, savedStoreResult, storageKey]);

  const handleSaveDraft = () => {
    try {
      const draftKey = user?.id
        ? `aliwayz_business_draft_${user.id}`
        : 'aliwayz_business_draft';
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          formData,
          coords,
          step,
          updatedAt: new Date().toISOString(),
        })
      );
      toast.success('Draft saved successfully!');
    } catch (_e) {
      toast.success('Draft saved');
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBusinessTypeSelect = (typeObj) => {
    setFormData((prev) => ({
      ...prev,
      businessType: typeObj.value,
      hasStorefront:
        !hasExistingBusiness && prev.streetAddress === ''
          ? typeObj.defaultStorefront
          : prev.hasStorefront,
    }));
  };

  const handleDayHourChange = (dayKey, key, value) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [dayKey]: {
          ...prev.businessHours[dayKey],
          [key]: value,
        },
      },
    }));
  };

  const handleApplyMondayToWeekdays = () => {
    const mon = formData.businessHours.mon || DEFAULT_BUSINESS_HOURS.mon;
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        mon: { ...mon },
        tue: { ...mon },
        wed: { ...mon },
        thu: { ...mon },
        fri: { ...mon },
      },
    }));
    toast.success('Copied Monday hours to Monday – Friday');
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperState({ open: true, file, type });
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile, previewUrl) => {
    const { type } = cropperState;
    setCropperState({ open: false, file: null, type: 'logo' });
    const finalPreview = previewUrl || URL.createObjectURL(croppedFile);
    if (type === 'logo') {
      setLogoFile(croppedFile);
      setLogoPreview(finalPreview);
    } else {
      setBannerFile(croppedFile);
      setBannerPreview(finalPreview);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            '';
          const state = data?.address?.state || '';
          const road = data?.address?.road || '';
          const houseNumber = data?.address?.house_number || '';
          const formattedCity = [city, state].filter(Boolean).join(', ');
          const formattedStreet = [houseNumber, road].filter(Boolean).join(' ');

          if (formattedCity) {
            handleFieldChange('locationCity', formattedCity);
          }
          if (formData.hasStorefront && formattedStreet && !formData.streetAddress) {
            handleFieldChange('streetAddress', formattedStreet);
          }
          toast.success(
            formattedCity
              ? `Location detected: ${formattedCity}`
              : 'Coordinates captured!'
          );
        } catch {
          toast.error('Could not reverse-geocode location. Please type your city.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error('Location permission denied. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateStep1 = () => {
    const nextErrors = {};
    if (!formData.storeName.trim() || formData.storeName.trim().length < 3) {
      nextErrors.storeName = 'Business name must be at least 3 characters';
    }
    if (!formData.businessType) {
      nextErrors.businessType = 'Please select a business category';
    }
    if (!formData.businessPhone.trim() && !formData.businessEmail.trim()) {
      nextErrors.businessPhone =
        'Please provide a business phone number or email address';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep2 = () => {
    const nextErrors = {};
    if (!formData.locationCity.trim() || formData.locationCity.trim().length < 2) {
      nextErrors.locationCity = 'Please enter your city and state (e.g. Dallas, TX)';
    }
    if (formData.hasStorefront && !formData.streetAddress.trim()) {
      nextErrors.streetAddress =
        'Please enter your street address (you can hide it from the public using the privacy option)';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveBusinessProfile = async () => {
    if (!validateStep1() || !validateStep2()) {
      if (!validateStep1()) setStep(1);
      else setStep(2);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Upgrade user role from buyer -> both if needed
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

      // 2. Map business type to primary category_id
      const selectedTypeObj =
        BUSINESS_TYPES.find((b) => b.value === formData.businessType) ||
        BUSINESS_TYPES[0];

      // 3. Encode structured metadata into description
      const encodedDescription = encodeStoreDescription(formData.description, {
        sellerType: 'business',
        businessType: formData.businessType,
        hasStorefront: formData.hasStorefront,
        streetAddress: formData.hasStorefront ? formData.streetAddress.trim() : '',
        addressVisibility: formData.hasStorefront
          ? formData.addressVisibility
          : 'approximate',
        businessEmail: formData.businessEmail.trim(),
        businessPhone: formData.businessPhone.trim(),
        websiteUrl: formData.websiteUrl.trim(),
        businessHours: formData.hasStorefront ? formData.businessHours : undefined,
      });

      const payload = {
        store_name: formData.storeName.trim(),
        category_id:
          selectedTypeObj.categoryId ||
          existingStore?.category_id ||
          existingStore?.categories?.id ||
          CATEGORY_IDS.OTHER,
        description: encodedDescription,
        location_city: formData.locationCity.trim(),
        ...(coords.lat && coords.lng
          ? { location_lat: coords.lat, location_lng: coords.lng }
          : {}),
        social_instagram: normalizeSocialUrl(formData.socialInstagram, 'instagram.com'),
        social_facebook: normalizeSocialUrl(formData.socialFacebook, 'facebook.com'),
        social_tiktok: normalizeSocialUrl(formData.socialTiktok, 'tiktok.com'),
      };

      let savedStore = existingStore;
      if (existingStore?.id) {
        const res = await StoreService.update(existingStore.id, payload);
        savedStore = res?.data?.store || res?.data || res?.store || {
          ...existingStore,
          ...payload,
        };
      } else {
        try {
          const res = await StoreService.create(payload);
          savedStore = res?.data?.store || res?.data || res?.store;
        } catch (createErr) {
          // If the user already has a store in DB (e.g., created previously), fetch and update it
          const myStoreRes = await StoreService.getMyStore().catch(() => null);
          const foundStore = myStoreRes?.data?.store || myStoreRes?.data;
          if (foundStore?.id) {
            const updateRes = await StoreService.update(foundStore.id, payload);
            savedStore = updateRes?.data?.store || updateRes?.data || {
              ...foundStore,
              ...payload,
            };
          } else {
            throw createErr;
          }
        }
      }

      // 4. Upload logo & banner if selected
      if (savedStore?.id && logoFile) {
        try {
          const fd = new FormData();
          fd.append('file', logoFile, logoFile.name);
          const logoRes = await StoreService.uploadLogo(savedStore.id, fd);
          const logoData = logoRes?.data?.store || logoRes?.data || logoRes?.store;
          if (logoData) {
            savedStore = { ...savedStore, ...logoData };
          }
        } catch {
          toast.error('Business profile saved, but logo upload failed.');
        }
      }
      if (savedStore?.id && bannerFile) {
        try {
          const fd = new FormData();
          fd.append('file', bannerFile, bannerFile.name);
          const bannerRes = await StoreService.uploadBanner(savedStore.id, fd);
          const bannerData = bannerRes?.data?.store || bannerRes?.data || bannerRes?.store;
          if (bannerData) {
            savedStore = { ...savedStore, ...bannerData };
          }
        } catch {
          toast.error('Business profile saved, but banner upload failed.');
        }
      }

      // Ensure auth store and queries reflect seller role and store immediately
      if (user?.id) {
        localStorage.setItem(`aliwayz_seller_mode_${user.id}`, 'business');
      }
      if (savedStore) {
        queryClient.setQueryData(['my-store', user?.id], savedStore);
      }
      setUser({ role: user?.role === 'admin' ? 'admin' : 'both' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-store'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() }),
      ]);
      toast.success(
        hasExistingBusiness
          ? 'Business profile updated!'
          : 'Business profile created!'
      );
      setSavedStoreResult(savedStore);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const hoursSummary = formatHoursSummary(formData.businessHours);
  const todayStatus = getTodayHoursStatus(formData.businessHours);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-3 px-3 sm:px-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => {
            if (step > 1 && !(hasExistingBusiness && !initialEditMode && step === 3)) {
              setStep((s) => s - 1);
            } else {
              onBack?.();
            }
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 && !(hasExistingBusiness && !initialEditMode && step === 3)
            ? 'Previous Step'
            : 'Back'}
        </button>

        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40"
        >
          <Store className="w-3.5 h-3.5" />
          Business Storefront
        </span>
      </div>

      {/* Sleek Stepper (Step 1 -> Step 2 -> Step 3 -> Step 4) */}
      <div
        className="rounded-2xl px-5 py-3.5 mb-6 border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-initial">
                <button
                  type="button"
                  onClick={() => {
                    if (s.id < step || (hasExistingBusiness && s.id <= 3)) {
                      setStep(s.id);
                    }
                  }}
                  className="flex items-center gap-2.5 text-left group"
                >
                  <div
                    className={cn(
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0',
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isCurrent
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-100 dark:ring-blue-950/50'
                          : 'bg-transparent text-slate-400 border border-slate-300 dark:border-slate-700'
                    )}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.id}
                  </div>
                  <span
                    className={cn(
                      'text-xs sm:text-sm font-semibold transition-colors hidden sm:inline',
                      isCurrent
                        ? 'text-blue-600 font-bold'
                        : isCompleted
                          ? 'text-[var(--color-text-primary)]'
                          : 'text-slate-400'
                    )}
                  >
                    {s.label}
                  </span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-3 sm:mx-4 rounded-full transition-colors',
                      step > s.id ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: BUSINESS PROFILE */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="rounded-3xl overflow-hidden border shadow-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {/* Unified Storefront Banner + Logo Header */}
            <div
              className="relative h-32 sm:h-36 overflow-hidden flex items-center justify-center border-b"
              style={{
                borderColor: 'var(--color-border)',
                background: bannerPreview
                  ? undefined
                  : 'linear-gradient(135deg, rgba(91, 110, 245, 0.20) 0%, rgba(139, 92, 246, 0.16) 50%, rgba(59, 130, 246, 0.12) 100%)',
              }}
            >
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Storefront Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="text-center text-xs pointer-events-none"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-70" />
                  <span className="font-medium">Storefront Cover Photo (Optional)</span>
                </div>
              )}

              <label
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Camera className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                {bannerPreview ? 'Change Cover' : 'Add Cover'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageSelect(e, 'banner')}
                  className="hidden"
                />
              </label>
            </div>

            <div className="px-6 sm:px-8 pb-7 space-y-6">
              {/* Overlapping Logo + Cleanly Positioned Title */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="relative w-fit -mt-11 flex-shrink-0">
                  <div
                    className="rounded-2xl p-1.5 shadow-lg border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <Avatar
                      src={logoPreview}
                      name={formData.storeName || 'Business'}
                      size="xl"
                    />
                  </div>
                  <label
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: '#ffffff',
                    }}
                    title="Upload Business Logo"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageSelect(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 pt-1 sm:pt-3.5">
                  <h2
                    className="text-xl sm:text-2xl font-bold tracking-tight"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Set Up Your Business Profile
                  </h2>
                  <p
                    className="text-xs sm:text-sm mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Build your branded storefront once — reuse it automatically on every listing.
                  </p>
                </div>
              </div>

              {/* Business Name */}
              <Input
                label="Business Name *"
                placeholder="e.g. Metro Auto Group, Skyline Realty, or Urban Goods"
                leftIcon={<Building2 size={16} />}
                value={formData.storeName}
                onChange={(e) => handleFieldChange('storeName', e.target.value)}
                error={errors.storeName}
              />

              {/* 3 Main Business Categories */}
              <div>
                <label
                  className="block text-sm font-medium mb-2.5"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Business Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUSINESS_TYPES.map((typeObj) => {
                    const selected = formData.businessType === typeObj.value;
                    return (
                      <button
                        key={typeObj.value}
                        type="button"
                        onClick={() => handleBusinessTypeSelect(typeObj)}
                        className="relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: selected
                            ? 'linear-gradient(135deg, var(--color-brand), #6366F1)'
                            : 'var(--color-bg)',
                          borderColor: selected
                            ? 'var(--color-brand)'
                            : 'var(--color-border)',
                          color: selected ? '#ffffff' : 'var(--color-text-primary)',
                          boxShadow: selected
                            ? '0 10px 24px -6px rgba(91, 110, 245, 0.45)'
                            : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{
                              backgroundColor: selected
                                ? 'rgba(255, 255, 255, 0.2)'
                                : 'var(--color-surface)',
                            }}
                          >
                            {typeObj.icon}
                          </div>
                          {selected ? (
                            <CheckCircle2
                              className="w-5 h-5 flex-shrink-0"
                              style={{ color: '#ffffff' }}
                            />
                          ) : (
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ borderColor: 'var(--color-border)' }}
                            />
                          )}
                        </div>

                        <div>
                          <p
                            className="text-sm font-bold leading-snug"
                            style={{
                              color: selected
                                ? '#ffffff'
                                : 'var(--color-text-primary)',
                            }}
                          >
                            {typeObj.label}
                          </p>
                          {typeObj.desc && (
                            <p
                              className="text-[11px] mt-1 leading-relaxed"
                              style={{
                                color: selected
                                  ? 'rgba(255, 255, 255, 0.85)'
                                  : 'var(--color-text-secondary)',
                              }}
                            >
                              {typeObj.desc}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.businessType && (
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--color-danger)' }}>
                    {errors.businessType}
                  </p>
                )}
              </div>

              {/* How Customers Visit Your Business */}
              <div>
                <label
                  className="block text-sm font-medium mb-2.5"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  How do customers shop with you? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('hasStorefront', true)}
                    className="p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3"
                    style={{
                      background: formData.hasStorefront
                        ? 'linear-gradient(135deg, var(--color-brand), #6366F1)'
                        : 'var(--color-bg)',
                      borderColor: formData.hasStorefront
                        ? 'var(--color-brand)'
                        : 'var(--color-border)',
                      boxShadow: formData.hasStorefront
                        ? '0 10px 24px -6px rgba(91, 110, 245, 0.4)'
                        : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: formData.hasStorefront
                          ? 'rgba(255, 255, 255, 0.2)'
                          : 'var(--color-surface)',
                        color: formData.hasStorefront
                          ? '#ffffff'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-xs sm:text-sm font-bold"
                        style={{
                          color: formData.hasStorefront
                            ? '#ffffff'
                            : 'var(--color-text-primary)',
                        }}
                      >
                        Physical Storefront / Office
                      </p>
                      <p
                        className="text-[11px] mt-0.5 leading-relaxed"
                        style={{
                          color: formData.hasStorefront
                            ? 'rgba(255, 255, 255, 0.85)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        Showroom, dealership, office, or retail shop with business hours.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('hasStorefront', false)}
                    className="p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3"
                    style={{
                      background: !formData.hasStorefront
                        ? 'linear-gradient(135deg, var(--color-brand), #6366F1)'
                        : 'var(--color-bg)',
                      borderColor: !formData.hasStorefront
                        ? 'var(--color-brand)'
                        : 'var(--color-border)',
                      boxShadow: !formData.hasStorefront
                        ? '0 10px 24px -6px rgba(91, 110, 245, 0.4)'
                        : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: !formData.hasStorefront
                          ? 'rgba(255, 255, 255, 0.2)'
                          : 'var(--color-surface)',
                        color: !formData.hasStorefront
                          ? '#ffffff'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-xs sm:text-sm font-bold"
                        style={{
                          color: !formData.hasStorefront
                            ? '#ffffff'
                            : 'var(--color-text-primary)',
                        }}
                      >
                        Online / Service-Area Only
                      </p>
                      <p
                        className="text-[11px] mt-0.5 leading-relaxed"
                        style={{
                          color: !formData.hasStorefront
                            ? 'rgba(255, 255, 255, 0.85)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        E-commerce, mobile, or home-based business (no street address needed).
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Phone *"
                  placeholder="e.g. (555) 234-5678"
                  leftIcon={<Phone size={16} />}
                  value={formData.businessPhone}
                  onChange={(e) => handleFieldChange('businessPhone', e.target.value)}
                  error={errors.businessPhone}
                />
                <Input
                  label="Business Email"
                  type="email"
                  placeholder="e.g. sales@yourbusiness.com"
                  leftIcon={<Mail size={16} />}
                  value={formData.businessEmail}
                  onChange={(e) => handleFieldChange('businessEmail', e.target.value)}
                />
              </div>

              {/* Business Description */}
              <Textarea
                label="About Your Business (Optional)"
                placeholder="Tell buyers about your business, specialties, financing, or return policy..."
                rows={3}
                maxLength={500}
                showCount
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
              />

              {/* Step 1 Footer */}
              <div
                className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Button type="button" variant="secondary" onClick={onBack}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: BUSINESS LOCATION & HOURS */}
        {step === 2 && (
          <BusinessLocationAndHoursStep
            formData={formData}
            setFormData={setFormData}
            coords={coords}
            setCoords={setCoords}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNextStep}
            onBack={() => {
              setStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {/* STEP 3: REVIEW & LAUNCH */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="rounded-3xl p-6 sm:p-8 border shadow-sm space-y-5"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  className="text-xl sm:text-2xl font-bold tracking-tight"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {hasExistingBusiness && !initialEditMode
                    ? 'Your Business Storefront'
                    : 'Review Your Storefront'}
                </h2>
                <p
                  className="text-xs sm:text-sm mt-0.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {hasExistingBusiness && !initialEditMode
                    ? 'Your storefront is ready. Continue to create your listing or edit your details.'
                    : 'Here is how your business profile will appear to buyers across Aliwayz.'}
                </p>
              </div>

              {hasExistingBusiness && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Storefront
                </span>
              )}
            </div>

            {/* Live Storefront Preview Card */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="h-24 sm:h-28 relative"
                style={{
                  background: bannerPreview
                    ? undefined
                    : 'linear-gradient(135deg, rgba(91, 110, 245, 0.22) 0%, rgba(139, 92, 246, 0.18) 50%, rgba(59, 130, 246, 0.14) 100%)',
                }}
              >
                {bannerPreview && (
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                  Edit Profile
                </button>
              </div>

              <div className="p-5 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                  <div
                    className="rounded-2xl p-1 shadow-md w-fit -mt-9 flex-shrink-0 border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <Avatar
                      src={logoPreview}
                      name={formData.storeName || 'Business'}
                      size="xl"
                    />
                  </div>
                  <div className="flex-1 pt-1 sm:pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="text-lg font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {formData.storeName || 'Your Business Name'}
                      </h3>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'rgba(91, 110, 245, 0.12)',
                          color: 'var(--color-brand)',
                        }}
                      >
                        {getBusinessTypeLabel(formData.businessType)}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-1 flex flex-wrap items-center gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {formData.hasStorefront &&
                        formData.addressVisibility === 'exact' &&
                        formData.streetAddress
                          ? `${formData.streetAddress}, ${formData.locationCity}`
                          : `${formData.locationCity} ${
                              formData.hasStorefront
                                ? '(Approximate Area)'
                                : '(Service Area)'
                            }`}
                      </span>
                      {formData.hasStorefront && todayStatus && (
                        <>
                          <span>•</span>
                          <span
                            className={
                              todayStatus.isOpen
                                ? 'text-emerald-500 font-semibold'
                                : ''
                            }
                          >
                            {todayStatus.fullLabel}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {formData.description && (
                  <p
                    className="text-xs sm:text-sm leading-relaxed mb-4"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {formData.description}
                  </p>
                )}

                {/* Details Grid */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {/* Location Card */}
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Location &amp; Privacy
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold inline-flex items-center gap-1"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                    <p
                      className="text-xs sm:text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {formData.hasStorefront
                        ? 'Physical Storefront'
                        : 'Online / Service-Area Business'}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {formData.hasStorefront
                        ? formData.addressVisibility === 'exact'
                          ? `${formData.streetAddress}, ${formData.locationCity}`
                          : `${formData.locationCity} (Street address hidden)`
                        : `Primary Location: ${formData.locationCity}`}
                    </p>
                  </div>

                  {/* Hours & Contact Card */}
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {formData.hasStorefront
                          ? 'Contact & Business Hours'
                          : 'Business Contact'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(formData.hasStorefront ? 2 : 1)}
                        className="text-xs font-semibold inline-flex items-center gap-1"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>

                    <div
                      className="space-y-1 text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {formData.businessPhone && (
                        <p>
                          <strong style={{ color: 'var(--color-text-primary)' }}>
                            Phone:
                          </strong>{' '}
                          {formData.businessPhone}
                        </p>
                      )}
                      {formData.businessEmail && (
                        <p>
                          <strong style={{ color: 'var(--color-text-primary)' }}>
                            Email:
                          </strong>{' '}
                          {formData.businessEmail}
                        </p>
                      )}
                      {formData.hasStorefront && (
                        <div
                          className="pt-1.5 mt-1.5 border-t"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          {hoursSummary.map((row) => (
                            <div
                              key={row.days}
                              className="flex items-center justify-between py-0.5"
                            >
                              <span className="font-medium">{row.days}</span>
                              <span>{row.hours}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Footer */}
            <div
              className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  leftIcon={<Edit3 size={15} />}
                >
                  Edit Details
                </Button>
                {(savedStoreResult?.slug || existingStore?.slug) && (
                  <Link
                    to={`/store/${savedStoreResult?.slug || existingStore?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <ExternalLink size={14} />
                    View Storefront
                  </Link>
                )}
              </div>
              <Button
                type="button"
                isLoading={isSaving}
                onClick={handleSaveBusinessProfile}
                rightIcon={<ArrowRight size={16} />}
              >
                {hasExistingBusiness
                  ? 'Save & Continue'
                  : 'Launch Storefront & Continue'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: STOREFRONT PUBLISHED (DONE) */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 sm:p-12 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg text-center max-w-2xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Your Business Storefront is Live!
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                Customers can now discover your business, view your hours and location, and purchase your listings on Aliwayz.
              </p>
            </div>

            {/* Store Card Preview */}
            <div className="p-4 rounded-2xl border bg-slate-50/80 dark:bg-slate-900/40 border-[var(--color-border)] text-left flex items-center gap-4">
              <Avatar
                src={logoPreview}
                name={formData.storeName || 'Business'}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[var(--color-text-primary)] truncate">
                    {formData.storeName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                  <MapPin size={12} className="inline mr-1 text-blue-600" />
                  {formData.streetAddress ? `${formData.streetAddress}, ` : ''}{formData.locationCity}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(storageKey);
                  } catch (_e) {}
                  onComplete?.(savedStoreResult || existingStore);
                }}
                rightIcon={<ArrowRight size={16} />}
                className="w-full sm:w-auto"
              >
                Create a Listing Now
              </Button>

              {(savedStoreResult?.slug || existingStore?.slug) && (
                <Link
                  to={`/store/${savedStoreResult?.slug || existingStore?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--glass-bg-subtle)] transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={15} />
                  <span>View Storefront</span>
                </Link>
              )}

              <Link
                to="/dashboard"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(storageKey);
                  } catch (_e) {}
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageCropperModal
        isOpen={cropperState.open}
        file={cropperState.file}
        aspectRatio={cropperState.type === 'logo' ? 1 : 3}
        shape={cropperState.type === 'logo' ? 'round' : 'rect'}
        title={
          cropperState.type === 'logo'
            ? 'Crop Business Logo'
            : 'Crop Storefront Cover Photo'
        }
        onClose={() =>
          setCropperState({ open: false, file: null, type: 'logo' })
        }
        onCropComplete={handleCropComplete}
      />
    </motion.div>
  );
}
