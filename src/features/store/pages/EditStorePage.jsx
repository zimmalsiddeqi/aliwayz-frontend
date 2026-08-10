import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Camera, Trash2, Save, X, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { updateStoreSchema } from '@lib/validators';
import StoreService from '@api/services/store.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import useMyStore from '@hooks/useMyStore';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import { cn, getErrorMessage } from '@lib/utils';
import {
  setFormErrors,
  validateImageFile,
  createFilePreview,
  revokeFilePreview,
} from '@utils/helpers';
import toast from '@lib/toast';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';

export default function EditStorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { store, hasStore, isLoading: storeLoading, refetch } = useMyStore();

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
  });

  // Set initial previews from store data
  useEffect(() => {
    if (store) {
      if (store.logo_url) setLogoPreview(store.logo_url);
      if (store.banner_url) setBannerPreview(store.banner_url);
    }
  }, [store]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(updateStoreSchema),
    values: store
      ? {
          store_name: store.store_name || '',
          description: store.description || '',
          category_id: store.categories?.id || '',
          location_city: store.location_city || '',
          social_instagram: store.social_instagram || '',
          social_facebook: store.social_facebook || '',
          social_tiktok: store.social_tiktok || '',
        }
      : undefined,
  });

  // ── Logo upload ────────────────────────────────────────
  const onLogoDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.valid) {
      toast.error(v.error);
      return;
    }
    setLogoFile(file);
    setLogoPreview(createFilePreview(file));
  }, []);

  const logoDropzone = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const uploadLogo = async () => {
    if (!logoFile || !store?.id) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', logoFile, logoFile.name);
      await StoreService.uploadLogo(store.id, formData);
      toast.success('Logo updated!');
      setLogoFile(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Banner upload ──────────────────────────────────────
  const onBannerDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.valid) {
      toast.error(v.error);
      return;
    }
    setBannerFile(file);
    setBannerPreview(createFilePreview(file));
  }, []);

  const bannerDropzone = useDropzone({
    onDrop: onBannerDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const uploadBanner = async () => {
    if (!bannerFile || !store?.id) return;
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', bannerFile, bannerFile.name);
      await StoreService.uploadBanner(store.id, formData);
      toast.success('Banner updated!');
      setBannerFile(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingBanner(false);
    }
  };

  // ── Update store details ───────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await StoreService.update(store.id, data);

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
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.bySlug(store?.slug) });
      toast.success('Store updated!');
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
        <p style={{ color: 'var(--color-text-muted)' }}>No store found</p>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>Edit Store — Aliwayz</title>
      </Helmet>

      <div className="mx-auto max-w-lg">
        <PageHeader
          showBack
          title="Edit Store"
          rightAction={
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          }
        />

        <motion.form
          onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
          className="space-y-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* ── Banner ────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="floating-label">Store Banner</label>
              {bannerFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  isLoading={uploadingBanner}
                  onClick={uploadBanner}
                >
                  Upload Now
                </Button>
              )}
            </div>
            <div
              {...bannerDropzone.getRootProps()}
              className={cn(
                'group relative h-36 cursor-pointer overflow-hidden rounded-2xl transition-all',
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
                  <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={28} className="text-white" />
                  </div>
                  {bannerFile && (
                    <span className="absolute left-2 top-2 rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-bold text-white">
                      New — unsaved
                    </span>
                  )}
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Camera size={24} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Upload banner (1200×400)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Logo + Store Name ──────────────────────────── */}
          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="floating-label">Logo</label>
                {logoFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    isLoading={uploadingLogo}
                    onClick={uploadLogo}
                  >
                    Upload
                  </Button>
                )}
              </div>
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
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
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
                label="Store Name"
                error={errors.store_name?.message}
                {...register('store_name')}
              />
            </div>
          </div>

          {/* ── Fields ────────────────────────────────────── */}
          <Textarea
            label="Description"
            maxLength={1000}
            error={errors.description?.message}
            {...register('description')}
          />

          <Select
            label="Category"
            placeholder="Select category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.category_id?.message}
            {...register('category_id')}
          />

          <Input
            label="City"
            error={errors.location_city?.message}
            {...register('location_city')}
          />

          <Input
            label="Instagram"
            placeholder="https://instagram.com/..."
            {...register('social_instagram')}
          />
          <Input
            label="Facebook"
            placeholder="https://facebook.com/..."
            {...register('social_facebook')}
          />
          <Input
            label="TikTok"
            placeholder="https://tiktok.com/@..."
            {...register('social_tiktok')}
          />

          <div className="flex gap-3 pt-2">
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
        </motion.form>

        {/* Delete Modal */}
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate()}
          isLoading={deleteMutation.isPending}
          title="Delete your store?"
          description="This will permanently delete your store, ALL your product listings, and all associated data. Your followers will be removed. This cannot be reversed."
          itemName={store?.store_name}
          itemType="Store"
          countdownSeconds={10}
        />
      </div>
    </>
  );
}
