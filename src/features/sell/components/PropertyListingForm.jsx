import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import PageHeader from '@components/common/PageHeader';
import { getErrorMessage } from '@lib/utils';
import useLocationStore from '@store/location.store';
import { validateImageFile, createFilePreview, revokeFilePreview } from '@utils/helpers';
import {
  REAL_ESTATE_TYPES,
  REAL_ESTATE_PURPOSE,
  AREA_UNITS,
  FURNISHING_OPTIONS,
  LEASE_TERMS,
  PET_POLICY,
  REAL_ESTATE_FEATURES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  MAX_PRODUCT_IMAGES,
  CATEGORY_IDS,
} from '@utils/constants';
import toast from '@lib/toast';

export default function PropertyListingForm({ store }) {
  const { lat: userLat, lng: userLng } = useLocationStore();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const { data: allCategories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const realEstateCategories = allCategories.filter((c) => {
    if (c.id === CATEGORY_IDS.PROPERTY) return true;
    if (c.parent_id === CATEGORY_IDS.PROPERTY) return true;
    return false;
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      property_type: '',
      purpose: '',
      area_size: '',
      area_unit: 'sqft',
      bedrooms: '',
      bathrooms: '',
      floor: '',
      total_floors: '',
      furnishing: '',
      construction_year: '',
      parking_spaces: '',
      hoa_fees: '',
      lease_term: '',
      pet_policy: '',
      mls_id: '',
      address: '',
      city: store?.location_city || '',
      state: '',
      zip_code: '',
      price: '',
      description: '',
      property_category: CATEGORY_IDS.PROPERTY,
    },
  });

  const purpose = watch('purpose');

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

  const toggleFeature = (key) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const propType = REAL_ESTATE_TYPES.find((t) => t.value === formData.property_type);
      const purposeLabel = formData.purpose === 'rent' ? 'For Rent' : 'For Sale';
      const bedsLabel = formData.bedrooms ? `${formData.bedrooms}` : '';
      const bathsLabel = formData.bathrooms ? ` / ${formData.bathrooms}` : '';
      const title =
        `${propType?.label || 'Property'} ${purposeLabel} — ${bedsLabel}${bathsLabel} ${formData.area_size ? formData.area_size + ' ' + formData.area_unit : ''}`.trim();

      const details = [
        `Type: ${propType?.label}`,
        `Listing: ${purposeLabel}`,
        formData.area_size &&
          `Size: ${formData.area_size} ${AREA_UNITS.find((u) => u.value === formData.area_unit)?.label || formData.area_unit}`,
        formData.bedrooms && `Beds: ${formData.bedrooms}`,
        formData.bathrooms && `Baths: ${formData.bathrooms}`,
        formData.floor &&
          `Floor: ${formData.floor}${formData.total_floors ? ` of ${formData.total_floors}` : ''}`,
        formData.furnishing &&
          `Furnishing: ${FURNISHING_OPTIONS.find((f) => f.value === formData.furnishing)?.label}`,
        formData.construction_year && `Year Built: ${formData.construction_year}`,
        formData.parking_spaces && `Parking: ${formData.parking_spaces} spaces`,
        formData.hoa_fees && `HOA Fees: $${formData.hoa_fees}/month`,
        formData.lease_term &&
          `Lease: ${LEASE_TERMS.find((l) => l.value === formData.lease_term)?.label}`,
        formData.pet_policy &&
          `Pets: ${PET_POLICY.find((p) => p.value === formData.pet_policy)?.label}`,
        formData.mls_id && `MLS ID: ${formData.mls_id}`,
        formData.address && `Address: ${formData.address}`,
        formData.city && `City: ${formData.city}`,
        formData.state && `State: ${formData.state}`,
        formData.zip_code && `ZIP: ${formData.zip_code}`,
        selectedFeatures.length > 0 &&
          `\nFeatures: ${selectedFeatures
            .map((k) => REAL_ESTATE_FEATURES.find((f) => f.key === k)?.label)
            .filter(Boolean)
            .join(', ')}`,
        formData.description && `\n${formData.description}`,
      ]
        .filter(Boolean)
        .join('\n');

      const locationParts = [formData.city, formData.state].filter(Boolean).join(', ');

      const productData = {
        title,
        description: details,
        price: Number(formData.price),
        condition: 'good',
        category_id: formData.property_category || CATEGORY_IDS.PROPERTY,
        location_city: locationParts || formData.city,
        location_lat: userLat || undefined,
        location_lng: userLng || undefined,
        quantity: 1,
        status: 'available',
        currency: 'USD',
      };

      const response = await ProductService.create(productData);
      const product = response.data;

      if (images.length > 0 && product?.id) {
        const fd = new FormData();
        images.forEach((img) => fd.append('file', img.file, img.file.name));
        await ProductService.uploadImages(product.id, fd).catch(() =>
          toast.error('Listed but some images failed to upload')
        );
      }
      return product;
    },
    onSuccess: (product) => {
      images.forEach((img) => revokeFilePreview(img.preview));
      toast.success('Property listed! 🏠');
      navigate(`/product/${product.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader title="List Real Estate" subtitle="Homes, apartments & commercial" />

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
                  <span className="absolute bottom-1 left-1 rounded bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {images.length < MAX_PRODUCT_IMAGES && (
              <div
                {...getRootProps()}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl"
                style={{
                  border: `2px dashed ${isDragActive ? '#10B981' : 'var(--color-border)'}`,
                  backgroundColor: isDragActive ? 'rgba(16,185,129,0.05)' : 'var(--color-surface)',
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

        {/* Property Details */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            🏠 Property Details
          </h3>

          <Select
            label="Property Category *"
            placeholder="Select category"
            options={realEstateCategories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.property_category?.message}
            {...register('property_category', { required: 'Select a category' })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Property Type *"
              placeholder="Select"
              options={REAL_ESTATE_TYPES}
              error={errors.property_type?.message}
              {...register('property_type', { required: 'Required' })}
            />
            <Select
              label="Listing Type *"
              placeholder="For Sale or Rent"
              options={REAL_ESTATE_PURPOSE}
              error={errors.purpose?.message}
              {...register('purpose', { required: 'Required' })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Size *"
              type="number"
              placeholder="1500"
              error={errors.area_size?.message}
              {...register('area_size', { required: 'Required' })}
            />
            <Select label="Unit" options={AREA_UNITS} {...register('area_unit')} />
            <Select
              label="Furnishing"
              placeholder="Select"
              options={FURNISHING_OPTIONS}
              {...register('furnishing')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Select
              label="Beds"
              placeholder="-"
              options={BEDROOM_OPTIONS}
              {...register('bedrooms')}
            />
            <Select
              label="Baths"
              placeholder="-"
              options={BATHROOM_OPTIONS}
              {...register('bathrooms')}
            />
            <Input label="Floor" type="number" placeholder="3" {...register('floor')} />
            <Input
              label="Total Floors"
              type="number"
              placeholder="10"
              {...register('total_floors')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Input
              label="Year Built"
              type="number"
              placeholder="2020"
              {...register('construction_year')}
            />
            <Input
              label="Parking Spaces"
              type="number"
              placeholder="2"
              {...register('parking_spaces')}
            />
            <Input
              label="HOA Fees ($/month)"
              type="number"
              placeholder="350"
              {...register('hoa_fees')}
            />
          </div>

          {/* Rental-specific fields */}
          {purpose === 'rent' && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Lease Term"
                placeholder="Select"
                options={LEASE_TERMS}
                {...register('lease_term')}
              />
              <Select
                label="Pet Policy"
                placeholder="Select"
                options={PET_POLICY}
                {...register('pet_policy')}
              />
            </div>
          )}

          <Input
            label="MLS ID (Optional)"
            placeholder="A12345678"
            hint="For licensed agents and brokers"
            {...register('mls_id')}
          />
        </div>

        {/* Features */}
        <div className="glass-card space-y-3 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            ✨ Features & Amenities
          </h3>
          <div className="flex flex-wrap gap-2">
            {REAL_ESTATE_FEATURES.map((f) => {
              const sel = selectedFeatures.includes(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFeature(f.key)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: sel
                      ? 'rgba(16,185,129,0.15)'
                      : 'var(--color-surface-elevated)',
                    border: `1px solid ${sel ? '#10B981' : 'var(--color-border)'}`,
                    color: sel ? '#10B981' : 'var(--color-text-secondary)',
                  }}
                >
                  {f.emoji} {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price & Location */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            💰 Price & Location
          </h3>
          <Input
            label={purpose === 'rent' ? 'Monthly Rent *' : 'Asking Price *'}
            type="number"
            placeholder={purpose === 'rent' ? '1500' : '250000'}
            leftIcon={<span className="font-mono text-xs font-bold">$</span>}
            error={errors.price?.message}
            {...register('price', { required: 'Required' })}
          />
          <Input label="Street Address" placeholder="123 Main Street" {...register('address')} />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City *"
              placeholder="Austin"
              error={errors.city?.message}
              {...register('city', { required: 'Required' })}
            />
            <Input label="State" placeholder="TX" {...register('state')} />
            <Input label="ZIP Code" placeholder="73301" {...register('zip_code')} />
          </div>
        </div>

        <Textarea
          label="Additional Description"
          placeholder="Additional details about the property..."
          maxLength={5000}
          {...register('description')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={createMutation.isPending}
          loadingText="Listing property..."
        >
          Publish Listing
        </Button>
      </form>
    </div>
  );
}
