import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { createProductSchema } from '@lib/validators';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import CategorySelector from './CategorySelector';
import LocationOptionSelector from './LocationOptionSelector';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import PageHeader from '@components/common/PageHeader';
import { getErrorMessage } from '@lib/utils';
import useLocationStore from '@store/location.store';
import {
  setFormErrors,
  validateImageFile,
  createFilePreview,
  revokeFilePreview,
  getProductListingLocation,
} from '@utils/helpers';
import { ITEM_CONDITIONS, MAX_PRODUCT_IMAGES, CATEGORY_IDS } from '@utils/constants';
import toast from '@lib/toast';

export default function DailyProductForm({ store }) {
  const { lat: userLat, lng: userLng, city: userCity, state: userState } = useLocationStore();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      condition: '',
      price: '',
      brand: '',
      color: '',
      quantity: 1,
      location_city: store?.location_city || '',
      location_type: store?.description === 'Personal listings' ? 'approximate' : (store?.location_city ? 'store' : 'approximate'),
      status: 'available',
    },
  });

  const onDrop = useCallback(
    (files) => {
      const remaining = MAX_PRODUCT_IMAGES - images.length;
      for (const file of files.slice(0, remaining)) {
        const v = validateImageFile(file);
        if (!v.valid) {
          toast.error(v.error);
          continue;
        }
        setImages((prev) => [...prev, { file, preview: createFilePreview(file) }]);
      }
    },
    [images.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (i) => {
    revokeFilePreview(images[i].preview);
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // If price is 0, auto-classify under Free & Giveaway category
      let finalCategoryId = data.category_id;
      if (Number(data.price) === 0) {
        finalCategoryId = CATEGORY_IDS.FREE_GIVEAWAY;
      }

      const locType = data.location_type || (store?.description === 'Personal listings' ? 'approximate' : (store?.location_city ? 'store' : 'approximate'));
      let finalLat = userLat;
      let finalLng = userLng;
      let finalCity = [userCity, userState].filter(Boolean).join(', ') || '';

      if (locType === 'approximate') {
        const approx = getProductListingLocation({ store: { description: 'Personal listings' }, userLat, userLng });
        finalLat = approx.lat;
        finalLng = approx.lng;
      } else if (locType === 'store') {
        finalLat = store?.location_lat || userLat;
        finalLng = store?.location_lng || userLng;
        finalCity = store?.location_city || '';
      }

      const productData = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        condition: data.condition,
        category_id: finalCategoryId,
        brand: data.brand || undefined,
        color: data.color || undefined,
        quantity: 1,
        location_city: finalCity,
        location_lat: finalLat || undefined,
        location_lng: finalLng || undefined,
        status: 'available',
      };

      const response = await ProductService.create(productData);
      const product = response.data;

      if (images.length > 0 && product?.id) {
        const fd = new FormData();
        images.forEach((img) => fd.append('file', img.file, img.file.name));
        await ProductService.uploadImages(product.id, fd).catch(() =>
          toast.error('Item listed but some images failed to upload')
        );
      }
      return product;
    },
    onSuccess: (product) => {
      images.forEach((img) => revokeFilePreview(img.preview));
      toast.success('Item listed! 🛒');
      navigate(`/product/${product.id}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setFormErrors(err, setError);
    },
  });

  return (
    <div>
      <PageHeader title="Sell an Item" subtitle="Electronics, fashion, home goods & more" />

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
        {/* Photos */}
        <div className="space-y-2">
          <label className="floating-label">
            Photos ({images.length}/{MAX_PRODUCT_IMAGES})
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-purple-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {images.length < MAX_PRODUCT_IMAGES && (
              <div
                {...getRootProps()}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl transition-all hover:border-purple-500"
                style={{
                  border: `2px dashed ${isDragActive ? '#8B5CF6' : 'var(--color-border)'}`,
                  backgroundColor: isDragActive ? 'rgba(139,92,246,0.05)' : 'var(--color-surface)',
                }}
              >
                <input {...getInputProps()} />
                <ImagePlus size={20} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  Add
                </span>
              </div>
            )}
          </div>
        </div>

        <Input
          label="Title *"
          placeholder="What are you selling?"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Describe your item in detail — condition, included accessories, reason for selling..."
          maxLength={5000}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price *"
            type="number"
            placeholder="0.00"
            leftIcon={<span className="font-mono text-xs">$</span>}
            error={errors.price?.message}
            {...register('price')}
          />
          <Select
            label="Condition *"
            placeholder="Select condition"
            options={ITEM_CONDITIONS}
            error={errors.condition?.message}
            {...register('condition')}
          />
        </div>

        <Controller
          name="category_id"
          control={control}
          rules={{ required: 'Select a category' }}
          render={({ field }) => (
            <CategorySelector
              value={field.value}
              onChange={field.onChange}
              excludeCategoryIds={[CATEGORY_IDS.VEHICLES, CATEGORY_IDS.REAL_ESTATE]}
              error={errors.category_id?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Brand (Optional)" placeholder="Apple, Nike..." {...register('brand')} />
          <Input label="Color (Optional)" placeholder="Black, White..." {...register('color')} />
        </div>

        <Controller
          name="location_type"
          control={control}
          render={({ field }) => (
            <LocationOptionSelector
              value={field.value}
              onChange={field.onChange}
              store={store}
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={createMutation.isPending}
          loadingText="Listing item..."
        >
          Publish Listing
        </Button>
      </form>
    </div>
  );
}
