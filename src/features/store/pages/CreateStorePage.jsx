import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Store, Camera, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { createStoreSchema } from '@lib/validators';
import StoreService from '@api/services/store.service';
import CategoryService from '@api/services/category.service';
import VerificationService from '@api/services/verification.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import PageHeader from '@components/common/PageHeader';
import Spinner from '@components/ui/Spinner';
import { cn, getErrorMessage } from '@lib/utils';
import {
  setFormErrors,
  validateImageFile,
  createFilePreview,
  revokeFilePreview,
} from '@utils/helpers';
import toast from '@lib/toast';
import { CATEGORY_IDS } from '@utils/constants';

const STORE_CATEGORIES = [
  { value: CATEGORY_IDS.AUTOMOTIVE, label: 'Automotive' },
  { value: CATEGORY_IDS.PROPERTY, label: 'Real Estate' },
  { value: CATEGORY_IDS.OTHER, label: 'Marketplace' },
];

export default function CreateStorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

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

  // ── Logo dropzone ──────────────────────────────────────
  const onLogoDrop = useCallback(
    (files) => {
      const file = files[0];
      if (!file) return;
      const v = validateImageFile(file);
      if (!v.valid) {
        toast.error(v.error);
        return;
      }
      if (logoPreview) revokeFilePreview(logoPreview);
      setLogoFile(file);
      setLogoPreview(createFilePreview(file));
    },
    [logoPreview]
  );

  const logoDropzone = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // ── Banner dropzone ────────────────────────────────────
  const onBannerDrop = useCallback(
    (files) => {
      const file = files[0];
      if (!file) return;
      const v = validateImageFile(file);
      if (!v.valid) {
        toast.error(v.error);
        return;
      }
      if (bannerPreview) revokeFilePreview(bannerPreview);
      setBannerFile(file);
      setBannerPreview(createFilePreview(file));
    },
    [bannerPreview]
  );

  const bannerDropzone = useDropzone({
    onDrop: onBannerDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // ── Create store mutation ──────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data) => {
      // Step 1: Create store
      const response = await StoreService.create(data);
      const store = response.data;

      if (!store?.id) throw new Error('Store creation failed');

      // Step 2: Upload logo if selected
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

      // Step 3: Upload banner if selected
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
    onSuccess: (store) => {
      // Cleanup
      if (logoPreview) revokeFilePreview(logoPreview);
      if (bannerPreview) revokeFilePreview(bannerPreview);

      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      toast.success('Store created! 🎉');
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

  const isVerified = verificationData?.data?.status === 'identity_verified';

  return (
    <>
      <Helmet>
        <title>Create Store — Aliwayz</title>
      </Helmet>

      <div className="container-app py-6">
        <div className="mx-auto max-w-lg">
          <PageHeader showBack title="Set Up Your Seller Profile" />

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
              {/* ── Banner Upload ──────────────────────────── */}
              <div className="space-y-2">
                <label className="floating-label">Store Banner (optional)</label>
                <div
                  {...bannerDropzone.getRootProps()}
                  className={cn(
                    'group relative h-32 cursor-pointer overflow-hidden rounded-2xl transition-all duration-200',
                    bannerDropzone.isDragActive && 'ring-2 ring-[var(--color-brand)]'
                  )}
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '2px dashed var(--color-border)',
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
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <Camera size={24} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Click or drag to upload banner (1200×400)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Logo Upload ────────────────────────────── */}
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <label className="floating-label">Store Logo (optional)</label>
                  <div
                    {...logoDropzone.getRootProps()}
                    className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-2xl"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '2px dashed var(--color-border)',
                    }}
                  >
                    <input {...logoDropzone.getInputProps()} />

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
                      <div className="flex h-full items-center justify-center">
                        <Camera size={20} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <Input
                    label="Business Name"
                    placeholder="My Auto Sales, Jane's Boutique..."
                    error={errors.store_name?.message}
                    autoFocus
                    {...register('store_name')}
                  />
                </div>
              </div>

              {/* ── Form Fields ────────────────────────────── */}
              <Textarea
                label="Description"
                placeholder="What do you sell? Tell buyers about your store..."
                maxLength={1000}
                error={errors.description?.message}
                {...register('description')}
              />

              <Select
                label="Category (optional)"
                placeholder="Select a category"
                options={STORE_CATEGORIES}
                error={errors.category_id?.message}
                {...register('category_id')}
              />

              <Input
                label="City"
                placeholder="New York"
                error={errors.location_city?.message}
                {...register('location_city')}
              />

              <Input
                label="Instagram (optional)"
                placeholder="https://instagram.com/yourstore"
                {...register('social_instagram')}
              />

              <Input
                label="Facebook (optional)"
                placeholder="https://facebook.com/yourstore"
                {...register('social_facebook')}
              />

              <Input
                label="TikTok (optional)"
                placeholder="https://tiktok.com/@yourstore"
                {...register('social_tiktok')}
              />

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={mutation.isPending}
                  loadingText="Launching Storefront..."
                  leftIcon={<Store size={18} />}
                >
                  Create Storefront & Start Listing
                </Button>
                <p
                  className="text-center text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  You can update your store profile, logo, and social links anytime.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
