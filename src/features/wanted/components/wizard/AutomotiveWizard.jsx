import { useState } from 'react';
import {
  Car,
  Truck,
  Bus,
  Bike,
  Zap,
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
  VEHICLE_MAKES,
  VEHICLE_MODELS,
  VEHICLE_BODY_TYPES,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_DRIVETRAINS,
  VEHICLE_TITLE_STATUS,
  VEHICLE_SELLER_TYPE,
  VEHICLE_CONDITIONS,
  VEHICLE_FEATURES,
  VEHICLE_YEAR_RANGE,
} from '@utils/constants';
import { DURATION_OPTIONS } from '../../constants/wantedCategories';

const ACQUISITION_OPTIONS = [
  { value: 'purchase', label: 'Purchase / Cash' },
  { value: 'finance', label: 'Financing / Loan' },
  { value: 'lease', label: 'Lease / Takeover' },
  { value: 'rental', label: 'Rental' },
];

export default function AutomotiveWizard({ onSubmit, isSubmitting, onBackToCategory }) {
  const [step, setStep] = useState(1);

  // Step 1: Acquisition & Make/Model/Body
  const [intent, setIntent] = useState('purchase');
  const [bodyType, setBodyType] = useState('sedan');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');

  // Step 2: Specs & Pricing
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [maxMileage, setMaxMileage] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [drivetrain, setDrivetrain] = useState('');
  const [condition, setCondition] = useState('');
  const [titleStatus, setTitleStatus] = useState('');
  const [sellerType, setSellerType] = useState('');
  const [color, setColor] = useState('');

  // Step 3: Features & Notes
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  // Step 4: Location & Duration
  const [locationCity, setLocationCity] = useState('');
  const [locationRadius, setLocationRadius] = useState(25);
  const [durationDays, setDurationDays] = useState(30);

  const toggleFeature = (key) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const generateTitle = () => {
    const makeText = make && make !== 'Other' ? make : '';
    const modelText = model.trim() ? model.trim() : '';
    const bodyObj = VEHICLE_BODY_TYPES.find((b) => b.value === bodyType);
    const bodyLabel = bodyObj ? bodyObj.label : 'Vehicle';

    let yearText = '';
    if (yearMin && yearMax && yearMin !== yearMax) {
      yearText = `${yearMin}-${yearMax} `;
    } else if (yearMin) {
      yearText = `${yearMin}+ `;
    }

    if (makeText || modelText) {
      return `${yearText}${makeText} ${modelText} Wanted`.replace(/\s+/g, ' ').trim();
    }

    return `${yearText}${bodyLabel} Wanted`.replace(/\s+/g, ' ').trim();
  };

  const handleSubmit = () => {
    const details = [];
    details.push(`[Acquisition_Type]: ${intent}`);
    details.push(`[Body_Type]: ${bodyType}`);
    if (make) details.push(`Make: ${make}`);
    if (model) details.push(`Model: ${model}`);
    if (yearMin) details.push(`Min Year: ${yearMin}`);
    if (yearMax) details.push(`Max Year: ${yearMax}`);
    if (maxMileage) details.push(`Max Mileage: ${maxMileage} miles`);
    if (transmission) details.push(`Transmission: ${VEHICLE_TRANSMISSIONS.find(t => t.value === transmission)?.label || transmission}`);
    if (fuelType) details.push(`Fuel Type: ${VEHICLE_FUEL_TYPES.find(f => f.value === fuelType)?.label || fuelType}`);
    if (drivetrain) details.push(`Drivetrain: ${VEHICLE_DRIVETRAINS.find(d => d.value === drivetrain)?.label || drivetrain}`);
    if (condition) details.push(`Condition: ${VEHICLE_CONDITIONS.find(c => c.value === condition)?.label || condition}`);
    if (titleStatus) details.push(`Title Status: ${VEHICLE_TITLE_STATUS.find(t => t.value === titleStatus)?.label || titleStatus}`);
    if (sellerType) details.push(`Seller Type: ${VEHICLE_SELLER_TYPE.find(s => s.value === sellerType)?.label || sellerType}`);
    if (color) details.push(`Preferred Color: ${color}`);

    if (selectedFeatures.length > 0) {
      const featNames = selectedFeatures
        .map((k) => VEHICLE_FEATURES.find((f) => f.key === k)?.label)
        .filter(Boolean);
      details.push(`Must-Have Options: ${featNames.join(', ')}`);
    }

    if (additionalPreferences) {
      details.push(`\nAdditional Notes:\n${additionalPreferences}`);
    }

    const payload = {
      category: 'automotive',
      title: generateTitle(),
      intent: intent || 'purchase',
      item_type: bodyType || 'sedan',
      budget_min: Number(budgetMin) || 0,
      budget_max: Number(budgetMax) || 0,
      description: details.join('\n'),
      features: selectedFeatures.map((k) => {
        const featObj = VEHICLE_FEATURES.find((item) => item.key === k);
        return featObj ? featObj.label : k;
      }),
      location_city: locationCity || 'Philadelphia, PA',
      location_radius: Number(locationRadius) || 25,
      duration_days: Number(durationDays) || 30,
      metadata: {
        intent,
        bodyType,
        make,
        model,
        budgetMin,
        budgetMax,
        yearMin,
        yearMax,
        maxMileage,
        transmission,
        fuelType,
        drivetrain,
        condition,
        titleStatus,
        sellerType,
        color,
      },
    };

    onSubmit(payload);
  };

  const getBodyIcon = (val) => {
    switch (val) {
      case 'truck':
        return Truck;
      case 'van':
        return Bus;
      case 'ev':
        return Zap;
      default:
        return Car;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Acquisition Type, Body Type & Make/Model
  // ─────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={1} />

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
            <Car size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            What vehicle are you seeking?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Specify your acquisition type and preferred vehicle styling.
          </p>
        </div>

        {/* Acquisition Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Acquisition Type
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACQUISITION_OPTIONS.map((item) => {
              const isSelected = intent === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setIntent(item.value)}
                  className={cn(
                    'py-2.5 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all border text-center',
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Body Type Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Body Type
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {VEHICLE_BODY_TYPES.map((type) => {
              const isSelected = bodyType === type.value;
              const Icon = getBodyIcon(type.value);

              return (
                <div
                  key={type.value}
                  onClick={() => setBodyType(type.value)}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border-2 p-3.5 text-center transition-all',
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-gray-400'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
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

        {/* Make & Model Inputs */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Vehicle Make & Model (Optional)
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Make / Brand</span>
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Make</option>
                {VEHICLE_MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Specific Model</span>
              <input
                type="text"
                value={model}
                list="automotive-models"
                onChange={(e) => setModel(e.target.value)}
                placeholder={make && VEHICLE_MODELS[make] ? `e.g. ${VEHICLE_MODELS[make].slice(0, 3).join(', ')}` : "e.g. Camry, Civic, F-150, Model 3"}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              />
              {make && VEHICLE_MODELS[make] && (
                <datalist id="automotive-models">
                  {VEHICLE_MODELS[make].map((mod) => (
                    <option key={mod} value={mod} />
                  ))}
                </datalist>
              )}
            </div>
          </div>
        </div>

        {/* Navigation: Back and Next only */}
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
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Budget & Real Automotive Attributes
  // ─────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={2} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Budget & Vehicle Specifications
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Define your price range and exact mechanical/listing requirements.
          </p>
        </div>

        {/* Budget */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Budget Range ($)
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
                  placeholder="15,000"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-7 pr-3 py-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
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
                  placeholder="35,000"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-7 pr-3 py-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Vehicle Specs */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-4">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Vehicle Criteria
          </label>

          {/* Year Range & Max Mileage */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Min Year</span>
              <select
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Year</option>
                {VEHICLE_YEAR_RANGE.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Max Year</span>
              <select
                value={yearMax}
                onChange={(e) => setYearMax(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Year</option>
                {VEHICLE_YEAR_RANGE.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Max Mileage</span>
              <select
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Mileage</option>
                <option value="15000">Under 15,000 miles</option>
                <option value="30000">Under 30,000 miles</option>
                <option value="50000">Under 50,000 miles</option>
                <option value="75000">Under 75,000 miles</option>
                <option value="100000">Under 100,000 miles</option>
                <option value="150000">Under 150,000 miles</option>
              </select>
            </div>
          </div>

          {/* Transmission, Fuel Type & Drivetrain */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Transmission</span>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Transmission</option>
                {VEHICLE_TRANSMISSIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Fuel Type</span>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Fuel Type</option>
                {VEHICLE_FUEL_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Drivetrain</span>
              <select
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Drivetrain</option>
                {VEHICLE_DRIVETRAINS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition, Title Status & Seller Type */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 border-t border-[var(--color-border)]">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Condition</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Condition</option>
                {VEHICLE_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Title Status</span>
              <select
                value={titleStatus}
                onChange={(e) => setTitleStatus(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Title Status</option>
                {VEHICLE_TITLE_STATUS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Seller Type</span>
              <select
                value={sellerType}
                onChange={(e) => setSellerType(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
              >
                <option value="">Any Seller Type</option>
                {VEHICLE_SELLER_TYPE.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Preference */}
          <div className="pt-2 border-t border-[var(--color-border)]">
            <span className="block text-xs text-[var(--color-text-muted)] mb-1">Preferred Exterior Color (Optional)</span>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black, White, Silver, Dark Blue..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
            />
          </div>
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
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Must-Have Features & Options
  // ─────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={3} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Features & Options <span className="text-xs font-normal text-[var(--color-text-muted)]">(Optional)</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Select essential vehicle options and packages you are looking for.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VEHICLE_FEATURES.map((feat) => {
            const isSelected = selectedFeatures.includes(feat.key);
            return (
              <div
                key={feat.key}
                onClick={() => toggleFeature(feat.key)}
                className={cn(
                  'cursor-pointer rounded-2xl border-2 p-3 text-center transition-all flex items-center gap-2.5',
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                )}
              >
                <span className="text-base">{feat.emoji}</span>
                <span className="text-xs font-semibold text-left leading-tight">{feat.label}</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Custom Notes & Specific Trims
          </label>
          <textarea
            value={additionalPreferences}
            onChange={(e) => setAdditionalPreferences(e.target.value.slice(0, 1000))}
            placeholder="e.g. Prefer 1 owner, Clean CARFAX, recent brakes/tires, Apple CarPlay, specific engine trim..."
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
          />
          <div className="text-right text-[11px] text-[var(--color-text-muted)]">
            {additionalPreferences.length}/1000
          </div>
        </div>

        {/* Buttons */}
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
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
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
            How far are you willing to travel to inspect or pick up the vehicle?
          </p>
        </div>

        <div className="space-y-3">
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
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-amber-500 focus:outline-none"
            />
          </div>
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

        {/* Confirmation */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
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

        {/* Buttons */}
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
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
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
  const bodyObj = VEHICLE_BODY_TYPES.find((b) => b.value === bodyType);
  const acquisitionObj = ACQUISITION_OPTIONS.find((a) => a.value === intent);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <WizardProgressBar currentStep={5} />

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
          Review Vehicle Request
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
          Review your criteria before broadcasting to local auto sellers and dealerships.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Car size={18} />
            </div>
            <span className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
              {generateTitle()}
            </span>
          </div>
          <button onClick={() => setStep(1)} className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-y-2.5">
          <span className="text-[var(--color-text-muted)]">Acquisition:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right capitalize">
            {acquisitionObj?.label || intent}
          </span>

          <span className="text-[var(--color-text-muted)]">Body Type:</span>
          <span className="font-bold text-[var(--color-text-primary)] text-right">
            {bodyObj?.label || bodyType}
          </span>

          {make && (
            <>
              <span className="text-[var(--color-text-muted)]">Make / Model:</span>
              <span className="font-bold text-[var(--color-text-primary)] text-right">
                {make} {model}
              </span>
            </>
          )}

          <span className="text-[var(--color-text-muted)]">Budget Range:</span>
          <span className="font-bold text-amber-600 text-right">
            {budgetMin || budgetMax
              ? `$${Number(budgetMin || 0).toLocaleString()} - $${Number(budgetMax || 0).toLocaleString()}`
              : 'Flexible'}
          </span>

          {(yearMin || yearMax) && (
            <>
              <span className="text-[var(--color-text-muted)]">Year:</span>
              <span className="font-bold text-right">
                {yearMin && yearMax ? `${yearMin} - ${yearMax}` : yearMin ? `${yearMin}+` : `Up to ${yearMax}`}
              </span>
            </>
          )}

          {maxMileage && (
            <>
              <span className="text-[var(--color-text-muted)]">Max Mileage:</span>
              <span className="font-bold text-right">Under {Number(maxMileage).toLocaleString()} mi</span>
            </>
          )}

          {transmission && (
            <>
              <span className="text-[var(--color-text-muted)]">Transmission:</span>
              <span className="font-bold text-right capitalize">
                {VEHICLE_TRANSMISSIONS.find(t => t.value === transmission)?.label || transmission}
              </span>
            </>
          )}

          {fuelType && (
            <>
              <span className="text-[var(--color-text-muted)]">Fuel Type:</span>
              <span className="font-bold text-right capitalize">
                {VEHICLE_FUEL_TYPES.find(f => f.value === fuelType)?.label || fuelType}
              </span>
            </>
          )}

          {drivetrain && (
            <>
              <span className="text-[var(--color-text-muted)]">Drivetrain:</span>
              <span className="font-bold text-right capitalize">
                {VEHICLE_DRIVETRAINS.find(d => d.value === drivetrain)?.label || drivetrain}
              </span>
            </>
          )}

          {condition && (
            <>
              <span className="text-[var(--color-text-muted)]">Condition:</span>
              <span className="font-bold text-right">
                {VEHICLE_CONDITIONS.find(c => c.value === condition)?.label || condition}
              </span>
            </>
          )}

          {titleStatus && (
            <>
              <span className="text-[var(--color-text-muted)]">Title:</span>
              <span className="font-bold text-right">
                {VEHICLE_TITLE_STATUS.find(t => t.value === titleStatus)?.label || titleStatus}
              </span>
            </>
          )}

          <span className="text-[var(--color-text-muted)]">Location:</span>
          <span className="font-bold text-right">{locationCity || 'Philadelphia, PA'} ({locationRadius} mi)</span>

          {selectedFeatures.length > 0 && (
            <>
              <span className="text-[var(--color-text-muted)]">Features:</span>
              <span className="font-semibold text-right truncate">
                {selectedFeatures
                  .map((k) => VEHICLE_FEATURES.find((f) => f.key === k)?.label)
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Duration Picker */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Request Duration
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Active broadcast time</span>
        </div>
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
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Posting Request...' : 'Post Vehicle Request'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

