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
  VEHICLE_MAKES,
  VEHICLE_BODY_TYPES,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_DRIVETRAINS,
  VEHICLE_TITLE_STATUS,
  VEHICLE_SELLER_TYPE,
  VEHICLE_CONDITIONS,
  VEHICLE_FEATURES,
  VEHICLE_YEAR_RANGE,
  MAX_PRODUCT_IMAGES,
  CATEGORY_IDS,
} from '@utils/constants';
import toast from '@lib/toast';

export default function CarListingForm({ store }) {
  const navigate = useNavigate();
  const { lat: userLat, lng: userLng } = useLocationStore();
  const [images, setImages] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const { data: allCategories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const vehicleCategories = allCategories.filter((c) => {
    if (c.id === CATEGORY_IDS.AUTOMOTIVE) return true;
    if (c.parent_id === CATEGORY_IDS.AUTOMOTIVE) return true;
    return false;
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      make: '',
      model: '',
      year: '',
      mileage: '',
      fuel_type: '',
      transmission: '',
      drivetrain: '',
      body_type: '',
      engine_size: '',
      color: '',
      num_owners: '1',
      condition: '',
      title_status: '',
      seller_type: '',
      vin: '',
      registration_state: '',
      price: '',
      description: '',
      location_city: store?.location_city || '',
      vehicle_category: CATEGORY_IDS.AUTOMOTIVE,
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

  const toggleFeature = (key) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const title = `${formData.year} ${formData.make} ${formData.model}`.trim();

      const details = [
        `Make: ${formData.make}`,
        `Model: ${formData.model}`,
        `Year: ${formData.year}`,
        formData.mileage && `Mileage: ${formData.mileage} miles`,
        `Fuel: ${VEHICLE_FUEL_TYPES.find((f) => f.value === formData.fuel_type)?.label || formData.fuel_type}`,
        `Transmission: ${VEHICLE_TRANSMISSIONS.find((t) => t.value === formData.transmission)?.label || formData.transmission}`,
        formData.drivetrain &&
          `Drivetrain: ${VEHICLE_DRIVETRAINS.find((d) => d.value === formData.drivetrain)?.label || formData.drivetrain}`,
        `Body: ${VEHICLE_BODY_TYPES.find((b) => b.value === formData.body_type)?.label || formData.body_type}`,
        formData.engine_size && `Engine: ${formData.engine_size}L`,
        formData.color && `Color: ${formData.color}`,
        `Previous Owners: ${formData.num_owners}`,
        formData.title_status &&
          `Title Status: ${VEHICLE_TITLE_STATUS.find((t) => t.value === formData.title_status)?.label || formData.title_status}`,
        formData.seller_type &&
          `Seller: ${VEHICLE_SELLER_TYPE.find((s) => s.value === formData.seller_type)?.label || formData.seller_type}`,
        formData.vin && `VIN: ${formData.vin}`,
        formData.registration_state && `Registration: ${formData.registration_state}`,
        selectedFeatures.length > 0 &&
          `\nFeatures: ${selectedFeatures
            .map((k) => VEHICLE_FEATURES.find((f) => f.key === k)?.label)
            .filter(Boolean)
            .join(', ')}`,
        formData.description && `\n${formData.description}`,
      ]
        .filter(Boolean)
        .join('\n');

      const productData = {
        title,
        description: details,
        price: Number(formData.price),
        condition:
          formData.condition === 'new'
            ? 'new'
            : formData.condition === 'certified_preowned'
              ? 'like_new'
              : 'good',
        category_id: formData.vehicle_category || CATEGORY_IDS.AUTOMOTIVE,
        brand: formData.make,
        color: formData.color || undefined,
        quantity: 1,
        location_city: formData.location_city,
        location_lat: userLat || undefined,
        location_lng: userLng || undefined,
        status: 'available',
        currency: 'USD',
      };

      const response = await ProductService.create(productData);
      const product = response.data;

      if (images.length > 0 && product?.id) {
        const fd = new FormData();
        images.forEach((img) => fd.append('file', img.file, img.file.name));
        await ProductService.uploadImages(product.id, fd).catch(() =>
          toast.error('Vehicle listed but some images failed to upload')
        );
      }

      return product;
    },
    onSuccess: (product) => {
      images.forEach((img) => revokeFilePreview(img.preview));
      toast.success('Vehicle listed! 🚗');
      navigate(`/product/${product.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader title="Sell a Vehicle" subtitle="Detailed vehicle listing" />

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
                  <span className="absolute bottom-1 left-1 rounded bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {images.length < MAX_PRODUCT_IMAGES && (
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
                  Add
                </span>
              </div>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Add exterior, interior, engine, and dashboard photos
          </p>
        </div>

        {/* Vehicle Details */}
        <div className="glass-card space-y-4 p-5">
          <h3
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            🚗 Vehicle Details
          </h3>

          <Select
            label="Vehicle Category *"
            placeholder="Select category"
            options={vehicleCategories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.vehicle_category?.message}
            {...register('vehicle_category', { required: 'Select a category' })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Make *"
              placeholder="Select make"
              options={VEHICLE_MAKES.map((m) => ({ value: m, label: m }))}
              error={errors.make?.message}
              {...register('make', { required: 'Required' })}
            />
            <Input
              label="Model *"
              placeholder="Camry, Civic, F-150..."
              error={errors.model?.message}
              {...register('model', { required: 'Required' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Select
              label="Year *"
              placeholder="Year"
              options={VEHICLE_YEAR_RANGE}
              error={errors.year?.message}
              {...register('year', { required: 'Required' })}
            />
            <Input
              label="Mileage (miles)"
              type="number"
              placeholder="45000"
              {...register('mileage')}
            />
            <Input
              label="Engine Size (L)"
              type="number"
              placeholder="2.0"
              step="0.1"
              {...register('engine_size')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Select
              label="Fuel Type *"
              placeholder="Select"
              options={VEHICLE_FUEL_TYPES}
              error={errors.fuel_type?.message}
              {...register('fuel_type', { required: 'Required' })}
            />
            <Select
              label="Transmission *"
              placeholder="Select"
              options={VEHICLE_TRANSMISSIONS}
              error={errors.transmission?.message}
              {...register('transmission', { required: 'Required' })}
            />
            <Select
              label="Body Type *"
              placeholder="Select"
              options={VEHICLE_BODY_TYPES}
              error={errors.body_type?.message}
              {...register('body_type', { required: 'Required' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Select
              label="Drivetrain"
              placeholder="Select"
              options={VEHICLE_DRIVETRAINS}
              {...register('drivetrain')}
            />
            <Input label="Color" placeholder="White" {...register('color')} />
            <Input
              label="Previous Owners"
              type="number"
              placeholder="1"
              {...register('num_owners')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Select
              label="Condition *"
              placeholder="Select"
              options={VEHICLE_CONDITIONS}
              error={errors.condition?.message}
              {...register('condition', { required: 'Required' })}
            />
            <Select
              label="Title Status *"
              placeholder="Select"
              options={VEHICLE_TITLE_STATUS}
              error={errors.title_status?.message}
              {...register('title_status', { required: 'Required' })}
            />
            <Select
              label="Seller Type"
              placeholder="Select"
              options={VEHICLE_SELLER_TYPE}
              {...register('seller_type')}
            />
          </div>

          <Input
            label="VIN (Optional)"
            placeholder="1HGCM82633A004352"
            hint="Vehicle Identification Number — helps verify vehicle specs"
            {...register('vin')}
          />
        </div>

        {/* Features */}
        <div className="glass-card space-y-3 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            ⚙️ Features & Options
          </h3>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_FEATURES.map((feature) => {
              const isSelected = selectedFeatures.includes(feature.key);
              return (
                <button
                  key={feature.key}
                  type="button"
                  onClick={() => toggleFeature(feature.key)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(59,130,246,0.15)'
                      : 'var(--color-surface-elevated)',
                    border: `1px solid ${isSelected ? '#3B82F6' : 'var(--color-border)'}`,
                    color: isSelected ? '#3B82F6' : 'var(--color-text-secondary)',
                  }}
                >
                  <span>{feature.emoji}</span> {feature.label}
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Asking Price *"
              type="number"
              placeholder="25000"
              leftIcon={<span className="font-mono text-xs font-bold">$</span>}
              error={errors.price?.message}
              {...register('price', { required: 'Required' })}
            />
            <Input
              label="Title / Registration State"
              placeholder="California"
              {...register('registration_state')}
            />
          </div>
          <Input
            label="Your Location"
            placeholder="Los Angeles, CA"
            {...register('location_city')}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Additional Notes (Optional)"
          placeholder="Any additional details about the vehicle..."
          maxLength={5000}
          {...register('description')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={createMutation.isPending}
          loadingText="Listing vehicle..."
        >
          Publish Vehicle Listing
        </Button>
      </form>
    </div>
  );
}
