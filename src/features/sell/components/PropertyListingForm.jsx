import { useState, useCallback } from 'react';
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      property_type: propertyType,
      purpose: intent,
      area_size: '',
      bedrooms: '',
      bathrooms: '',
      furnishing: 'unfurnished',
      construction_year: '',
      parking_spaces: '',
      hoa_fees: '',
      lease_term: '12_months',
      pet_policy: 'no_pets',
      address: '',
      city: store?.location_city || userCity || '',
      state: userState || '',
      zip_code: '',
      price: '',
      description: '',
      location_type: 'approximate',
      // Vacation rental fields
      min_stay: '2',
      max_guests: '4',
      check_in_time: '3:00 PM',
      check_out_time: '11:00 AM',
      // Rent fields
      security_deposit: '',
      available_date: '',
      income_requirement: '',
      credit_requirement: '',
      smoking_policy: 'no_smoking',
      utilities_included: '',
      application_fee: '',
      // Lease fields
      lease_price_type: 'month', // month, year, sqft_month, sqft_year
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
      cam_nnn: '',
      renewal_options: '',
      tenant_improvements: '',
      // Land fields
      acreage: '',
      lot_size: '',
      road_access: 'paved',
      water: 'available',
      sewer: 'available',
      electricity: 'available',
      agricultural_use: 'No',
      development_potential: 'Yes',
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
          if (formData.available_date) details.push(`Available Date: ${formData.available_date}`);
          if (formData.lease_term) details.push(`Lease Term: ${formData.lease_term}`);
          if (formData.bedrooms) details.push(`Bedrooms: ${formData.bedrooms}`);
          if (formData.bathrooms) details.push(`Bathrooms: ${formData.bathrooms}`);
          if (formData.area_size) details.push(`Size: ${formData.area_size} sqft`);
          if (formData.income_requirement) details.push(`Income Requirement: ${formData.income_requirement}`);
          if (formData.description) details.push(`Credit Requirement: ${formData.credit_requirement}`);
          if (formData.pet_policy) details.push(`Pet Policy: ${formData.pet_policy}`);
          if (formData.smoking_policy) details.push(`Smoking: ${formData.smoking_policy}`);
          if (formData.utilities_included) details.push(`Utilities Included: ${formData.utilities_included}`);
          if (formData.application_fee) details.push(`Application Fee: $${formData.application_fee}`);
        } else if (intent === 'lease') {
          if (formData.lease_price_type) details.push(`Pricing Type: ${formData.lease_price_type}`);
          if (formData.area_size) details.push(`Available Space: ${formData.area_size} sqft`);
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
          if (formData.renewal_options) details.push(`Renewal Options: ${formData.renewal_options}`);
          if (formData.tenant_improvements) details.push(`Tenant Improvements: ${formData.tenant_improvements}`);
        } else if (intent === 'vacation') {
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

        {/* Dynamic Detail Cards */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            🏠 Specifications
          </h3>

          {/* 1. LAND FLOW */}
          {isLand && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Acreage *"
                  type="number"
                  step="0.01"
                  placeholder="2.5"
                  error={errors.acreage?.message}
                  {...register('acreage', { required: 'Required' })}
                />
                <Input
                  label="Lot Size"
                  placeholder="e.g. 100 x 250 ft"
                  {...register('lot_size')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Zoning"
                  placeholder="e.g. Residential, Commercial"
                  {...register('zoning')}
                />
                <Select
                  label="Road Access"
                  options={[
                    { value: 'paved', label: 'Paved Road' },
                    { value: 'dirt', label: 'Dirt Road' },
                    { value: 'none', label: 'No Access / Landlocked' },
                  ]}
                  {...register('road_access')}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Water"
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'none', label: 'None' },
                  ]}
                  {...register('water')}
                />
                <Select
                  label="Sewer"
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'none', label: 'None' },
                  ]}
                  {...register('sewer')}
                />
                <Select
                  label="Electricity"
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'none', label: 'None' },
                  ]}
                  {...register('electricity')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Agricultural Use"
                  options={[
                    { value: 'No', label: 'No' },
                    { value: 'Yes', label: 'Yes' },
                  ]}
                  {...register('agricultural_use')}
                />
                <Select
                  label="Development Potential"
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                  ]}
                  {...register('development_potential')}
                />
              </div>
            </div>
          )}

          {/* 2. FOR SALE FLOW (non-land) */}
          {!isLand && intent === 'sale' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Bedrooms" options={BEDROOM_OPTIONS} {...register('bedrooms')} />
                <Select label="Bathrooms" options={BATHROOM_OPTIONS} {...register('bathrooms')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Square Feet *"
                  type="number"
                  placeholder="1500"
                  error={errors.area_size?.message}
                  {...register('area_size', { required: 'Required' })}
                />
                <Input label="Lot Size" placeholder="e.g. 0.25 acres" {...register('lot_size')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Year Built" type="number" placeholder="2018" {...register('construction_year')} />
                <Input label="Parking Spaces" type="number" placeholder="2" {...register('parking_spaces')} />
                <Input label="HOA Fees ($/mo)" type="number" placeholder="0" {...register('hoa_fees')} />
              </div>
            </div>
          )}

          {/* 3. FOR RENT FLOW */}
          {!isLand && intent === 'rent' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Bedrooms" options={BEDROOM_OPTIONS} {...register('bedrooms')} />
                <Select label="Bathrooms" options={BATHROOM_OPTIONS} {...register('bathrooms')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Square Feet *"
                  type="number"
                  placeholder="950"
                  error={errors.area_size?.message}
                  {...register('area_size', { required: 'Required' })}
                />
                <Input label="Security Deposit" type="number" placeholder="1850" {...register('security_deposit')} />
                <Input label="Available Date" type="date" {...register('available_date')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Lease Term"
                  options={[
                    { value: 'month_to_month', label: 'Month-to-month' },
                    { value: '3_months', label: '3 months' },
                    { value: '6_months', label: '6 months' },
                    { value: '9_months', label: '9 months' },
                    { value: '12_months', label: '12 months' },
                    { value: '12_plus_months', label: '12+ months' },
                    { value: 'flexible', label: 'Flexible' },
                  ]}
                  {...register('lease_term')}
                />
                <Select
                  label="Pet Policy"
                  options={[
                    { value: 'negotiable', label: 'Negotiable' },
                    { value: 'dogs_cats', label: 'Dogs & Cats Allowed' },
                    { value: 'no_pets', label: 'No Pets Allowed' },
                  ]}
                  {...register('pet_policy')}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-xs font-semibold mb-3 text-[var(--color-text-secondary)]">Screening & Rental Requirements</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Income Requirement" placeholder="e.g. 3x rent" {...register('income_requirement')} />
                  <Input label="Credit Requirement" placeholder="e.g. 650+ score" {...register('credit_requirement')} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Select
                    label="Smoking"
                    options={[
                      { value: 'no_smoking', label: 'No Smoking' },
                      { value: 'allowed', label: 'Allowed' },
                    ]}
                    {...register('smoking_policy')}
                  />
                  <Input label="Utilities Included" placeholder="e.g. Water, Gas" {...register('utilities_included')} />
                  <Input label="Application Fee ($)" type="number" placeholder="40" {...register('application_fee')} />
                </div>
              </div>
            </div>
          )}

          {/* 4. COMMERCIAL LEASE FLOW */}
          {!isLand && intent === 'lease' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Available Space (SF) *"
                  type="number"
                  placeholder="2500"
                  error={errors.area_size?.message}
                  {...register('area_size', { required: 'Required' })}
                />
                <Input label="Min Lease Term (Yrs)" type="number" placeholder="3" {...register('min_lease_term')} />
                <Input label="Max Lease Term (Yrs)" type="number" placeholder="10" {...register('max_lease_term')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Rate Pricing Format"
                  options={[
                    { value: 'month', label: '$/month' },
                    { value: 'year', label: '$/year' },
                    { value: 'sqft_month', label: '$/sq ft/month' },
                    { value: 'sqft_year', label: '$/sq ft/year' },
                  ]}
                  {...register('lease_price_type')}
                />
                <Input label="Available Date" type="date" {...register('available_date')} />
                <Input label="Security Deposit" type="number" placeholder="5000" {...register('security_deposit')} />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-xs font-semibold mb-3 text-[var(--color-text-secondary)]">Commercial Property Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Total Building Size (SF)" type="number" placeholder="10000" {...register('building_size')} />
                  <Input label="Ceiling Height (ft)" type="number" placeholder="18" {...register('ceiling_height')} />
                  <Select
                    label="Loading Dock"
                    options={[
                      { value: 'No', label: 'No' },
                      { value: 'Yes', label: 'Yes' },
                    ]}
                    {...register('loading_dock')}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Input label="Zoning Code" placeholder="e.g. CMX-2" {...register('zoning')} />
                  <Input label="Parking Spaces" type="number" placeholder="15" {...register('parking_spaces')} />
                  <Input label="HVAC System" placeholder="e.g. Central Air" {...register('hvac')} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Input label="Utilities Available" placeholder="e.g. 3-phase power" {...register('utilities')} />
                  <Input label="Restrooms count" type="number" placeholder="2" {...register('restrooms')} />
                  <Select
                    label="Signage Allowed"
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]}
                    {...register('signage')}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Select
                    label="Accessibility"
                    options={[
                      { value: 'Yes', label: 'ADA Compliant' },
                      { value: 'No', label: 'Standard' },
                    ]}
                    {...register('accessibility')}
                  />
                  <Input label="Base Rent Details" placeholder="e.g. NNN Lease" {...register('base_rent')} />
                  <Input label="CAM / NNN details" placeholder="e.g. $4.50 / SF" {...register('cam_nnn')} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Input label="Renewal Options" placeholder="e.g. 5-year option" {...register('renewal_options')} />
                  <Input label="Tenant Improvements" placeholder="e.g. Negotiable allowance" {...register('tenant_improvements')} />
                </div>
              </div>
            </div>
          )}

          {/* 5. VACATION RENTAL FLOW */}
          {!isLand && intent === 'vacation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Bedrooms" options={BEDROOM_OPTIONS} {...register('bedrooms')} />
                <Select label="Bathrooms" options={BATHROOM_OPTIONS} {...register('bathrooms')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Minimum Stay (nights)" type="number" placeholder="2" {...register('min_stay')} />
                <Input label="Maximum Guests" type="number" placeholder="6" {...register('max_guests')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Check-In Time" placeholder="3:00 PM" {...register('check_in_time')} />
                <Input label="Check-Out Time" placeholder="11:00 AM" {...register('check_out_time')} />
              </div>
            </div>
          )}
        </div>

        {/* Features & Amenities (non-land categories) */}
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
        )}

        {/* Price & Location Privacy Setup */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            💰 Pricing & Location Visibility
          </h3>
          
          <Input
            label={
              intent === 'rent'
                ? 'Monthly Rent *'
                : intent === 'lease'
                ? 'Lease Rate *'
                : intent === 'vacation'
                ? 'Nightly Price *'
                : 'Asking Price *'
            }
            type="number"
            placeholder="1500"
            leftIcon={<span className="font-mono text-xs font-bold">$</span>}
            error={errors.price?.message}
            {...register('price', { required: 'Required' })}
          />

          <div className="border-t pt-4 space-y-4">
            <h4 className="text-xs font-semibold text-[var(--color-text-secondary)]">📍 Property Location Setup</h4>
            
            <Input
              label="Property Address *"
              placeholder="e.g. 123 Main St, Philadelphia, PA"
              hint="This address is stored privately and will not be displayed publicly."
              error={errors.address?.message}
              {...register('address', { required: 'Required' })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City *"
                placeholder="Philadelphia"
                error={errors.city?.message}
                {...register('city', { required: 'Required' })}
              />
              <Input
                label="State *"
                placeholder="PA"
                error={errors.state?.message}
                {...register('state', { required: 'Required' })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Public Location Representation</label>
              
              <Controller
                name="location_type"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Approximate */}
                    <button
                      type="button"
                      onClick={() => field.onChange('approximate')}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200`}
                      style={{
                        backgroundColor: field.value === 'approximate' ? 'var(--color-brand-glow)' : 'var(--color-surface)',
                        borderColor: field.value === 'approximate' ? 'var(--color-brand)' : 'var(--color-border)',
                      }}
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: field.value === 'approximate' ? 'var(--color-brand)' : 'var(--color-surface-elevated)', color: field.value === 'approximate' ? '#fff' : 'var(--color-text-secondary)' }}>
                        <Compass size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Approximate location</p>
                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Show buyers the neighborhood/area only</p>
                      </div>
                    </button>

                    {/* Exact */}
                    <button
                      type="button"
                      onClick={() => field.onChange('exact')}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200`}
                      style={{
                        backgroundColor: field.value === 'exact' ? 'var(--color-brand-glow)' : 'var(--color-surface)',
                        borderColor: field.value === 'exact' ? 'var(--color-brand)' : 'var(--color-border)',
                      }}
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: field.value === 'exact' ? 'var(--color-brand)' : 'var(--color-surface-elevated)', color: field.value === 'exact' ? '#fff' : 'var(--color-text-secondary)' }}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Exact location</p>
                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Show the property’s exact location</p>
                      </div>
                    </button>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <Textarea
          label="Additional Details & Description"
          placeholder="Include features, updates, school district, or utilities info..."
          maxLength={5000}
          {...register('description')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={createMutation.isPending}
          loadingText="Publishing Listing..."
        >
          Publish Listing
        </Button>
      </form>
    </div>
  );
}
