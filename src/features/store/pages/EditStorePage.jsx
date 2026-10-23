import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Camera, Trash2, Save } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { updateStoreSchema } from '@lib/validators';
import StoreService from '@api/services/store.service';
import { queryKeys } from '@lib/queryClient';
import useMyStore from '@hooks/useMyStore';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import GoogleLocationPicker from '@components/common/GoogleLocationPicker';
import { cn, getErrorMessage } from '@lib/utils';
import {
  setFormErrors,
  validateImageFile,
  revokeFilePreview,
} from '@utils/helpers';
import toast from '@lib/toast';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';
import ImageCropperModal from '@components/modals/ImageCropperModal';
import { CATEGORY_IDS } from '@utils/constants';
import { parseStoreMeta, encodeStoreDescription } from '@utils/sellerMeta';

const STORE_CATEGORIES = [
  { value: CATEGORY_IDS.OTHER, label: 'Marketplace & Goods' },
  { value: CATEGORY_IDS.AUTOMOTIVE, label: 'Automotive' },
  { value: CATEGORY_IDS.PROPERTY, label: 'Real Estate' },
];

const resolveStoreCategoryId = (storeObj, metaObj) => {
  const directId = storeObj?.category_id || storeObj?.categories?.id;
  if (directId && STORE_CATEGORIES.some((c) => c.value === directId)) {
    return directId;
  }
  const bt = (metaObj?.businessType || '').toLowerCase();
  if (bt === 'automotive' || bt === 'car_dealership' || bt === 'auto_parts') {
    return CATEGORY_IDS.AUTOMOTIVE;
  }
  if (bt === 'real_estate' || bt === 'real_estate_agency' || bt === 'property_management') {
    return CATEGORY_IDS.PROPERTY;
  }
  if (bt === 'marketplace' || bt === 'retail_store' || bt === 'electronics_shop') {
    return CATEGORY_IDS.OTHER;
  }
  if (directId === CATEGORY_IDS.VEHICLES) return CATEGORY_IDS.AUTOMOTIVE;
  if (directId === CATEGORY_IDS.REAL_ESTATE) return CATEGORY_IDS.PROPERTY;
  if (directId) return directId;
  return CATEGORY_IDS.OTHER;
};

