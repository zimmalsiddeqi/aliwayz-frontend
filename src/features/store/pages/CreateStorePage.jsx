import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Store, Camera, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { createStoreSchema } from '@lib/validators';
import StoreService from '@api/services/store.service';
import VerificationService from '@api/services/verification.service';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import PageHeader from '@components/common/PageHeader';
import Spinner from '@components/ui/Spinner';
import GoogleLocationPicker from '@components/common/GoogleLocationPicker';
import { cn, getErrorMessage } from '@lib/utils';
import {
  setFormErrors,
  validateImageFile,
  revokeFilePreview,
} from '@utils/helpers';
import toast from '@lib/toast';
import ImageCropperModal from '@components/modals/ImageCropperModal';
import { CATEGORY_IDS } from '@utils/constants';

const STORE_CATEGORIES = [
  { value: CATEGORY_IDS.OTHER, label: 'Marketplace & Goods' },
  { value: CATEGORY_IDS.AUTOMOTIVE, label: 'Automotive' },
  { value: CATEGORY_IDS.PROPERTY, label: 'Real Estate' },
];

export default function CreateStorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [cropConfig, setCropConfig] = useState({
    isOpen: false,
    file: null,
    type: 'logo',
    title: 'Adjust Store Logo',
    subtitle: 'Drag to position and zoom your store logo',
    aspectRatio: 1,
    shape: 'round',
  });

  // Check identity verification status
  const { data: verificationData, isLoading: isLoadingVerification } = useQuery({
    queryKey: ['verification', 'status'],
    queryFn: VerificationService.getStatus,
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      store_name: '',
      description: '',
      category_id: '',
      location_city: '',
      social_instagram: '',
      social_facebook: '',
      social_tiktok: '',
    },
  });

  useEffect(() => {
    const draftStore = verificationData?.data?.latest_submission?.verification_metadata?.draft_store;
    if (draftStore) {
      reset({
        store_name: draftStore.store_name || '',
        description: draftStore.description || '',
        category_id: draftStore.category_id || '',
        location_city: draftStore.location_city || '',
        social_instagram: draftStore.social_instagram || '',
        social_facebook: draftStore.social_facebook || '',
        social_tiktok: draftStore.social_tiktok || '',
      });
      if (draftStore.logo_url) setLogoPreview(draftStore.logo_url);
      if (draftStore.banner_url) setBannerPreview(draftStore.banner_url);
    }
  }, [verificationData, reset]);

  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [addressVisibility, setAddressVisibility] = useState('exact');

  const selectedCategoryId = watch('category_id');

  const getStoreNamePlaceholder = (catId) => {
    if (catId === CATEGORY_IDS.AUTOMOTIVE) return 'e.g. Metro Auto Group, Apex Motors...';
    if (catId === CATEGORY_IDS.PROPERTY) return 'e.g. Skyline Realty, Prime Properties...';
    if (catId === CATEGORY_IDS.OTHER) return 'e.g. Urban Goods, Daily Essentials...';
    return 'e.g. Metro Auto Group, Skyline Realty, or Urban Goods';
  };

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

  // ── Logo dropzone ──────────────────────────────────────
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

  // ── Banner dropzone ────────────────────────────────────
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

  // ── Create store mutation ──────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        ...(coords.lat && coords.lng
          ? { location_lat: coords.lat, location_lng: coords.lng }
          : {}),
      };
      const response = await StoreService.create(payload);
      const store = response.data;

      if (!store?.id) throw new Error('Store creation failed');

      if (logoFile && store.id) {
        try {
          const logoFormData = new FormData();
          logoFormData.append('file', logoFile, logoFile.name);
          await StoreService.uploadLogo(store.id, logoFormData);
        } catch (err) {
          console.error('Logo upload failed:', err);
          toast.error('Store created but logo failed to upload');
        }
      }

      if (bannerFile && store.id) {
        try {
          const bannerFormData = new FormData();
          bannerFormData.append('file', bannerFile, bannerFile.name);
          await StoreService.uploadBanner(store.id, bannerFormData);
        } catch (err) {
          console.error('Banner upload failed:', err);
          toast.error('Store created but banner failed to upload');
        }
      }

      return store;
    },
    onSuccess: () => {
      if (logoPreview) revokeFilePreview(logoPreview);
      if (bannerPreview) revokeFilePreview(bannerPreview);

      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      toast.success('Storefront created! 🎉');
      navigate('/sell/my-listings');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setFormErrors(err, setError);
    },
  });

  if (isLoadingVerification) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Set Up Storefront — Aliwayz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container-app py-6">
        <div className="mx-auto max-w-xl">
          <PageHeader showBack title="Set Up Your Storefront" />

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <form
              onSubmit={handleSubmit((d) => mutation.mutate(d))}
              className="rounded-3xl overflow-hidden border shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* ── Unified Cover Banner ──────────────────────── */}
              <div
                {...bannerDropzone.getRootProps()}
                className={cn(
                  'group relative h-36 cursor-pointer overflow-hidden transition-all duration-200',
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
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera size={24} className="text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        revokeFilePreview(bannerPreview);
                        setBannerPreview(null);
                        setBannerFile(null);
                      }}
                      className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1.5">
                    <Camera size={22} style={{ color: 'var(--color-text-secondary)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Click to add a storefront cover photo (Optional)
                    </span>
                  </div>
                )}
              </div>

              <div className="px-6 sm:px-8 pb-7 space-y-5">
                {/* ── Overlapping Logo + Cleanly Positioned Business Name ── */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div
                    {...logoDropzone.getRootProps()}
                    className="group relative h-20 w-20 -mt-10 cursor-pointer overflow-hidden rounded-2xl p-1 shadow-lg flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <input {...logoDropzone.getInputProps()} />
                    <div className="h-full w-full overflow-hidden rounded-xl relative">
                      {logoPreview ? (
                        <>
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
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
                      label="Business or Storefront Name *"
                      placeholder={getStoreNamePlaceholder(selectedCategoryId)}
                      error={errors.store_name?.message}
                      autoFocus
                      {...register('store_name')}
                    />
                  </div>
                </div>

                {/* ── Form Fields ────────────────────────────── */}
                <div className="space-y-4">
                  <Select
                    label="Primary Category"
                    placeholder="Select a category"
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
                  label="About Your Storefront (Optional)"
                  placeholder="Tell buyers what you offer, your specialties, or policies..."
                  rows={3}
                  maxLength={1000}
                  error={errors.description?.message}
                  {...register('description')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Instagram (Optional)"
                    placeholder="@yourstore"
                    {...register('social_instagram')}
                  />

                  <Input
                    label="Facebook (Optional)"
                    placeholder="facebook.com/yourstore"
                    {...register('social_facebook')}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={mutation.isPending}
                    loadingText="Launching Storefront..."
                    leftIcon={<Store size={18} />}
                  >
                    Launch Storefront &amp; Start Selling
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

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
    </>
  );
}
