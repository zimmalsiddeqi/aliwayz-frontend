import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ImagePlus, X, ArrowLeft, Crosshair, MapPin, Compass } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ProductService from '@api/services/product.service';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import PageHeader from '@components/common/PageHeader';
import { getErrorMessage } from '@lib/utils';
import useLocationStore from '@store/location.store';
import useFormDraft from '@hooks/useFormDraft';
import { validateImageFile, createFilePreview, revokeFilePreview, getProductListingLocation } from '@utils/helpers';
import {
  REAL_ESTATE_TYPES,
  REAL_ESTATE_FEATURES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  MAX_PRODUCT_IMAGES,
  CATEGORY_IDS,
} from '@utils/constants';
import toast from '@lib/toast';

export default function PropertyListingForm({ store, intent = 'sale', propertyType = 'single_family', onBack }) {
  const { lat: userLat, lng: userLng, city: userCity, state: userState } = useLocationStore();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const isLand = propertyType === 'land';

  const defaultValues = useMemo(() => ({
    property_type: propertyType,
    purpose: intent,
    area_size: '',
    bedrooms: '',
    bathrooms: '',
    furnishing: 'unfurnished',
    construction_year: '',
    parking_spaces: '',
    
    // Sell fields
    hoa_fees: '',
    property_taxes: '',
    special_assessment: '',
    
    // Rent fields
    lease_term: '12_months',
    pet_policy: 'no_pets',
    available_date: '',
    security_deposit: '',
    application_fee: '',
    utilities_included: [], // Array for checkboxes
    income_requirement: '',
    credit_requirement: '',
    smoking_policy: 'no_smoking',
    
    // Commercial fields
    lease_price_type: 'month',
    available_space: '',
    cam_nnn: '',
    build_out_allowance: '',
    min_lease_term: '3',
    max_lease_term: '10',
    building_size: '',
    ceiling_height: '',
    loading_dock: 'No',
    zoning: '',
    hvac: '',
    utilities: '',
    restrooms: '1',
    signage: 'Yes',
    accessibility: 'Yes',
    renewal_options: '',
    tenant_improvements: '',
    
    // Vacation fields
    min_stay: '2',
    max_guests: '4',
    check_in_time: '3:00 PM',
    check_out_time: '11:00 AM',
    weekend_rate: '',
    cleaning_fee: '',
    additional_guest_fee: '',

    // Shared location & base fields
    address: '',
    city: store?.location_city || userCity || '',
    state: userState || '',
    zip_code: '',
    price: '',
    description: '',
    location_type: intent === 'lease' ? 'exact' : 'approximate', // Commercial default to exact
    
    // Land fields
    acreage: '',
    lot_size: '',
    road_access: 'paved',
    water: 'available',
    sewer: 'available',
    electricity: 'available',
    agricultural_use: 'No',
    development_potential: 'Yes',
  }), [propertyType, intent, store?.location_city, userCity, userState]);

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

  const { clearDraft } = useFormDraft(`draft-property-${intent}-${propertyType}`, watch, reset, defaultValues);

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
      const propType = REAL_ESTATE_TYPES.find((t) => t.value === propertyType);
      
      let purposeLabel = '';
      if (intent === 'sale') purposeLabel = 'For Sale';
      else if (intent === 'rent') purposeLabel = 'For Rent';
      else if (intent === 'lease') purposeLabel = 'For Lease';
      else if (intent === 'vacation') purposeLabel = 'Vacation Rental';

      // Title Generation
      let title = '';
      if (isLand) {
        const acreageStr = formData.acreage ? `${formData.acreage} Acre ` : '';
        title = `${acreageStr}Land ${purposeLabel} in ${formData.city}`;
      } else if (intent === 'vacation') {
        title = `${formData.bedrooms ? formData.bedrooms + ' Bed ' : ''}${propType?.label || 'Property'} Vacation Rental in ${formData.city}`;
      } else if (intent === 'lease') {
        title = `${formData.area_size ? formData.area_size + ' SF ' : ''}${propType?.label || 'Commercial Space'} ${purposeLabel} in ${formData.city}`;
      } else {
        const bedsLabel = formData.bedrooms ? `${formData.bedrooms} Bd` : '';
        const bathsLabel = formData.bathrooms ? ` / ${formData.bathrooms} Ba` : '';
        title = `${propType?.label || 'Property'} ${purposeLabel} — ${bedsLabel}${bathsLabel} in ${formData.city}`;
      }

      // Compile Details
      const details = [];
      details.push(`[Intent]: ${intent}`);
      details.push(`[Property_Type]: ${propertyType}`);

      if (isLand) {
        if (formData.acreage) details.push(`Acreage: ${formData.acreage} acres`);
        if (formData.lot_size) details.push(`Lot Size: ${formData.lot_size}`);
        if (formData.zoning) details.push(`Zoning: ${formData.zoning}`);
        if (formData.road_access) details.push(`Road Access: ${formData.road_access}`);
        if (formData.water) details.push(`Water: ${formData.water}`);
        if (formData.sewer) details.push(`Sewer: ${formData.sewer}`);
        if (formData.electricity) details.push(`Electricity: ${formData.electricity}`);
        if (formData.agricultural_use) details.push(`Agricultural Use: ${formData.agricultural_use}`);
        if (formData.development_potential) details.push(`Development Potential: ${formData.development_potential}`);
      } else {
        if (intent === 'rent') {
          if (formData.security_deposit) details.push(`Security Deposit: $${formData.security_deposit}`);
          if (formData.application_fee) details.push(`Application Fee: $${formData.application_fee}`);
          if (formData.available_date) details.push(`Available Date: ${formData.available_date}`);
          if (formData.lease_term) details.push(`Lease Term: ${formData.lease_term}`);
          if (formData.bedrooms) details.push(`Bedrooms: ${formData.bedrooms}`);
          if (formData.bathrooms) details.push(`Bathrooms: ${formData.bathrooms}`);
          if (formData.area_size) details.push(`Size: ${formData.area_size} sqft`);
          if (formData.income_requirement) details.push(`Income Requirement: ${formData.income_requirement}`);
          if (formData.credit_requirement) details.push(`Credit Requirement: ${formData.credit_requirement}`);
          if (formData.pet_policy) details.push(`Pet Policy: ${formData.pet_policy}`);
          if (formData.smoking_policy) details.push(`Smoking: ${formData.smoking_policy}`);
          if (formData.utilities_included && formData.utilities_included.length > 0) {
            details.push(`Utilities Included: ${formData.utilities_included.join(', ')}`);
          }
        } else if (intent === 'lease') {
          if (formData.lease_price_type) details.push(`Pricing Type: ${formData.lease_price_type}`);
          if (formData.available_space) details.push(`Available Space: ${formData.available_space} sqft`);
          if (formData.min_lease_term) details.push(`Min Lease Term: ${formData.min_lease_term} years`);
          if (formData.max_lease_term) details.push(`Max Lease Term: ${formData.max_lease_term} years`);
          if (formData.available_date) details.push(`Available Date: ${formData.available_date}`);
          if (formData.building_size) details.push(`Building Size: ${formData.building_size} sqft`);
          if (formData.ceiling_height) details.push(`Ceiling Height: ${formData.ceiling_height} ft`);
          if (formData.parking_spaces) details.push(`Parking Spaces: ${formData.parking_spaces}`);
          if (formData.loading_dock) details.push(`Loading Dock: ${formData.loading_dock}`);
          if (formData.zoning) details.push(`Zoning: ${formData.zoning}`);
          if (formData.hvac) details.push(`HVAC: ${formData.hvac}`);
          if (formData.utilities) details.push(`Utilities: ${formData.utilities}`);
          if (formData.restrooms) details.push(`Restrooms: ${formData.restrooms}`);
          if (formData.signage) details.push(`Signage: ${formData.signage}`);
          if (formData.accessibility) details.push(`Accessibility: ${formData.accessibility}`);
          if (formData.cam_nnn) details.push(`CAM/NNN: ${formData.cam_nnn}`);
          if (formData.build_out_allowance) details.push(`Build-out Allowance: ${formData.build_out_allowance}`);
          if (formData.renewal_options) details.push(`Renewal Options: ${formData.renewal_options}`);
          if (formData.tenant_improvements) details.push(`Tenant Improvements: ${formData.tenant_improvements}`);
        } else if (intent === 'vacation') {
          if (formData.weekend_rate) details.push(`Weekend Rate: $${formData.weekend_rate}`);
          if (formData.cleaning_fee) details.push(`Cleaning Fee: $${formData.cleaning_fee}`);
          if (formData.security_deposit) details.push(`Security Deposit: $${formData.security_deposit}`);
          if (formData.additional_guest_fee) details.push(`Additional Guest Fee: $${formData.additional_guest_fee}`);
          if (formData.min_stay) details.push(`Min Stay: ${formData.min_stay} nights`);
          if (formData.max_guests) details.push(`Max Guests: ${formData.max_guests}`);
          if (formData.bedrooms) details.push(`Bedrooms: ${formData.bedrooms}`);
          if (formData.bathrooms) details.push(`Bathrooms: ${formData.bathrooms}`);
          if (formData.check_in_time) details.push(`Check-In: ${formData.check_in_time}`);
          if (formData.check_out_time) details.push(`Check-Out: ${formData.check_out_time}`);
        } else {
          // Sale
          if (formData.bedrooms) details.push(`Bedrooms: ${formData.bedrooms}`);
          if (formData.bathrooms) details.push(`Bathrooms: ${formData.bathrooms}`);
          if (formData.area_size) details.push(`Size: ${formData.area_size} sqft`);
          if (formData.lot_size) details.push(`Lot Size: ${formData.lot_size}`);
          if (formData.construction_year) details.push(`Year Built: ${formData.construction_year}`);
          if (formData.parking_spaces) details.push(`Parking Spaces: ${formData.parking_spaces}`);
          if (formData.hoa_fees) details.push(`HOA Fees: $${formData.hoa_fees}/month`);
          if (formData.property_taxes) details.push(`Property Taxes: $${formData.property_taxes}/year`);
          if (formData.special_assessment) details.push(`Special Assessment: $${formData.special_assessment}`);
        }
      }

      if (selectedFeatures.length > 0) {
        details.push(`Features: ${selectedFeatures
          .map((k) => REAL_ESTATE_FEATURES.find((f) => f.key === k)?.label)
          .filter(Boolean)
          .join(', ')}`);
      }

      if (formData.description) {
        details.push(`\nDescription:\n${formData.description}`);
      }

      // Store exact location parameters privately in description
      details.push(`\n[Private_Address]: ${formData.address || ''}`);
      details.push(`[Private_Lat]: ${userLat || ''}`);
      details.push(`[Private_Lng]: ${userLng || ''}`);
      details.push(`[Address_Visibility]: ${formData.location_type || 'approximate'}`);

      // Dynamic Location Calculation
      let finalLat = userLat;
      let finalLng = userLng;
      if (formData.location_type === 'approximate') {
        const approx = getProductListingLocation({ store: { description: 'Personal listings' }, userLat, userLng });
        finalLat = approx.lat;
        finalLng = approx.lng;
      }

      const productData = {
        title,
        description: details.join('\n'),
        price: Number(formData.price),
        condition: 'good',
        category_id: CATEGORY_IDS.PROPERTY,
        location_city: [formData.city, formData.state].filter(Boolean).join(', ') || '',
        location_lat: finalLat || undefined,
        location_lng: finalLng || undefined,
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
      clearDraft();
      toast.success('Property listed successfully! 🏠');
      navigate(`/product/${product.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title={onBack ? "Property Listing Form" : "Sell Real Estate"}
        subtitle="Specify details about the property"
        showBack={!!onBack}
        onBack={onBack}
      />

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

        
        {/* ─────────────────────────────────────────────────────────
            1. 💰 PRICING ENGINE
        ────────────────────────────────────────────────────────── */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            💰 Pricing
          </h3>

          {intent === 'sale' && (
            <div className="space-y-4">
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field: { onChange, value, ref } }) => (
                  <Input label="Asking Price *" type="text" placeholder="e.g. 425,000" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )}
              />
              <div className="grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Controller name="hoa_fees" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="HOA fee (/month)" type="text" placeholder="e.g. 250" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
                <Controller name="property_taxes" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Property taxes (/year)" type="text" placeholder="e.g. 4,800" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
                <Controller name="special_assessment" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Special assessment" type="text" placeholder="e.g. 0" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
              </div>
            </div>
          )}

          {intent === 'rent' && (
            <div className="space-y-4">
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field: { onChange, value, ref } }) => (
                  <Input label="Monthly Rent *" type="text" placeholder="e.g. 2,400" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )}
              />
              <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Controller name="security_deposit" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Security deposit" type="text" placeholder="e.g. 2,400" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
                <Controller name="application_fee" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Application fee" type="text" placeholder="e.g. 50" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Input label="Lease term" placeholder="e.g. 12 months" {...register('lease_term')} />
                <Input label="Available date" type="date" {...register('available_date')} />
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Utilities Included</label>
                <div className="flex flex-wrap gap-4">
                  {['Water', 'Electricity', 'Gas', 'Internet', 'Trash'].map((util) => (
                    <label key={util} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" value={util} className="rounded border-[var(--color-border)] text-brand-500 focus:ring-brand-500" {...register('utilities_included')} />
                      <span className="text-sm">{util}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {intent === 'lease' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Lease rate type</label>
                <div className="flex gap-4">
                  {[
                    { value: 'sqft_year', label: '$/SF/year' },
                    { value: 'month', label: '$/month' },
                    { value: 'contact', label: 'Contact for pricing' }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={opt.value} className="text-brand-500 focus:ring-brand-500" {...register('lease_price_type')} />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field: { onChange, value, ref } }) => (
                    <Input label="Lease rate *" type="text" placeholder="e.g. 28" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                  )}
                />
                <Input label="Available space (SF) *" type="number" placeholder="2500" error={errors.available_space?.message} {...register('available_space', { required: 'Required' })} />
              </div>
              
              {watch('lease_price_type') === 'sqft_year' && watch('price') && watch('available_space') && (
                <div className="bg-[var(--color-surface-elevated)] p-3 rounded-xl border border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Estimated monthly rent: <span className="font-bold text-[var(--color-text-primary)]">${new Intl.NumberFormat('en-US').format(Math.round((Number(watch('price')) * Number(watch('available_space'))) / 12))}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Input label="CAM charges / NNN" placeholder="e.g. $5 / SF" {...register('cam_nnn')} />
                <Controller name="build_out_allowance" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Build-out allowance" type="text" placeholder="e.g. 10,000" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
              </div>
            </div>
          )}

          {intent === 'vacation' && (
            <div className="space-y-4">
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field: { onChange, value, ref } }) => (
                  <Input label="Nightly rate *" type="text" placeholder="e.g. 350" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )}
              />
              <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Controller name="weekend_rate" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Weekend rate" type="text" placeholder="e.g. 400" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
                <Controller name="cleaning_fee" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Cleaning fee" type="text" placeholder="e.g. 100" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
                <Controller name="security_deposit" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Security deposit" type="text" placeholder="e.g. 250" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
                <Controller name="additional_guest_fee" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Additional guest fee" type="text" placeholder="e.g. 25" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} ref={ref} />
                )} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Input label="Min stay (nights)" type="number" placeholder="2" {...register('min_stay')} />
                <Input label="Max stay (nights)" type="number" placeholder="30" {...register('max_guests')} />
                <Input label="Available from" type="date" {...register('available_date')} />
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────
            2. PROPERTY DETAILS (Non-financial)
        ────────────────────────────────────────────────────────── */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            🏠 Property Details
          </h3>

          {isLand ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Acreage *" type="number" step="0.01" placeholder="2.5" error={errors.acreage?.message} {...register('acreage', { required: 'Required' })} />
                <Input label="Lot Size" placeholder="e.g. 100 x 250 ft" {...register('lot_size')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Zoning" placeholder="e.g. Residential, Commercial" {...register('zoning')} />
                <Select label="Road Access" options={[{ value: 'paved', label: 'Paved Road' }, { value: 'dirt', label: 'Dirt Road' }, { value: 'none', label: 'No Access' }]} {...register('road_access')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Select label="Water" options={[{ value: 'available', label: 'Available' }, { value: 'none', label: 'None' }]} {...register('water')} />
                <Select label="Sewer" options={[{ value: 'available', label: 'Available' }, { value: 'none', label: 'None' }]} {...register('sewer')} />
                <Select label="Electricity" options={[{ value: 'available', label: 'Available' }, { value: 'none', label: 'None' }]} {...register('electricity')} />
              </div>
            </div>
          ) : intent === 'lease' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input label="Building Size (SF)" type="number" placeholder="10000" {...register('building_size')} />
                <Input label="Ceiling Height (ft)" type="number" placeholder="18" {...register('ceiling_height')} />
                <Select label="Loading Dock" options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} {...register('loading_dock')} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <Input label="Zoning Code" placeholder="e.g. CMX-2" {...register('zoning')} />
                <Input label="Parking Spaces" type="number" placeholder="15" {...register('parking_spaces')} />
                <Input label="HVAC System" placeholder="e.g. Central Air" {...register('hvac')} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Bedrooms" options={BEDROOM_OPTIONS} {...register('bedrooms')} />
                <Select label="Bathrooms" options={BATHROOM_OPTIONS} {...register('bathrooms')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Square Feet" type="number" placeholder="1500" {...register('area_size')} />
                {intent === 'sale' && <Input label="Year Built" type="number" placeholder="2018" {...register('construction_year')} />}
                {intent === 'rent' && <Select label="Pet Policy" options={[{ value: 'negotiable', label: 'Negotiable' }, { value: 'dogs_cats', label: 'Dogs & Cats Allowed' }, { value: 'no_pets', label: 'No Pets Allowed' }]} {...register('pet_policy')} />}
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────
            3. FEATURES
        ────────────────────────────────────────────────────────── */}
        {!isLand && (
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
                      backgroundColor: sel ? 'rgba(16,185,129,0.15)' : 'var(--color-surface-elevated)',
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
        )}

        {/* ─────────────────────────────────────────────────────────
            4. 📍 PROPERTY LOCATION
        ────────────────────────────────────────────────────────── */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            📍 Property Location
          </h3>
          
          <Input
            label="Property Address *"
            placeholder="e.g. 123 Main St, Philadelphia, PA"
            hint="Your full address is securely stored and used to verify the listing."
            error={errors.address?.message}
            {...register('address', { required: 'Required' })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="City *" placeholder="Philadelphia" error={errors.city?.message} {...register('city', { required: 'Required' })} />
            <Input label="State *" placeholder="PA" error={errors.state?.message} {...register('state', { required: 'Required' })} />
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--color-border)] mt-2">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)]">What should buyers see?</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="approximate"
                  className="mt-1 text-brand-500 focus:ring-brand-500"
                  {...register('location_type')}
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Approximate location</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Show neighborhood/area only</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="exact"
                  className="mt-1 text-brand-500 focus:ring-brand-500"
                  {...register('location_type')}
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Exact location</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Show the property’s exact location</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────
            SUBMIT
        ────────────────────────────────────────────────────────── */}
        <div className="pt-4 flex gap-3">
          <Button type="submit" className="w-full" isLoading={createMutation.isPending}>
            Publish Listing
          </Button>
        </div>
      </form>
    </div>
  );
}