export default function EditStorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { store, hasStore, isLoading: storeLoading } = useMyStore();
  const storeMeta = parseStoreMeta(store);

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cropConfig, setCropConfig] = useState({
    isOpen: false,
    file: null,
    type: 'logo',
    title: 'Adjust Store Logo',
    subtitle: 'Drag to position and zoom your store logo',
    aspectRatio: 1,
    shape: 'round',
  });

  const [coords, setCoords] = useState({
    lat: store?.location_lat || null,
    lng: store?.location_lng || null,
  });
  const [addressVisibility, setAddressVisibility] = useState(
    storeMeta.addressVisibility || 'exact'
  );

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateStoreSchema),
    values: store
      ? {
          store_name: store.store_name || '',
          description: storeMeta.cleanDescription || '',
          category_id: resolveStoreCategoryId(store, storeMeta),
          location_city: store.location_city || '',
          social_instagram: store.social_instagram || '',
          social_facebook: store.social_facebook || '',
          social_tiktok: store.social_tiktok || '',
        }
      : undefined,
  });

  // Set initial previews and category from store data
  useEffect(() => {
    if (store) {
      if (store.logo_url) setLogoPreview(store.logo_url);
      if (store.banner_url) setBannerPreview(store.banner_url);
      const resolvedCatId = resolveStoreCategoryId(store, storeMeta);
      if (resolvedCatId) {
        setValue('category_id', resolvedCatId);
      }
    }
  }, [store, storeMeta, setValue]);

  // ── Crop Complete Handler ─────────────────────────────
  const handleCropComplete = (croppedFile, previewUrl) => {
    if (cropConfig.type === 'logo') {
      if (logoPreview && typeof logoPreview === 'string' && logoPreview.startsWith('blob:')) {
        revokeFilePreview(logoPreview);
      }
      setLogoFile(croppedFile);
      setLogoPreview(previewUrl);
    } else if (cropConfig.type === 'banner') {
      if (bannerPreview && typeof bannerPreview === 'string' && bannerPreview.startsWith('blob:')) {
        revokeFilePreview(bannerPreview);
      }
      setBannerFile(croppedFile);
      setBannerPreview(previewUrl);
    }
  };

  // ── Logo upload ────────────────────────────────────────
  const onLogoDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.valid) {
      toast.error(v.error);
      return;
    }
    setCropConfig({
      isOpen: true,
      file,
      type: 'logo',
      title: 'Adjust Store Logo',
      subtitle: 'Drag to position and zoom your store logo',
      aspectRatio: 1,
      shape: 'round',
    });
  }, []);

  const logoDropzone = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // ── Banner upload ──────────────────────────────────────
  const onBannerDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.valid) {
      toast.error(v.error);
      return;
    }
    setCropConfig({
      isOpen: true,
      file,
      type: 'banner',
      title: 'Adjust Store Banner',
      subtitle: 'Drag to position and frame your store banner',
      aspectRatio: 3,
      shape: 'rect',
    });
  }, []);

  const bannerDropzone = useDropzone({
    onDrop: onBannerDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // ── Update store details ───────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Keep businessType in sync if category changed
      let syncedBusinessType = storeMeta.businessType;
      if (data.category_id === CATEGORY_IDS.AUTOMOTIVE) {
        syncedBusinessType = 'automotive';
      } else if (data.category_id === CATEGORY_IDS.PROPERTY) {
        syncedBusinessType = 'real_estate';
      } else if (data.category_id === CATEGORY_IDS.OTHER) {
        syncedBusinessType = 'marketplace';
      }

      const payload = {
        ...data,
        description: encodeStoreDescription(data.description, {
          sellerType: storeMeta.sellerType === 'personal' ? 'personal' : 'business',
          businessType: storeMeta.isBusinessProfile ? (syncedBusinessType || storeMeta.businessType) : undefined,
          hasStorefront: storeMeta.isBusinessProfile ? storeMeta.hasStorefront : false,
          streetAddress: storeMeta.isBusinessProfile ? storeMeta.streetAddress : undefined,
          addressVisibility: addressVisibility || storeMeta.addressVisibility,
          businessEmail: storeMeta.isBusinessProfile ? storeMeta.businessEmail : undefined,
          businessPhone: storeMeta.businessPhone,
          websiteUrl: storeMeta.isBusinessProfile ? storeMeta.websiteUrl : undefined,
          businessHours: storeMeta.isBusinessProfile ? storeMeta.businessHours : undefined,
        }),
        ...(coords.lat && coords.lng
          ? { location_lat: coords.lat, location_lng: coords.lng }
          : {}),
      };
      await StoreService.update(store.id, payload);

      // Upload logo if changed
      if (logoFile) {
        const logoForm = new FormData();
        logoForm.append('file', logoFile, logoFile.name);
        await StoreService.uploadLogo(store.id, logoForm);
      }

      // Upload banner if changed
      if (bannerFile) {
        const bannerForm = new FormData();
        bannerForm.append('file', bannerFile, bannerFile.name);
        await StoreService.uploadBanner(store.id, bannerForm);
      }
    },
    onSuccess: () => {
      if (store?.user_id) {
        localStorage.setItem(
          `aliwayz_seller_mode_${store.user_id}`,
          storeMeta.sellerType === 'personal' ? 'personal' : 'business'
        );
      }
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.bySlug(store?.slug) });
      toast.success('Storefront settings saved!');
      navigate('/sell/my-listings');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setFormErrors(err, setError);
    },
  });

  // ── Delete store ───────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => StoreService.delete(store.id),
    onSuccess: () => {
      if (store?.user_id) {
        localStorage.removeItem(`aliwayz_seller_mode_${store.user_id}`);
      }
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      toast.success('Store deleted');
      navigate('/');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (storeLoading)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  if (!hasStore)
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No seller or business profile found yet.
        </p>
        <Button onClick={() => navigate('/sell/create')}>
          Set Up Seller Profile
        </Button>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>Seller &amp; Storefront Settings — Aliwayz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto max-w-2xl">
        <PageHeader
          showBack
          title="Seller & Storefront Settings"
          rightAction={
            <div className="flex items-center gap-2">
              {store?.slug && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/store/${store.slug}`)}
                >
                  View Storefront
                </Button>
              )}
              <Button
                type="button"
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          }
        />

        <motion.form
          onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
          className="space-y-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* ── Unified Storefront Header Card (Banner + Logo) ── */}
          <div
            className="rounded-3xl overflow-hidden border shadow-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {/* Cover Banner */}
            <div
              {...bannerDropzone.getRootProps()}
              className={cn(
                'group relative h-36 sm:h-44 cursor-pointer overflow-hidden transition-all',
                bannerDropzone.isDragActive && 'ring-2 ring-[var(--color-brand)]'
              )}
              style={{
                background: bannerPreview
                  ? undefined
                  : 'linear-gradient(135deg, rgba(91, 110, 245, 0.20) 0%, rgba(139, 92, 246, 0.16) 50%, rgba(59, 130, 246, 0.12) 100%)',
              }}
            >
              <input {...bannerDropzone.getInputProps()} />
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={26} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1.5">
                  <Camera size={22} style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Click to upload storefront cover photo (1200×400)
                  </span>
                </div>
              )}

              <span
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Camera size={13} style={{ color: 'var(--color-brand)' }} />
                {bannerPreview ? 'Change Cover' : 'Add Cover'}
              </span>

              {bannerFile && (
                <span className="absolute left-3 top-3 rounded-full bg-[var(--color-brand)] px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                  New Cover Selected
                </span>
              )}
            </div>

            {/* Body Fields inside Card */}
            <div className="px-6 sm:px-8 pb-7 space-y-5">
              {/* Overlapping Logo + Cleanly Positioned Store Name */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div
                  {...logoDropzone.getRootProps()}
                  className="group relative h-20 w-20 -mt-10 cursor-pointer overflow-hidden rounded-2xl p-1 shadow-lg flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                  title="Click to change logo"
                >
                  <input {...logoDropzone.getInputProps()} />
                  <div className="h-full w-full overflow-hidden rounded-xl relative">
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                          <Camera size={16} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{ backgroundColor: 'var(--color-bg)' }}
                      >
                        <Camera size={20} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 pt-1 sm:pt-3.5">
                  <Input
                    label="Store or Business Name *"
                    placeholder="e.g. Metro Auto Group, Skyline Realty, or Urban Goods"
                    error={errors.store_name?.message}
                    {...register('store_name')}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  label="Primary Category"
                  placeholder="Select category"
                  options={STORE_CATEGORIES}
                  error={errors.category_id?.message}
                  {...register('category_id')}
                />

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Storefront Location &amp; Map *
                  </label>
                  <GoogleLocationPicker
                    value={{
                      lat: coords.lat,
                      lng: coords.lng,
                      locationCity: watch('location_city'),
                      addressVisibility: addressVisibility,
                    }}
                    onChange={(loc) => {
                      setCoords({ lat: loc.lat, lng: loc.lng });
                      setValue('location_city', loc.locationCity || '', { shouldValidate: true });
                      setValue('location_lat', loc.lat);
                      setValue('location_lng', loc.lng);
                      setAddressVisibility(loc.addressVisibility);
                    }}
                    defaultVisibility="exact"
                    sellerType="business"
                  />
                  {errors.location_city?.message && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
                      {errors.location_city?.message}
                    </p>
                  )}
                </div>
              </div>

              <Textarea
                label="About Your Storefront"
                placeholder="Tell buyers about your business, specialties, or policies..."
                rows={3}
                maxLength={1000}
                error={errors.description?.message}
                {...register('description')}
              />

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <Input
                  label="Instagram (Optional)"
                  placeholder="@yourbusiness"
                  {...register('social_instagram')}
                />
                <Input
                  label="Facebook (Optional)"
                  placeholder="facebook.com/yourpage"
                  {...register('social_facebook')}
                />
                <Input
                  label="TikTok (Optional)"
                  placeholder="@yourbusiness"
                  {...register('social_tiktok')}
                />
              </div>

              {/* Advanced Storefront Address & Business Hours Link */}
              <div
                className="rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Storefront Address, Privacy &amp; Business Hours
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Manage your street address, public map privacy, business phone, and weekly hours.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/sell/create?mode=business&onboarding=business-edit')}
                >
                  Edit Hours &amp; Address
                </Button>
              </div>

              <div
                className="flex gap-3 pt-4 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  isLoading={updateMutation.isPending}
                  loadingText="Saving..."
                  leftIcon={<Save size={16} />}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Delete Modal */}
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate()}
          isLoading={deleteMutation.isPending}
          title="Delete your storefront?"
          description="This will permanently delete your storefront, ALL your product listings, and all associated data. Your followers will be removed. This cannot be reversed."
          itemName={store?.store_name}
          itemType="Storefront"
          countdownSeconds={10}
        />

        {/* Image Cropper Modal */}
        <ImageCropperModal
          isOpen={cropConfig.isOpen}
          file={cropConfig.file}
          title={cropConfig.title}
          subtitle={cropConfig.subtitle}
          aspectRatio={cropConfig.aspectRatio}
          shape={cropConfig.shape}
          onCropComplete={handleCropComplete}
          onClose={() => setCropConfig((prev) => ({ ...prev, isOpen: false, file: null }))}
        />
      </div>
    </>
  );
}
