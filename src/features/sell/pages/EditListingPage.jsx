import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X, Trash2, Save, Eye, EyeOff, Archive, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { updateProductSchema } from '@lib/validators';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import CategorySelector from '../components/CategorySelector';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import Modal from '@components/ui/Modal';
import PageHeader from '@components/common/PageHeader';
import { cn, getErrorMessage } from '@lib/utils';
import { setFormErrors, validateImageFile, createFilePreview, revokeFilePreview } from '@utils/helpers';
import { ITEM_CONDITIONS, MAX_PRODUCT_IMAGES } from '@utils/constants';
import toast from '@lib/toast';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data: productData, isLoading } = useQuery({
    queryKey: queryKeys.products.byId(id),
    queryFn: () => ProductService.getById(id),
    enabled: !!id,
  });

  const product = productData?.data;

  useEffect(() => {
    if (product && product.status === 'sold') {
      toast.error('Sold products cannot be edited');
      navigate('/sell/my-listings');
      return;
    }
    if (product?.product_images) {
      setExistingImages(
        product.product_images.map((img) => ({
          id: img.id,
          url: img.cdn_url || img.storage_url,
          is_primary: img.is_primary,
          isExisting: true,
        }))
      );
    }
  }, [product, navigate]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(updateProductSchema),
    values: product
      ? {
          title: product.title || '',
          description: product.description || '',
          category_id: product.category_id || product.categories?.id || '',
          condition: product.condition || 'good',
          price: product.price ? String(product.price) : '',
          brand: product.brand || '',
          color: product.color || '',
          quantity: product.quantity || 1,
          location_city: product.location_city || '',
        }
      : undefined,
  });

  const totalImages = existingImages.length + newImages.length;

  const onDrop = useCallback(
    (files) => {
      const remaining = MAX_PRODUCT_IMAGES - totalImages;
      for (const file of files.slice(0, remaining)) {
        const v = validateImageFile(file);
        if (!v.valid) {
          toast.error(v.error);
          continue;
        }
        setNewImages((prev) => [...prev, { file, preview: createFilePreview(file) }]);
      }
    },
    [totalImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    disabled: totalImages >= MAX_PRODUCT_IMAGES,
  });

  const removeNewImage = (index) => {
    revokeFilePreview(newImages[index].preview);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteImageMutation = useMutation({
    mutationFn: (imageId) => ProductService.deleteImage(id, imageId),
    onSuccess: (_, imageId) => {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(id) });
      toast.success('Image removed');
      setDeletingImageId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setDeletingImageId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        condition: formData.condition,
        category_id: formData.category_id,
        brand: formData.brand || undefined,
        color: formData.color || undefined,
        quantity: Number(formData.quantity) || 1,
        location_city: formData.location_city || undefined,
      };

      await ProductService.update(id, payload);

      if (newImages.length > 0) {
        const fd = new FormData();
        newImages.forEach((img) => fd.append('file', img.file, img.file.name));
        await ProductService.uploadImages(id, fd);
      }
    },
    onSuccess: () => {
      newImages.forEach((img) => revokeFilePreview(img.preview));
      queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(id) });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing updated successfully!');
      navigate(`/product/${id}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setFormErrors(err, setError);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => ProductService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(id) });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setShowStatusModal(false);
      toast.success('Status updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing deleted');
      navigate('/sell/my-listings');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--color-text-muted)' }}>Product not found</p>
      </div>
    );
  }

  const STATUS_OPTIONS = [
    { value: 'available', label: 'Available', icon: Eye, color: 'var(--color-success)', desc: 'Visible to everyone on the marketplace' },
    { value: 'hidden', label: 'Hidden', icon: EyeOff, color: 'var(--color-warning)', desc: 'Only you can see this listing' },
    { value: 'draft', label: 'Draft', icon: Archive, color: 'var(--color-text-muted)', desc: 'Not published yet' },
  ];

  return (
    <>
      <Helmet>
        <title>Edit: {product.title} — Aliwayz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-2xl mx-auto py-6 px-4 pb-24">
        <PageHeader
          showBack
          title="Edit Listing"
          subtitle="Update product images, details, and pricing"
          rightAction={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowStatusModal(true)}>
                Status: <span className="font-semibold capitalize ml-1">{product.status}</span>
              </Button>

              <Button
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

        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6 mt-4">
          {/* ── Photos Section ────────────────────────────── */}
          <div className="space-y-2">
            <label className="floating-label">
              Photos ({totalImages}/{MAX_PRODUCT_IMAGES})
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {/* Existing Images */}
              {existingImages.map((img, i) => (
                <div
                  key={img.id || i}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    disabled={deletingImageId === img.id}
                    onClick={() => {
                      if (existingImages.length + newImages.length <= 1) {
                        toast.error('Listing must have at least one photo');
                        return;
                      }
                      setDeletingImageId(img.id);
                      deleteImageMutation.mutate(img.id);
                    }}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                    title="Delete image"
                  >
                    {deletingImageId === img.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Newly added Images */}
              {newImages.map((img, i) => (
                <div
                  key={`new-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-brand-500/50"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <img src={img.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    New
                  </span>
                </div>
              ))}

              {/* Dropzone trigger */}
              {totalImages < MAX_PRODUCT_IMAGES && (
                <div
                  {...getRootProps()}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl transition-all hover:border-blue-500"
                  style={{
                    border: `2px dashed ${isDragActive ? '#3B82F6' : 'var(--color-border)'}`,
                    backgroundColor: isDragActive ? 'rgba(59,130,246,0.05)' : 'var(--color-surface)',
                  }}
                >
                  <input {...getInputProps()} />
                  <ImagePlus size={20} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    Add Photo
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Add up to {MAX_PRODUCT_IMAGES} photos. Clear, high-quality images sell faster.
            </p>
          </div>

          {/* ── Basic Info ────────────────────────────────── */}
          <div className="glass-card space-y-4 p-5">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Listing Details
            </h3>

            <Input
              label="Title *"
              placeholder="e.g. iPhone 15 Pro Max 256GB Natural Titanium"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <Controller
              name="category_id"
              control={control}
              rules={{ required: 'Select a category' }}
              render={({ field }) => (
                <CategorySelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.category_id?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Price ($) *"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.price?.message}
                {...register('price', { required: 'Price is required' })}
              />

              <Select
                label="Item Condition *"
                placeholder="Select condition"
                options={ITEM_CONDITIONS}
                error={errors.condition?.message}
                {...register('condition', { required: 'Condition is required' })}
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Describe your item in detail..."
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Brand (Optional)"
                placeholder="e.g. Apple, Nike..."
                {...register('brand')}
              />
              <Input
                label="Color (Optional)"
                placeholder="e.g. Black, Silver..."
                {...register('color')}
              />
              <Input
                label="Quantity"
                type="number"
                min="1"
                placeholder="1"
                {...register('quantity')}
              />
            </div>

            <Input
              label="City / Location"
              placeholder="e.g. Los Angeles, CA"
              {...register('location_city')}
            />
          </div>

          {/* ── Submit Buttons ────────────────────────────── */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate(`/product/${id}`)}
            >
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
        </form>

        {/* ── Status Modal ────────────────────────────────── */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Change Status"
          size="sm"
        >
          <div className="space-y-3 p-4">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = product.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => statusMutation.mutate(opt.value)}
                  disabled={isCurrent || statusMutation.isPending}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                    isCurrent ? 'border-brand-500 bg-brand-500/10' : 'hover:border-[var(--color-brand)]'
                  )}
                  style={{
                    backgroundColor: isCurrent ? 'var(--color-brand-glow)' : 'var(--color-surface)',
                    borderColor: isCurrent ? 'var(--color-brand)' : 'var(--color-border)',
                  }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                  >
                    <Icon size={18} style={{ color: opt.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {opt.label} {isCurrent && <span className="text-xs text-brand-500 font-normal">(Current)</span>}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Modal>

        {/* ── Delete Confirmation with Countdown ──────────── */}
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate()}
          isLoading={deleteMutation.isPending}
          title="Delete this listing?"
          description="This will permanently remove this product listing and all its images. Buyers will no longer be able to find or purchase it."
          itemName={product?.title}
          itemType="Product"
          countdownSeconds={5}
        />
      </div>
    </>
  );
}
