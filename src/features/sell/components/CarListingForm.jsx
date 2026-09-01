import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
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
import { cn, getErrorMessage } from '@lib/utils';
import useLocationStore from '@store/location.store';
import useFormDraft from '@hooks/useFormDraft';
import { validateImageFile, createFilePreview, revokeFilePreview, getProductListingLocation } from '@utils/helpers';
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
  ITEM_CONDITIONS,
} from '@utils/constants';
import toast from '@lib/toast';
import ListingQRModal from '@components/modals/ListingQRModal';

const ACCESSORIES_IDS = [
  '6048801d-f786-5a3a-8a5b-fe09b7bc1ea7', // Vehicle Accessories (parent)
  '9f55f80f-e831-5cd5-b653-a67ccc4463be', // Wheels
  '55e88c2f-9b28-525a-bbd4-e757bf10b8e1', // Tires
  '6311a60a-3cc8-5395-89de-e6e60da32d4f', // Roof Racks
  '87eca5b1-0bcd-5034-a39b-fe9f4b3c14cd', // Towing Equipment
  'df2607bf-2ff3-5227-b20c-4f40b432806f', // Car Accessories
  '09d8dc12-1ce4-549a-8639-4392d44a4f7b', // Interior Accessories
];

export default function CarListingForm({ store }) {
  const navigate = useNavigate();
  const { lat: userLat, lng: userLng, city: userCity, state: userState } = useLocationStore();
  const [images, setImages] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [publishedProduct, setPublishedProduct] = useState(null);

  const defaultValues = useMemo(() => ({
    title: '',
    brand: '',
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
    location_city: store?.location_city || userCity || '',
    location_type: store?.description === 'Personal listings' ? 'approximate' : (store?.location_city ? 'store' : 'approximate'),
    vehicle_category: CATEGORY_IDS.AUTOMOTIVE,
  }), [store?.location_city, store?.description, userCity]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const selectedCategoryId = watch('vehicle_category');
  const isAccessories = ACCESSORIES_IDS.includes(selectedCategoryId);

  const { clearDraft } = useFormDraft('draft-car', watch, reset, defaultValues);

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
      const title = isAccessories
        ? formData.title
        : `${formData.year} ${formData.make} ${formData.model}`.trim();

      const details = isAccessories
        ? formData.description
        : [
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

      const locType = formData.location_type || (store?.description === 'Personal listings' ? 'approximate' : (store?.location_city ? 'store' : 'approximate'));
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
        title,
        description: details || '',
        price: Number(formData.price),
        condition: isAccessories
          ? formData.condition
          : (formData.condition === 'new'
              ? 'new'
              : formData.condition === 'certified_preowned'
                ? 'like_new'
                : 'good'),
        category_id: formData.vehicle_category || CATEGORY_IDS.AUTOMOTIVE,
        brand: (isAccessories ? formData.brand : formData.make) || undefined,
        color: formData.color || undefined,
        quantity: 1,
        location_city: finalCity,
        location_lat: finalLat || undefined,
        location_lng: finalLng || undefined,
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
      clearDraft();
      toast.success('Vehicle listed successfully! 🚗');
      setPublishedProduct(product);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader title="Sell Automotive" subtitle="Detailed vehicle listing" />

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

        {/* Automotive Details */}
        <div className="glass-card space-y-4 p-5">
          <h3
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            🚗 Automotive Details
          </h3>

          <Controller
            name="vehicle_category"
            control={control}
            rules={{ required: 'Select a category' }}
            render={({ field }) => (
              <CategorySelector
                value={field.value}
                onChange={field.onChange}
                rootCategoryId={CATEGORY_IDS.VEHICLES}
                error={errors.vehicle_category?.message}
              />
            )}
          />

          {isAccessories ? (
            <>
              <Input
                label="Listing Title *"
                placeholder="e.g. Michelin Pilot Sport 4 Tires (Set of 4)"
                error={errors.title?.message}
                {...register('title', { required: isAccessories ? 'Required' : false })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Brand (Optional)"
                  placeholder="e.g. Michelin, Brembo..."
                  {...register('brand')}
                />
                <Select
                  label="Condition *"
                  placeholder="Select condition"
                  options={ITEM_CONDITIONS}
                  error={errors.condition?.message}
                  {...register('condition', { required: 'Required' })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Make *"
                  placeholder="Select make"
                  options={VEHICLE_MAKES.map((m) => ({ value: m, label: m }))}
                  error={errors.make?.message}
                  {...register('make', { required: !isAccessories ? 'Required' : false })}
                />
                <Input
                  label="Model *"
                  placeholder="Camry, Civic, F-150..."
                  error={errors.model?.message}
                  {...register('model', { required: !isAccessories ? 'Required' : false })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Select
                  label="Year *"
                  placeholder="Year"
                  options={VEHICLE_YEAR_RANGE}
                  error={errors.year?.message}
                  {...register('year', { required: !isAccessories ? 'Required' : false })}
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
                  {...register('fuel_type', { required: !isAccessories ? 'Required' : false })}
                />
                <Select
                  label="Transmission *"
                  placeholder="Select"
                  options={VEHICLE_TRANSMISSIONS}
                  error={errors.transmission?.message}
                  {...register('transmission', { required: !isAccessories ? 'Required' : false })}
                />
                <Select
                  label="Body Type *"
                  placeholder="Select"
                  options={VEHICLE_BODY_TYPES}
                  error={errors.body_type?.message}
                  {...register('body_type', { required: !isAccessories ? 'Required' : false })}
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
                  {...register('title_status', { required: !isAccessories ? 'Required' : false })}
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
            </>
          )}
        </div>

        {/* Features */}
        {!isAccessories && (
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
        )}

        {/* Price & Location */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            💰 Price & Location
          </h3>
          <div className={cn("grid gap-3", !isAccessories ? "grid-cols-2" : "grid-cols-1")}>
            <Controller
              name="price"
              control={control}
              rules={{ required: 'Required' }}
              render={({ field: { onChange, value, ref } }) => (
                <Input
                  label="Asking Price *"
                  type="text"
                  placeholder="e.g. 250"
                  leftIcon={<span className="font-mono text-xs font-bold">$</span>}
                  error={errors.price?.message}
                  value={value ? new Intl.NumberFormat('en-US').format(value) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    onChange(raw);
                  }}
                  ref={ref}
                />
              )}
            />
            {!isAccessories && (
              <Input
                label="Title / Registration State"
                placeholder="California"
                {...register('registration_state')}
              />
            )}
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
        </div>

        {/* Description */}
        <Textarea
          label="Description / Additional Notes (Optional)"
          placeholder={isAccessories ? "Describe the item, condition, fitment, or compatibility..." : "Any additional details about the vehicle..."}
          maxLength={5000}
          {...register('description')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={createMutation.isPending}
          loadingText="Publishing listing..."
        >
          {isAccessories ? 'Publish Accessory Listing' : 'Publish Automotive Listing'}
        </Button>
      </form>

      <ListingQRModal
        isOpen={!!publishedProduct}
        onClose={() => {
          const pId = publishedProduct?.id;
          setPublishedProduct(null);
          if (pId) {
            navigate(`/product/${pId}`);
          }
        }}
        product={publishedProduct}
      />
    </div>
  );
}
