import { useState } from 'react';
import {
  Car,
  Truck,
  Bus,
  Bike,
  Zap,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Edit2,
  Clock,
  Search,
  Shield,
  Sun,
  Flame,
  Camera,
  Navigation,
  Smartphone,
  Armchair,
  FileCheck,
} from 'lucide-react';
import { cn } from '@lib/utils';
import Button from '@components/ui/Button';
import {
  AUTOMOTIVE_TYPES,
  AUTOMOTIVE_FEATURES,
  DURATION_OPTIONS,
} from '../../constants/wantedCategories';

export default function AutomotiveWizard({ onSubmit, isSubmitting, onBackToCategory }) {
  const [step, setStep] = useState(1);

  // Form State
  const [intent, setIntent] = useState('buy');
  const [vehicleType, setVehicleType] = useState('suv');
  const [makeModel, setMakeModel] = useState('');
  const [yearMin, setYearMin] = useState('2019+');
  const [maxMileage, setMaxMileage] = useState('60,000 miles');
  const [transmission, setTransmission] = useState('automatic');
  const [budgetMin, setBudgetMin] = useState(15000);
  const [budgetMax, setBudgetMax] = useState(30000);

  const [selectedFeatures, setSelectedFeatures] = useState(['clean_title', 'backup_camera', 'apple_carplay']);
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  const [locationCity, setLocationCity] = useState('Philadelphia, PA');
  const [locationRadius, setLocationRadius] = useState(25);
  const [durationDays, setDurationDays] = useState(30);

  const toggleFeature = (id) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const generateTitle = () => {
    if (makeModel.trim()) return `${makeModel.trim()} (${yearMin})`;
    const typeObj = AUTOMOTIVE_TYPES.find((t) => t.id === vehicleType);
    return `${yearMin} ${typeObj?.label || 'Vehicle'}`;
  };

  const handleSubmit = () => {
    const payload = {
      category: 'automotive',
      title: generateTitle(),
      intent,
      item_type: vehicleType,
      budget_min: Number(budgetMin) || 0,
      budget_max: Number(budgetMax) || 0,
      description: `Target: ${makeModel || vehicleType}. Min Year: ${yearMin}. Max Miles: ${maxMileage}. Transmission: ${transmission}.\n\n${additionalPreferences}`,
      features: selectedFeatures.map((f) => {
        const featObj = AUTOMOTIVE_FEATURES.find((item) => item.id === f);
        return featObj ? featObj.label : f;
      }),
      location_city: locationCity,
      location_radius: Number(locationRadius) || 25,
      duration_days: Number(durationDays) || 30,
      metadata: {
        makeModel,
        vehicleType,
        yearMin,
        maxMileage,
        transmission,
      },
    };

    onSubmit(payload);
  };

  // STEP 1: Body Type & Intent
  if (step === 1) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30">
            <Car size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            What vehicle are you seeking?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Choose your vehicle type and whether you want to buy, lease, or rent.
          </p>
        </div>

        {/* Intent */}
        <div className="flex rounded-2xl bg-[var(--color-bg-secondary)] p-1.5 max-w-sm mx-auto">
          {['buy', 'lease', 'rent'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setIntent(item)}
              className={cn(
                'flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl capitalize transition-all',
                intent === item
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Vehicle Body Type */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Vehicle Type
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AUTOMOTIVE_TYPES.map((type) => {
              const isSelected = vehicleType === type.id;
              const Icon =
                type.id === 'truck'
                  ? Truck
                  : type.id === 'van'
                  ? Bus
                  : type.id === 'electric'
                  ? Zap
                  : type.id === 'motorcycle'
                  ? Bike
                  : Car;

              return (
                <div
                  key={type.id}
                  onClick={() => setVehicleType(type.id)}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border-2 p-3.5 text-center transition-all',
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-gray-400'
                  )}
                >
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {type.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Make / Model Input */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
            Specific Make & Model (Optional)
          </label>
          <input
            type="text"
            value={makeModel}
            onChange={(e) => setMakeModel(e.target.value)}
            placeholder="e.g. Toyota RAV4, Honda Civic, Ford F-150, Tesla Model Y"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={onBackToCategory}>
            &larr; Categories
          </Button>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: Budget & Vehicle Details
  if (step === 2) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Budget & Vehicle Specs
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Define your price range, target mileage, and year requirements.
          </p>
        </div>

        {/* Budget */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Budget Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Min Price</span>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Max Price</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Year, Mileage, Transmission */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Minimum Year
              </label>
              <select
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="Any Year">Any Year</option>
                <option value="2015+">2015+</option>
                <option value="2018+">2018+</option>
                <option value="2020+">2020+</option>
                <option value="2022+">2022+</option>
                <option value="Brand New">Brand New (2025/2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Max Mileage
              </label>
              <select
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="Under 25,000 mi">Under 25,000 mi</option>
                <option value="Under 50,000 mi">Under 50,000 mi</option>
                <option value="Under 75,000 mi">Under 75,000 mi</option>
                <option value="Under 100,000 mi">Under 100,000 mi</option>
                <option value="Any Mileage">Any Mileage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                Transmission
              </label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="any">Any</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={() => setStep(1)}>
            &larr; Back
          </Button>
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Must-Have Features
  if (step === 3) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Must-Have Features
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Select vehicle options and add any special trim or package preferences.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {AUTOMOTIVE_FEATURES.map((feat) => {
            const isSelected = selectedFeatures.includes(feat.id);
            return (
              <div
                key={feat.id}
                onClick={() => toggleFeature(feat.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border-2 p-3 text-center transition-all',
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-600 font-bold shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                )}
              >
                <span className="text-xs font-semibold block">{feat.label}</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Custom Notes / Specific Trims
          </label>
          <textarea
            value={additionalPreferences}
            onChange={(e) => setAdditionalPreferences(e.target.value)}
            placeholder="e.g. Prefer black or dark grey exterior, one owner only, recent maintenance records..."
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-xs text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={() => setStep(2)}>
            &larr; Back
          </Button>
          <button
            onClick={() => setStep(4)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 4: Location
  if (step === 4) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Location & Radius
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            How far are you willing to travel to pick up or inspect the vehicle?
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            City or Zip Code
          </label>
          <input
            type="text"
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Search Radius
          </label>
          <select
            value={locationRadius}
            onChange={(e) => setLocationRadius(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
          >
            <option value={15}>Within 15 miles</option>
            <option value={25}>Within 25 miles</option>
            <option value={50}>Within 50 miles</option>
            <option value={100}>Within 100 miles</option>
            <option value={250}>Within 250 miles</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={() => setStep(3)}>
            &larr; Back
          </Button>
          <button
            onClick={() => setStep(5)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 5: Review
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
          Review Vehicle Request
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
          Review your criteria before broadcasting to local auto sellers and dealerships.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
          <span className="font-bold text-base text-[var(--color-text-primary)]">
            {generateTitle()}
          </span>
          <button onClick={() => setStep(1)} className="text-xs font-bold text-amber-600 hover:underline">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-y-2">
          <span className="text-[var(--color-text-muted)]">Budget:</span>
          <span className="font-bold text-amber-600 text-right">
            ${Number(budgetMin).toLocaleString()} - ${Number(budgetMax).toLocaleString()}
          </span>

          <span className="text-[var(--color-text-muted)]">Year:</span>
          <span className="font-bold text-right">{yearMin}</span>

          <span className="text-[var(--color-text-muted)]">Max Mileage:</span>
          <span className="font-bold text-right">{maxMileage}</span>

          <span className="text-[var(--color-text-muted)]">Location:</span>
          <span className="font-bold text-right">{locationCity} ({locationRadius} mi)</span>
        </div>
      </div>

      {/* Duration Picker */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-2">
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Request Duration
        </label>
        <select
          value={durationDays}
          onChange={(e) => setDurationDays(Number(e.target.value))}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={() => setStep(4)}>
          &larr; Back
        </Button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Posting...' : 'Post Vehicle Request'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
