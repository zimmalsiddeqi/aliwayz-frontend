import { useState } from 'react';
import {
  Home,
  Building2,
  Building,
  Map,
  Store,
  MoreHorizontal,
  Car,
  Warehouse,
  Trees,
  Waves,
  Wind,
  Layers,
  Sparkles,
  PawPrint,
  Plus,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Edit2,
  Clock,
  Search,
} from 'lucide-react';
import { cn } from '@lib/utils';
import Button from '@components/ui/Button';
import WizardProgressBar from './WizardProgressBar';
import {
  REAL_ESTATE_INTENTS,
  REAL_ESTATE_TYPES,
  REAL_ESTATE_FEATURES,
  DURATION_OPTIONS,
  PHILLY_NEIGHBORHOODS,
} from '../../constants/wantedCategories';

export default function RealEstateWizard({ onSubmit, isSubmitting, onBackToCategory }) {
  const [step, setStep] = useState(1);

  // Form State - empty defaults with placeholders
  const [intent, setIntent] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [propertySize, setPropertySize] = useState('');
  const [parkingImportant, setParkingImportant] = useState(false);

  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  const [locationCity, setLocationCity] = useState('');
  const [locationRadius, setLocationRadius] = useState(10);
  const [selectedAreas, setSelectedAreas] = useState([]);

  const [durationDays, setDurationDays] = useState(30);

  const toggleFeature = (id) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleArea = (area) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  const generateTitle = () => {
    const typeObj = REAL_ESTATE_TYPES.find((t) => t.id === propertyType);
    const typeLabel = typeObj ? typeObj.label : 'Property';
    const bedsText = bedrooms ? `${bedrooms} Bedroom ` : '';
    return `${bedsText}${typeLabel}`;
  };

  const handleSubmit = () => {
    const payload = {
      category: 'real_estate',
      title: generateTitle(),
      intent,
      item_type: propertyType,
      budget_min: Number(budgetMin) || 0,
      budget_max: Number(budgetMax) || 0,
      bedrooms,
      bathrooms,
      property_size: propertySize,
      parking_important: parkingImportant,
      features: selectedFeatures.map((f) => {
        const featObj = REAL_ESTATE_FEATURES.find((item) => item.id === f);
        return featObj ? featObj.label : f;
      }),
      description: additionalPreferences,
      location_city: locationCity,
      location_radius: Number(locationRadius) || 10,
      preferred_areas: selectedAreas,
      duration_days: Number(durationDays) || 30,
      metadata: {
        intent,
        propertyType,
        bedrooms,
        bathrooms,
        propertySize,
        parkingImportant,
        selectedAreas,
      },
    };

    onSubmit(payload);
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: What are you looking for? (Basics)
  // ─────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={1} />

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Home size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            What are you looking for?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Choose the type of real estate request you want to post.
          </p>
        </div>

        {/* Intent Pills: Buy / Rent / Lease */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Looking for
          </label>
          <div className="flex rounded-2xl bg-[var(--color-bg-secondary)] p-1.5 max-w-sm mx-auto">
            {REAL_ESTATE_INTENTS.map((item) => {
              const isSelected = intent === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIntent(item.id)}
                  className={cn(
                    'flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Property Type Cards Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Property Type
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {REAL_ESTATE_TYPES.map((type) => {
              const isSelected = propertyType === type.id;
              const Icon =
                type.id === 'house'
                  ? Home
                  : type.id === 'condo'
                  ? Building2
                  : type.id === 'apartment'
                  ? Building
                  : type.id === 'land'
                  ? Map
                  : type.id === 'commercial'
                  ? Store
                  : MoreHorizontal;

              return (
                <div
                  key={type.id}
                  onClick={() => setPropertyType(type.id)}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border-2 p-4 text-center transition-all',
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 shadow-sm ring-2 ring-blue-600/20'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-gray-400'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <CheckCircle2 size={13} />
                    </div>
                  )}
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
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
            onClick={() => {
              if (!intent) setIntent('buy');
              if (!propertyType) setPropertyType('house');
              setStep(2);
            }}
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
  // STEP 2: Budget & Property Details (Screen 3)
  // ─────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={2} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Budget & Details
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Set your target price range and preferred room specifications.
          </p>
        </div>

        {/* Budget Range */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Budget Range {intent === 'rent' ? '(Monthly)' : ''}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Minimum Price</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--color-text-muted)]">
                  $
                </span>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="400,000"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-7 pr-3 py-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Maximum Price</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--color-text-muted)]">
                  $
                </span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="550,000"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-7 pr-3 py-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms & Specs */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
              >
                <option value="">Select Bedrooms</option>
                <option value="Studio">Studio</option>
                <option value="1+">1+ Bedroom</option>
                <option value="2+">2+ Bedrooms</option>
                <option value="3+">3+ Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
                <option value="5+">5+ Bedrooms</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Bathrooms
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
              >
                <option value="">Select Bathrooms</option>
                <option value="1+">1+ Bathroom</option>
                <option value="1.5+">1.5+ Bathrooms</option>
                <option value="2+">2+ Bathrooms</option>
                <option value="2.5+">2.5+ Bathrooms</option>
                <option value="3+">3+ Bathrooms</option>
                <option value="4+">4+ Bathrooms</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              Property Size (sq ft)
            </label>
            <select
              value={propertySize}
              onChange={(e) => setPropertySize(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
            >
              <option value="">Select Property Size</option>
              <option value="750+">750+ sq ft</option>
              <option value="1,000+">1,000+ sq ft</option>
              <option value="1,400+">1,400+ sq ft</option>
              <option value="1,800+">1,800+ sq ft</option>
              <option value="2,500+">2,500+ sq ft</option>
              <option value="3,500+">3,500+ sq ft</option>
            </select>
          </div>

          {/* Toggle: Is parking important? */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              Is parking important?
            </span>
            <button
              type="button"
              onClick={() => setParkingImportant(!parkingImportant)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                parkingImportant ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  parkingImportant ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={() => setStep(1)}>
            &larr; Back
          </Button>
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Must-Have Features & Preferences (Screen 4)
  // ─────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={3} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Must-Have Features <span className="text-xs font-normal text-[var(--color-text-muted)]">(Optional)</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Select essential amenities and any custom preferences for local sellers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {REAL_ESTATE_FEATURES.map((feat) => {
            const isSelected = selectedFeatures.includes(feat.id);
            const Icon =
              feat.id === 'parking'
                ? Car
                : feat.id === 'garage'
                ? Warehouse
                : feat.id === 'backyard'
                ? Trees
                : feat.id === 'pool'
                ? Waves
                : feat.id === 'central_air'
                ? Wind
                : feat.id === 'basement'
                ? Layers
                : feat.id === 'new_construction'
                ? Sparkles
                : feat.id === 'pet_friendly'
                ? PawPrint
                : Plus;

            return (
              <div
                key={feat.id}
                onClick={() => toggleFeature(feat.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border-2 p-3 text-center transition-all',
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                )}
              >
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
                  <Icon size={18} />
                </div>
                <span className="text-xs font-semibold leading-tight block">
                  {feat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Additional Preferences Textarea */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Additional Preferences
          </label>
          <textarea
            value={additionalPreferences}
            onChange={(e) => setAdditionalPreferences(e.target.value.slice(0, 500))}
            placeholder="e.g. Quiet neighborhood, close to schools, renovated kitchen, natural lighting..."
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
          />
          <div className="text-right text-[11px] text-[var(--color-text-muted)]">
            {additionalPreferences.length}/500
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
  // STEP 4: Location & Radius (Screen 5)
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
            Location
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="Search for a neighborhood or address"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Radius Dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Radius
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
            Preferred Areas (Optional)
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

        {/* Location Pin Confirmation Card */}
        <div className="relative rounded-2xl border border-[var(--color-border)] bg-blue-50/50 dark:bg-blue-950/20 p-4 flex items-center justify-between">
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
  // STEP 5: Review & Post (Screen 6)
  // ─────────────────────────────────────────────────────────────
  // STEP 5: Review & Post
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <WizardProgressBar currentStep={5} />

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
          Review Your Request
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
          Ensure all details are accurate before posting to local sellers and agents.
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
              Request Details
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
          <span className="text-[var(--color-text-muted)]">Request Type:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right capitalize">
            {intent || 'Buy'}
          </span>

          <span className="text-[var(--color-text-muted)]">Property Type:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right capitalize">
            {propertyType || 'House'}
          </span>

          <span className="text-[var(--color-text-muted)]">Budget:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-right">
            {budgetMin || budgetMax
              ? `$${Number(budgetMin || 0).toLocaleString()} - $${Number(budgetMax || 0).toLocaleString()}`
              : 'Flexible'}
          </span>

          <span className="text-[var(--color-text-muted)]">Bedrooms:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right">
            {bedrooms || 'Any'}
          </span>

          <span className="text-[var(--color-text-muted)]">Bathrooms:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right">
            {bathrooms || 'Any'}
          </span>

          <span className="text-[var(--color-text-muted)]">Size:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right">
            {propertySize ? `${propertySize} sqft` : 'Any'}
          </span>

          <span className="text-[var(--color-text-muted)]">Location:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right">
            {locationCity || 'Philadelphia, PA'} ({locationRadius} mi)
          </span>

          <span className="text-[var(--color-text-muted)]">Features:</span>
          <span className="font-semibold text-[var(--color-text-primary)] text-right truncate">
            {selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'None specified'}
          </span>
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
          <span className="text-xs text-[var(--color-text-muted)]">Active time</span>
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
