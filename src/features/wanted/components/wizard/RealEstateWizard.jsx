import { useState } from 'react';
import {
  Home,
  Building2,
  Building,
  Map,
  Store,
  Briefcase,
  Warehouse,
  Palmtree,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Edit2,
  Clock,
  Search,
} from 'lucide-react';
import { cn } from '@lib/utils';
import WizardProgressBar from './WizardProgressBar';
import {
  REAL_ESTATE_TYPES,
  REAL_ESTATE_FEATURES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  LEASE_TERMS,
  PET_POLICY,
} from '@utils/constants';
import { DURATION_OPTIONS, PHILLY_NEIGHBORHOODS } from '../../constants/wantedCategories';

const PURPOSE_OPTIONS = [
  { value: 'sale', label: 'Buy / Purchase' },
  { value: 'rent', label: 'Rent' },
  { value: 'lease', label: 'Commercial Lease' },
  { value: 'vacation', label: 'Vacation Rental' },
];

export default function RealEstateWizard({ onSubmit, isSubmitting, onBackToCategory }) {
  const [step, setStep] = useState(1);

  // Core classification
  const [intent, setIntent] = useState('sale');
  const [propertyType, setPropertyType] = useState('single_family');

  // Budget & Financials
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [maxHoa, setMaxHoa] = useState('');

  // Residential Specs
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSize, setAreaSize] = useState('');
  const [minYearBuilt, setMinYearBuilt] = useState('');
  const [parkingSpaces, setParkingSpaces] = useState('');

  // Rent specific specs
  const [leaseTerm, setLeaseTerm] = useState('');
  const [petPolicy, setPetPolicy] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [utilitiesIncluded, setUtilitiesIncluded] = useState([]);

  // Commercial / Industrial specs
  const [ceilingHeight, setCeilingHeight] = useState('');
  const [loadingDock, setLoadingDock] = useState('');
  const [zoningCode, setZoningCode] = useState('');

  // Land specs
  const [acreage, setAcreage] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [roadAccess, setRoadAccess] = useState('');
  const [waterAccess, setWaterAccess] = useState('');
  const [sewerAccess, setSewerAccess] = useState('');
  const [electricityAccess, setElectricityAccess] = useState('');

  // Features & Description
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  // Location & Duration
  const [locationCity, setLocationCity] = useState('');
  const [locationRadius, setLocationRadius] = useState(10);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [durationDays, setDurationDays] = useState(30);

  const isLand = propertyType === 'land';
  const isCommercial = intent === 'lease' || ['commercial', 'office', 'industrial'].includes(propertyType);
  const isRent = intent === 'rent';
  const isVacation = intent === 'vacation';

  const toggleFeature = (key) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const toggleUtility = (util) => {
    setUtilitiesIncluded((prev) =>
      prev.includes(util) ? prev.filter((item) => item !== util) : [...prev, util]
    );
  };

  const toggleArea = (area) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  const generateTitle = () => {
    const propTypeObj = REAL_ESTATE_TYPES.find((t) => t.value === propertyType);
    const typeLabel = propTypeObj ? propTypeObj.label : 'Property';

    let purposeLabel = 'For Sale';
    if (intent === 'rent') purposeLabel = 'For Rent';
    else if (intent === 'lease') purposeLabel = 'For Lease';
    else if (intent === 'vacation') purposeLabel = 'Vacation Rental';

    if (isLand) {
      const acreText = acreage ? `${acreage} Acre ` : '';
      return `${acreText}Land Wanted ${purposeLabel}`;
    }

    if (isCommercial) {
      const sizeText = areaSize ? `${areaSize} SF ` : '';
      return `${sizeText}${typeLabel} Wanted (${purposeLabel})`;
    }

    const bedsText = bedrooms ? `${bedrooms} Bd ` : '';
    const bathsText = bathrooms ? `${bathrooms} Ba ` : '';
    return `${bedsText}${bathsText}${typeLabel} Wanted (${purposeLabel})`.replace(/\s+/g, ' ').trim();
  };

  const handleSubmit = () => {
    const details = [];
    details.push(`[Intent]: ${intent}`);
    details.push(`[Property_Type]: ${propertyType}`);

    if (isLand) {
      if (acreage) details.push(`Target Acreage: ${acreage} acres`);
      if (lotSize) details.push(`Lot Size: ${lotSize}`);
      if (zoningCode) details.push(`Zoning: ${zoningCode}`);
      if (roadAccess) details.push(`Road Access: ${roadAccess}`);
      if (waterAccess) details.push(`Water: ${waterAccess}`);
      if (sewerAccess) details.push(`Sewer: ${sewerAccess}`);
      if (electricityAccess) details.push(`Electricity: ${electricityAccess}`);
    } else if (isCommercial) {
      if (areaSize) details.push(`Target Space: ${areaSize} sqft`);
      if (ceilingHeight) details.push(`Ceiling Height: ${ceilingHeight} ft`);
      if (loadingDock) details.push(`Loading Dock: ${loadingDock}`);
      if (parkingSpaces) details.push(`Parking Spaces: ${parkingSpaces}`);
      if (zoningCode) details.push(`Zoning: ${zoningCode}`);
    } else {
      if (bedrooms) details.push(`Bedrooms: ${bedrooms}`);
      if (bathrooms) details.push(`Bathrooms: ${bathrooms}`);
      if (areaSize) details.push(`Square Feet: ${areaSize} sqft`);
      if (minYearBuilt) details.push(`Min Year Built: ${minYearBuilt}`);
      if (parkingSpaces) details.push(`Parking Spaces: ${parkingSpaces}`);
      if (maxHoa) details.push(`Max HOA: $${maxHoa}/month`);
      if (isRent) {
        if (leaseTerm) details.push(`Lease Term: ${leaseTerm}`);
        if (petPolicy) details.push(`Pet Policy: ${petPolicy}`);
        if (moveInDate) details.push(`Move-in Date: ${moveInDate}`);
        if (utilitiesIncluded.length > 0) details.push(`Utilities Included: ${utilitiesIncluded.join(', ')}`);
      }
    }

    if (selectedFeatures.length > 0) {
      const featNames = selectedFeatures
        .map((k) => REAL_ESTATE_FEATURES.find((f) => f.key === k)?.label)
        .filter(Boolean);
      details.push(`Must-Have Features: ${featNames.join(', ')}`);
    }

    if (additionalPreferences) {
      details.push(`\nAdditional Notes:\n${additionalPreferences}`);
    }

    const payload = {
      category: 'real_estate',
      title: generateTitle(),
      intent,
      item_type: propertyType,
      budget_min: Number(budgetMin) || 0,
      budget_max: Number(budgetMax) || 0,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      property_size: areaSize || undefined,
      description: details.join('\n'),
      features: selectedFeatures.map((k) => {
        const fObj = REAL_ESTATE_FEATURES.find((f) => f.key === k);
        return fObj ? fObj.label : k;
      }),
      location_city: locationCity || 'Philadelphia, PA',
      location_radius: Number(locationRadius) || 10,
      preferred_areas: selectedAreas,
      duration_days: Number(durationDays) || 30,
      metadata: {
        intent,
        propertyType,
        budgetMin,
        budgetMax,
        bedrooms,
        bathrooms,
        areaSize,
        acreage,
        lotSize,
        zoningCode,
        roadAccess,
        waterAccess,
        sewerAccess,
        electricityAccess,
        ceilingHeight,
        loadingDock,
        parkingSpaces,
        minYearBuilt,
        maxHoa,
        leaseTerm,
        petPolicy,
        moveInDate,
        utilitiesIncluded,
        selectedAreas,
      },
    };

    onSubmit(payload);
  };

  const getPropIcon = (val) => {
    switch (val) {
      case 'single_family':
      case 'townhome':
        return Home;
      case 'condo':
        return Building2;
      case 'apartment':
      case 'multi_family':
        return Building;
      case 'land':
        return Map;
      case 'commercial':
        return Store;
      case 'office':
        return Briefcase;
      case 'industrial':
        return Warehouse;
      case 'vacation':
        return Palmtree;
      default:
        return Home;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Purpose & Property Type
  // ─────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={1} />

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Home size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            What real estate are you looking for?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Select your acquisition purpose and property category.
          </p>
        </div>

        {/* Purpose / Intent Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Purpose / Intent
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PURPOSE_OPTIONS.map((item) => {
              const isSelected = intent === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setIntent(item.value)}
                  className={cn(
                    'py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all border text-center',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Property Type Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Property Type
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {REAL_ESTATE_TYPES.map((type) => {
              const isSelected = propertyType === type.value;
              const Icon = getPropIcon(type.value);

              return (
                <div
                  key={type.value}
                  onClick={() => setPropertyType(type.value)}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border-2 p-3.5 text-center transition-all',
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-600/20'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-gray-400'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <CheckCircle2 size={13} />
                    </div>
                  )}
                  <div className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] block leading-tight">
                    {type.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons: Back and Next only */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBackToCategory}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Real Listing Attributes & Pricing
  // ─────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={2} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Pricing & Property Attributes
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Fill in the exact specifications you require sellers or agents to match.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            {isRent
              ? 'Monthly Rent Budget ($)'
              : isCommercial
              ? 'Lease Rate Budget ($)'
              : isVacation
              ? 'Nightly Budget ($)'
              : 'Target Purchase Price Range ($)'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Minimum</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--color-text-muted)]">
                  $
                </span>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder={isRent ? '1,500' : '350,000'}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-7 pr-3 py-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Maximum</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--color-text-muted)]">
                  $
                </span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder={isRent ? '2,800' : '650,000'}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-7 pr-3 py-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Property Attributes based on Category & Intent */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-4">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Property Specifications
          </label>

          {isLand ? (
            /* Land Specifications */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Target Acreage (Acres)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={acreage}
                    onChange={(e) => setAcreage(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Lot Dimensions</span>
                  <input
                    type="text"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    placeholder="e.g. 100 x 250 ft"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Zoning Code / Type</span>
                  <input
                    type="text"
                    value={zoningCode}
                    onChange={(e) => setZoningCode(e.target.value)}
                    placeholder="e.g. Residential, Commercial"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Road Access</span>
                  <select
                    value={roadAccess}
                    onChange={(e) => setRoadAccess(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Select Road Access</option>
                    <option value="paved">Paved Road</option>
                    <option value="dirt">Dirt Road</option>
                    <option value="none">No Road Access</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Water</span>
                  <select
                    value={waterAccess}
                    onChange={(e) => setWaterAccess(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2 text-xs font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="available">Must be Available</option>
                    <option value="none">Not Needed</option>
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Sewer</span>
                  <select
                    value={sewerAccess}
                    onChange={(e) => setSewerAccess(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2 text-xs font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="available">Must be Available</option>
                    <option value="none">Not Needed</option>
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Electricity</span>
                  <select
                    value={electricityAccess}
                    onChange={(e) => setElectricityAccess(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2 text-xs font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="available">Must be Available</option>
                    <option value="none">Not Needed</option>
                  </select>
                </div>
              </div>
            </div>
          ) : isCommercial ? (
            /* Commercial / Industrial Specifications */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Target Space (sq ft)</span>
                  <input
                    type="number"
                    value={areaSize}
                    onChange={(e) => setAreaSize(e.target.value)}
                    placeholder="e.g. 3,500"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Min Ceiling Height (ft)</span>
                  <input
                    type="number"
                    value={ceilingHeight}
                    onChange={(e) => setCeilingHeight(e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Loading Dock</span>
                  <select
                    value={loadingDock}
                    onChange={(e) => setLoadingDock(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Required">Required</option>
                    <option value="Preferred">Preferred</option>
                    <option value="Not Needed">Not Needed</option>
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Parking Spaces</span>
                  <input
                    type="number"
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Zoning Code</span>
                  <input
                    type="text"
                    value={zoningCode}
                    onChange={(e) => setZoningCode(e.target.value)}
                    placeholder="e.g. CMX-2"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Residential Specifications (House, Condo, Townhome, Multi-Family, Apartment) */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Bedrooms</span>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Select Bedrooms</option>
                    {BEDROOM_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Bathrooms</span>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Select Bathrooms</option>
                    {BATHROOM_OPTIONS.map((ba) => (
                      <option key={ba.value} value={ba.value}>
                        {ba.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Target Size (sq ft)</span>
                  <input
                    type="number"
                    value={areaSize}
                    onChange={(e) => setAreaSize(e.target.value)}
                    placeholder="e.g. 1,600"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {isRent ? (
                  <div>
                    <span className="block text-xs text-[var(--color-text-muted)] mb-1">Lease Term</span>
                    <select
                      value={leaseTerm}
                      onChange={(e) => setLeaseTerm(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                    >
                      <option value="">Select Lease Term</option>
                      {LEASE_TERMS.map((term) => (
                        <option key={term.value} value={term.value}>
                          {term.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <span className="block text-xs text-[var(--color-text-muted)] mb-1">Min Year Built</span>
                    <input
                      type="number"
                      value={minYearBuilt}
                      onChange={(e) => setMinYearBuilt(e.target.value)}
                      placeholder="e.g. 2015"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {isRent && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="block text-xs text-[var(--color-text-muted)] mb-1">Pet Policy</span>
                    <select
                      value={petPolicy}
                      onChange={(e) => setPetPolicy(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                    >
                      <option value="">Select Pet Preference</option>
                      {PET_POLICY.map((pet) => (
                        <option key={pet.value} value={pet.value}>
                          {pet.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs text-[var(--color-text-muted)] mb-1">Target Move-in Date</span>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {isRent && (
                <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                  <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
                    Desired Utilities Included
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Water', 'Electricity', 'Gas', 'Internet', 'Trash'].map((util) => {
                      const isSel = utilitiesIncluded.includes(util);
                      return (
                        <button
                          key={util}
                          type="button"
                          onClick={() => toggleUtility(util)}
                          className={cn(
                            'rounded-xl px-3 py-1.5 text-xs font-bold transition-all border',
                            isSel
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-[var(--color-border)] bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] hover:border-gray-400'
                          )}
                        >
                          {util}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {intent === 'sale' && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[var(--color-border)]">
                  <div>
                    <span className="block text-xs text-[var(--color-text-muted)] mb-1">Max HOA Fee ($/mo)</span>
                    <input
                      type="number"
                      value={maxHoa}
                      onChange={(e) => setMaxHoa(e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="block text-xs text-[var(--color-text-muted)] mb-1">Parking Spaces</span>
                    <input
                      type="number"
                      value={parkingSpaces}
                      onChange={(e) => setParkingSpaces(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Must-Have Features & Preferences
  // ─────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={3} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Features & Amenities <span className="text-xs font-normal text-[var(--color-text-muted)]">(Optional)</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Select essential features and any custom requirements for matching properties.
          </p>
        </div>

        {/* Real Estate Features from Constants */}
        {!isLand && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {REAL_ESTATE_FEATURES.map((feat) => {
              const isSelected = selectedFeatures.includes(feat.key);

              return (
                <div
                  key={feat.key}
                  onClick={() => toggleFeature(feat.key)}
                  className={cn(
                    'cursor-pointer rounded-2xl border-2 p-3 text-center transition-all flex items-center gap-2.5',
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                  )}
                >
                  <span className="text-base">{feat.emoji}</span>
                  <span className="text-xs font-semibold leading-tight text-left">
                    {feat.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Preferences Textarea */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Additional Notes & Requirements
          </label>
          <textarea
            value={additionalPreferences}
            onChange={(e) => setAdditionalPreferences(e.target.value.slice(0, 1000))}
            placeholder="e.g. Prefer corner lot, high walk score, updated kitchen, natural light, school district..."
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
          />
          <div className="text-right text-[11px] text-[var(--color-text-muted)]">
            {additionalPreferences.length}/1000
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 4: Location & Radius
  // ─────────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={4} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Location & Radius
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Where should sellers search for your matching property?
          </p>
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            City or Zip Code
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="e.g. Philadelphia, PA or 19103"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Radius Dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Search Radius
          </label>
          <select
            value={locationRadius}
            onChange={(e) => setLocationRadius(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
          >
            <option value={5}>Within 5 miles</option>
            <option value={10}>Within 10 miles</option>
            <option value={25}>Within 25 miles</option>
            <option value={50}>Within 50 miles</option>
            <option value={100}>Within 100 miles</option>
          </select>
        </div>

        {/* Preferred Areas Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Preferred Neighborhoods (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {PHILLY_NEIGHBORHOODS.map((nh) => {
              const isSelected = selectedAreas.includes(nh);
              return (
                <button
                  key={nh}
                  type="button"
                  onClick={() => toggleArea(nh)}
                  className={cn(
                    'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                  )}
                >
                  {nh}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirmation */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-blue-50/50 dark:bg-blue-950/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {locationCity || 'Philadelphia, PA'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Within {locationRadius} miles</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(5)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 5: Review & Post
  // ─────────────────────────────────────────────────────────────
  const propTypeObj = REAL_ESTATE_TYPES.find((t) => t.value === propertyType);
  const purposeObj = PURPOSE_OPTIONS.find((p) => p.value === intent);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <WizardProgressBar currentStep={5} />

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
          Review Your Request
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
          Ensure all specifications are accurate before broadcasting to sellers and real estate agents.
        </p>
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Home size={18} />
            </div>
            <span className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
              {generateTitle()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-y-2.5 text-xs sm:text-sm">
          <span className="text-[var(--color-text-muted)]">Purpose:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right capitalize">
            {purposeObj?.label || intent}
          </span>

          <span className="text-[var(--color-text-muted)]">Property Type:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right">
            {propTypeObj?.label || propertyType}
          </span>

          <span className="text-[var(--color-text-muted)]">Budget Range:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-right">
            {budgetMin || budgetMax
              ? `$${Number(budgetMin || 0).toLocaleString()} - $${Number(budgetMax || 0).toLocaleString()}`
              : 'Flexible'}
          </span>

          {!isLand && bedrooms && (
            <>
              <span className="text-[var(--color-text-muted)]">Bedrooms:</span>
              <span className="font-bold text-[var(--color-text-primary)] text-right">
                {BEDROOM_OPTIONS.find((b) => b.value === bedrooms)?.label || bedrooms}
              </span>
            </>
          )}

          {!isLand && bathrooms && (
            <>
              <span className="text-[var(--color-text-muted)]">Bathrooms:</span>
              <span className="font-bold text-[var(--color-text-primary)] text-right">
                {BATHROOM_OPTIONS.find((b) => b.value === bathrooms)?.label || bathrooms}
              </span>
            </>
          )}

          {areaSize && (
            <>
              <span className="text-[var(--color-text-muted)]">Target Size:</span>
              <span className="font-bold text-[var(--color-text-primary)] text-right">
                {Number(areaSize).toLocaleString()} sq ft
              </span>
            </>
          )}

          {isLand && acreage && (
            <>
              <span className="text-[var(--color-text-muted)]">Target Acreage:</span>
              <span className="font-bold text-[var(--color-text-primary)] text-right">
                {acreage} Acres
              </span>
            </>
          )}

          <span className="text-[var(--color-text-muted)]">Location:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right">
            {locationCity || 'Philadelphia, PA'} ({locationRadius} mi)
          </span>

          {selectedFeatures.length > 0 && (
            <>
              <span className="text-[var(--color-text-muted)]">Features:</span>
              <span className="font-semibold text-[var(--color-text-primary)] text-right truncate">
                {selectedFeatures
                  .map((k) => REAL_ESTATE_FEATURES.find((f) => f.key === k)?.label)
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Request Duration Picker */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Request Duration
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Active broadcast time</span>
        </div>

        <select
          value={durationDays}
          onChange={(e) => setDurationDays(Number(e.target.value))}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons: Strictly Back and Post */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Posting Request...' : 'Post Wanted Request'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

