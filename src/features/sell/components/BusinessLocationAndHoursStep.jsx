import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Shield,
  Search,
  Navigation,
  Compass,
  Plus,
  Minus,
  X,
  Copy,
  Globe,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Check,
} from 'lucide-react';
import { cn } from '@lib/utils';
import {
  DAYS_OF_WEEK,
  DEFAULT_BUSINESS_HOURS,
  TIME_OPTIONS,
} from '@utils/sellerMeta';
import toast from '@lib/toast';

// Default center: Philadelphia, PA (matches the exact screenshot mockup)
const DEFAULT_COORDS = {
  lat: 39.9526,
  lng: -75.1652,
};
const DEFAULT_ADDRESS = '1234 Market St, Philadelphia, PA 19107';

/**
 * Detect US Timezone from state name/code or longitude
 */
export function detectTimezoneFromLocation(stateStr, lng) {
  const s = (stateStr || '').toUpperCase().trim();
  const eastern = [
    'CT', 'DE', 'FL', 'GA', 'IN', 'KY', 'ME', 'MD', 'MA', 'MI',
    'NH', 'NJ', 'NY', 'NC', 'OH', 'PA', 'RI', 'SC', 'TN', 'VT',
    'VA', 'WV', 'DC', 'PENNSYLVANIA', 'NEW YORK', 'FLORIDA',
    'GEORGIA', 'NORTH CAROLINA', 'VIRGINIA', 'OHIO', 'MICHIGAN',
    'MARYLAND', 'MASSACHUSETTS',
  ];
  const central = [
    'AL', 'AR', 'IL', 'IA', 'KS', 'LA', 'MN', 'MS', 'MO', 'NE',
    'ND', 'OK', 'SD', 'TX', 'WI', 'TEXAS', 'ILLINOIS', 'WISCONSIN',
    'MINNESOTA', 'MISSOURI', 'LOUISIANA', 'ALABAMA', 'TENNESSEE',
  ];
  const mountain = [
    'AZ', 'CO', 'ID', 'MT', 'NM', 'UT', 'WY', 'COLORADO', 'ARIZONA',
    'UTAH', 'NEW MEXICO', 'IDAHO', 'MONTANA', 'WYOMING',
  ];
  const pacific = [
    'CA', 'NV', 'OR', 'WA', 'CALIFORNIA', 'WASHINGTON', 'OREGON', 'NEVADA',
  ];
  const alaska = ['AK', 'ALASKA'];
  const hawaii = ['HI', 'HAWAII'];

  if (eastern.some((st) => s.includes(st))) return 'Eastern Time (ET)';
  if (central.some((st) => s.includes(st))) return 'Central Time (CT)';
  if (mountain.some((st) => s.includes(st))) return 'Mountain Time (MT)';
  if (pacific.some((st) => s.includes(st))) return 'Pacific Time (PT)';
  if (alaska.some((st) => s.includes(st))) return 'Alaska Time (AKT)';
  if (hawaii.some((st) => s.includes(st))) return 'Hawaii-Aleutian Time (HAT)';

  if (lng) {
    if (lng > -85) return 'Eastern Time (ET)';
    if (lng > -103) return 'Central Time (CT)';
    if (lng > -115) return 'Mountain Time (MT)';
    if (lng > -130) return 'Pacific Time (PT)';
  }

  return 'Eastern Time (ET)';
}

const US_TIMEZONES = [
  { value: 'Eastern Time (ET)', label: 'Eastern Time (ET) - UTC-5 / UTC-4' },
  { value: 'Central Time (CT)', label: 'Central Time (CT) - UTC-6 / UTC-5' },
  { value: 'Mountain Time (MT)', label: 'Mountain Time (MT) - UTC-7 / UTC-6' },
  { value: 'Pacific Time (PT)', label: 'Pacific Time (PT) - UTC-8 / UTC-7' },
  { value: 'Alaska Time (AKT)', label: 'Alaska Time (AKT) - UTC-9 / UTC-8' },
  { value: 'Hawaii-Aleutian Time (HAT)', label: 'Hawaii-Aleutian Time (HAT) - UTC-10' },
];

export const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

/**
 * Free geocoding search with Nominatim (supports full address, ZIP code, or State)
 */
async function searchGeocodeAddress(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const q = query.trim();
    const upper = q.toUpperCase();
    const isZip = /^\d{3,5}(-\d{4})?$/.test(q);
    const isStateCode = q.length === 2 && Boolean(US_STATES[upper]);
    const stateNameMatch = Object.values(US_STATES).find(
      (name) => name.toLowerCase() === q.toLowerCase()
    );
    const isState = isStateCode || Boolean(stateNameMatch);

    let url = '';
    if (isZip) {
      url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&postalcode=${encodeURIComponent(
        q
      )}&countrycodes=us&limit=5`;
    } else if (isStateCode) {
      const stateName = US_STATES[upper];
      url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&state=${encodeURIComponent(
        stateName
      )}&countrycodes=us&limit=5`;
    } else if (stateNameMatch) {
      url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&state=${encodeURIComponent(
        stateNameMatch
      )}&countrycodes=us&limit=5`;
    } else {
      url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=us&limit=5&q=${encodeURIComponent(
        q
      )}`;
    }

    let res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en',
        'User-Agent': 'Aliwayz-Marketplace-Location',
      },
    });
    let data = res.ok ? await res.json() : [];

    // Fallback if structured search returned empty
    if ((!data || data.length === 0) && (isZip || isState)) {
      const fallbackQuery = isStateCode
        ? `${US_STATES[upper]}, USA`
        : isZip
          ? `${q}, USA`
          : `${q}, USA`;
      res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          fallbackQuery
        )}`,
        {
          headers: {
            'Accept-Language': 'en-US,en',
            'User-Agent': 'Aliwayz-Marketplace-Location',
          },
        }
      );
      data = res.ok ? await res.json() : [];
    }

    // 2. Global fallback
    if (!data || data.length === 0) {
      res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          q
        )}`,
        {
          headers: {
            'Accept-Language': 'en-US,en',
            'User-Agent': 'Aliwayz-Marketplace-Location',
          },
        }
      );
      data = res.ok ? await res.json() : [];
    }

    return (data || []).map((item) => {
      const a = item.address || {};
      const city =
        a.city || a.town || a.village || a.suburb || a.county || '';
      const state =
        a.state_code || a.state || (isStateCode ? upper : (stateNameMatch || ''));
      const road = a.road || '';
      const houseNum = a.house_number || '';
      const street = [houseNum, road].filter(Boolean).join(' ');
      const locationCity = [city, state].filter(Boolean).join(', ') || state || city;

      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        streetAddress: street || '',
        city,
        state,
        locationCity: locationCity || city || state,
        zip: a.postcode || (isZip ? q : ''),
        isZip,
        isState,
      };
    });
  } catch (_e) {
    return [];
  }
}

export default function BusinessLocationAndHoursStep({
  formData,
  setFormData,
  coords,
  setCoords,
  errors,
  setErrors,
  onNext,
  onBack,
  onSaveDraft,
}) {
  const addressInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Initialize display address
  const initialAddress =
    formData.streetAddress && formData.locationCity
      ? `${formData.streetAddress}, ${formData.locationCity}`
      : formData.streetAddress ||
        formData.locationCity ||
        DEFAULT_ADDRESS;

  const [addressInput, setAddressInput] = useState(initialAddress);
  const [zipCode, setZipCode] = useState('19107');
  const [suggestions, setSuggestions] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [showMapCallout, setShowMapCallout] = useState(true);

  // Timezone state
  const [timezone, setTimezone] = useState(() =>
    detectTimezoneFromLocation(formData.locationCity || 'PA', coords?.lng || DEFAULT_COORDS.lng)
  );
  const [showTimezoneSelect, setShowTimezoneSelect] = useState(false);

  // Sync internal field changes
  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Ensure default coordinates exist
  useEffect(() => {
    if (!coords?.lat || !coords?.lng) {
      setCoords(DEFAULT_COORDS);
    }
    if (!formData.streetAddress && !formData.locationCity) {
      updateField('streetAddress', '1234 Market St');
      updateField('locationCity', 'Philadelphia, PA 19107');
    }
  }, []);

  // ── Debounced Auto-detection on Typing ─────────────────────────────
  const handleAddressInputChange = (e) => {
    const val = e.target.value;
    setAddressInput(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsGeocoding(true);

    // Automatically detect and select location as user types
    debounceTimerRef.current = setTimeout(async () => {
      const results = await searchGeocodeAddress(val);
      setSuggestions(results);
      setIsGeocoding(false);

      if (results && results.length > 0) {
        const top = results[0];
        setCoords({ lat: top.lat, lng: top.lng });

        const detectedStreet = top.streetAddress || (top.isState || top.isZip ? '' : val.split(',')[0].trim());
        const detectedCity =
          top.locationCity || (top.city ? `${top.city}, ${top.state}` : top.state || '');
        const detectedZip = top.zip || (top.isZip ? val.trim() : '');

        if (detectedStreet) updateField('streetAddress', detectedStreet);
        if (detectedCity) updateField('locationCity', detectedCity);
        if (detectedZip) setZipCode(detectedZip);

        if (top.isState) {
          setMapZoom(7);
        } else if (top.isZip) {
          setMapZoom(13);
        } else if (top.streetAddress) {
          setMapZoom(16);
        } else {
          setMapZoom(14);
        }

        const tz = detectTimezoneFromLocation(top.state, top.lng);
        setTimezone(tz);
        setShowMapCallout(true);
      }
    }, 300);
  };

  // Select suggestion from dropdown
  const handleSelectSuggestion = (loc) => {
    setCoords({ lat: loc.lat, lng: loc.lng });

    const street = loc.streetAddress || loc.displayName.split(',')[0].trim();
    const city = loc.locationCity || '';
    const zip = loc.zip || '';

    updateField('streetAddress', street);
    if (city) updateField('locationCity', city);
    if (zip) setZipCode(zip);

    if (loc.isState) {
      setMapZoom(7);
    } else if (loc.isZip) {
      setMapZoom(13);
    } else if (loc.streetAddress) {
      setMapZoom(16);
    } else {
      setMapZoom(14);
    }

    const full = [street, city, zip].filter(Boolean).join(', ');
    setAddressInput(full);
    setSuggestions([]);
    setShowMapCallout(true);

    const tz = detectTimezoneFromLocation(loc.state, loc.lng);
    setTimezone(tz);
  };

  // Clear address input
  const handleClearAddress = () => {
    setAddressInput('');
    setSuggestions([]);
    updateField('streetAddress', '');
    addressInputRef.current?.focus();
  };

  // ── Browser GPS Device Location Detection ──────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location services are not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en-US,en',
                'User-Agent': 'Aliwayz-Marketplace-GPS',
              },
            }
          );
          const data = await res.json();
          const a = data?.address || {};
          const city =
            a.city || a.town || a.village || a.suburb || a.county || '';
          const state = a.state_code || a.state || '';
          const road = a.road || '';
          const houseNumber = a.house_number || '';
          const street = [houseNumber, road].filter(Boolean).join(' ');
          const formattedCity = [city, state].filter(Boolean).join(', ');
          const zip = a.postcode || '';

          const full = [street, formattedCity, zip].filter(Boolean).join(', ');
          setAddressInput(full || formattedCity);
          if (street) updateField('streetAddress', street);
          if (formattedCity) updateField('locationCity', formattedCity);
          if (zip) setZipCode(zip);

          const tz = detectTimezoneFromLocation(state, longitude);
          setTimezone(tz);

          setSuggestions([]);
          setShowMapCallout(true);
          toast.success(
            formattedCity
              ? `Location detected: ${formattedCity}`
              : 'Current location applied'
          );
        } catch (_err) {
          toast.error('Could not reverse-geocode your GPS location.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        const msg =
          err.code === 1
            ? 'Location permission was denied. Please type your address above.'
            : 'Unable to acquire GPS location. Please search your address.';
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Business Hours Handlers ─────────────────────────────────────────
  const handleDayHourChange = (dayKey, key, val) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [dayKey]: {
          ...prev.businessHours[dayKey],
          [key]: val,
        },
      },
    }));
  };

  const handleCopyMondayToWeekdays = () => {
    const mon = formData.businessHours?.mon || DEFAULT_BUSINESS_HOURS.mon;
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        mon: { ...mon, closed: false },
        tue: { ...mon, closed: false },
        wed: { ...mon, closed: false },
        thu: { ...mon, closed: false },
        fri: { ...mon, closed: false },
      },
    }));
    toast.success("Copied Monday's hours to Monday – Friday");
  };

  const handleCopyHoursToAllOpenDays = () => {
    const mon = formData.businessHours?.mon || DEFAULT_BUSINESS_HOURS.mon;
    setFormData((prev) => {
      const updated = { ...prev.businessHours };
      Object.keys(updated).forEach((k) => {
        if (!updated[k].closed) {
          updated[k] = { ...updated[k], open: mon.open, close: mon.close };
        }
      });
      return { ...prev, businessHours: updated };
    });
    toast.success('Copied hours to all open days');
  };

  // Day columns (matching the 2-column screenshot layout)
  const leftDays = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
  ];
  const rightDays = [
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' },
  ];

  const currentLat = coords?.lat || DEFAULT_COORDS.lat;
  const currentLng = coords?.lng || DEFAULT_COORDS.lng;

  const displayStreetTitle =
    formData.streetAddress || addressInput.split(',')[0] || '1234 Market St';
  const displayCityZipTitle =
    formData.locationCity || 'Philadelphia, PA 19107';

  // Render a day row
  const renderDayRow = (day) => {
    const dayConfig =
      formData.businessHours?.[day.key] || DEFAULT_BUSINESS_HOURS[day.key];
    const isOpen = !dayConfig?.closed;

    return (
      <div
        key={day.key}
        className="flex items-center justify-between gap-3 py-1.5"
      >
        {/* Day Name */}
        <span
          className="text-sm font-semibold text-[var(--color-text-primary)] w-24 sm:w-28 flex-shrink-0"
        >
          {day.label}
        </span>

        {/* iOS-style Blue Toggle */}
        <button
          type="button"
          onClick={() =>
            handleDayHourChange(day.key, 'closed', !dayConfig?.closed)
          }
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 flex-shrink-0 cursor-pointer focus:outline-none',
            isOpen ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
          )}
          aria-label={`Toggle ${day.label}`}
        >
          <span
            className={cn(
              'w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out',
              isOpen ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          {/* Open Time */}
          <div className="relative">
            <select
              value={dayConfig?.open || '09:00'}
              disabled={!isOpen}
              onChange={(e) =>
                handleDayHourChange(day.key, 'open', e.target.value)
              }
              className={cn(
                'appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                isOpen
                  ? 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]'
                  : 'bg-slate-100 dark:bg-slate-800/60 border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed'
              )}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            />
          </div>

          {/* Close Time */}
          <div className="relative">
            <select
              value={dayConfig?.close || '18:00'}
              disabled={!isOpen}
              onChange={(e) =>
                handleDayHourChange(day.key, 'close', e.target.value)
              }
              className={cn(
                'appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                isOpen
                  ? 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]'
                  : 'bg-slate-100 dark:bg-slate-800/60 border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed'
              )}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      {/* ── Page Heading ───────────────────────────────────────────── */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Business Location &amp; Hours
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
          Tell customers where you&apos;re located and when you&apos;re open.
        </p>
      </div>

      {/* ── CARD 1: Business Address & Location Privacy ────────────── */}
      <div
        className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/20">
            <MapPin size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              Business Address
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Search for your business address. You can also use your current location.
            </p>
          </div>
        </div>

        {/* Search Input Bar + "Use my location" button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              ref={addressInputRef}
              type="text"
              value={addressInput}
              onChange={handleAddressInputChange}
              placeholder="Search address, city, state, or ZIP code (e.g. 19107, Texas, PA, Austin TX)"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-medium text-[var(--color-text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
            />
            {/* Loading spinner or clear button */}
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              {isGeocoding ? (
                <RefreshCw size={15} className="animate-spin text-blue-500" />
              ) : addressInput ? (
                <button
                  type="button"
                  onClick={handleClearAddress}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                  title="Clear address"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Use My Location GPS Button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-all shadow-sm disabled:opacity-50"
          >
            <Navigation
              size={16}
              className={cn(isLocating && 'animate-spin')}
            />
            <span>{isLocating ? 'Locating...' : 'Use my location'}</span>
          </button>

          {/* Autocomplete Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 sm:right-40 top-full mt-2 z-40 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden divide-y divide-[var(--color-border)]"
              >
                {suggestions.map((loc, idx) => (
                  <button
                    key={`${loc.lat}-${loc.lng}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(loc)}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-950/30 flex items-start gap-3"
                  >
                    <MapPin
                      size={16}
                      className="text-blue-600 flex-shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] truncate">
                        {loc.streetAddress || loc.locationCity}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] truncate mt-0.5">
                        {loc.displayName}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Interactive Map Box ──────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-slate-100 dark:bg-slate-900 h-72 sm:h-80 shadow-inner">
          {/* Map Embed Canvas */}
          <iframe
            key={`${currentLat}-${currentLng}-${mapZoom}`}
            title="Business Location Map"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'contrast(1.02)' }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&z=${mapZoom}&output=embed`}
          />

          {/* Center Map Pin & Callout Tooltip */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center">
            {showMapCallout && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-2 bg-white text-slate-900 rounded-xl shadow-2xl px-4 py-2.5 border border-slate-200 pointer-events-auto relative text-left min-w-[210px] max-w-[290px]"
              >
                <button
                  type="button"
                  onClick={() => setShowMapCallout(false)}
                  className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title="Close popup"
                >
                  <X size={13} />
                </button>
                <div className="font-bold text-xs sm:text-sm text-slate-900 truncate pr-4">
                  {displayStreetTitle}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {displayCityZipTitle}
                </div>
                {/* Pointer Tail */}
                <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
              </motion.div>
            )}

            {/* Blue Pin SVG */}
            <div className="relative flex flex-col items-center">
              <svg
                width="34"
                height="42"
                viewBox="0 0 32 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <path
                  d="M16 0C7.16344 0 0 7.16344 0 16C0 26 16 40 16 40C16 40 32 26 32 16C32 7.16344 24.8366 0 16 0Z"
                  fill="#2563EB"
                />
                <circle cx="16" cy="15" r="6" fill="white" />
              </svg>
              <div className="w-3.5 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5" />
            </div>
          </div>

          {/* Approximate Privacy Overlay */}
          {formData.addressVisibility === 'approximate' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
              <div className="w-56 h-56 rounded-full border-2 border-emerald-500/80 bg-emerald-500/15 animate-pulse flex items-center justify-center shadow-lg">
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow">
                  Approximate Area (~1 mi)
                </span>
              </div>
            </div>
          )}

          {/* Top Right Map Controls (+, -, Recenter) */}
          <div className="absolute top-3 right-3 z-30 flex flex-col items-center rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.min(z + 1, 19))}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-bold text-sm"
              title="Zoom in"
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.max(z - 1, 4))}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-bold text-sm"
              title="Zoom out"
            >
              <Minus size={15} />
            </button>
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Recenter on current location"
            >
              <Compass size={15} />
            </button>
          </div>
        </div>

        {/* ── Location Privacy Section ─────────────────────────────── */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Shield size={16} />
            </div>
            <h4 className="text-base font-bold text-[var(--color-text-primary)]">
              Location Privacy
            </h4>
          </div>

          {/* 2 Radio Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Option 1: Show exact location */}
            <div
              onClick={() => updateField('addressVisibility', 'exact')}
              className={cn(
                'relative p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5',
                formData.addressVisibility === 'exact'
                  ? 'border-blue-600 bg-blue-50/25 dark:bg-blue-950/25 shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--glass-bg-subtle)]'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                  formData.addressVisibility === 'exact'
                    ? 'border-blue-600 bg-white dark:bg-slate-900'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              >
                {formData.addressVisibility === 'exact' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">
                    Show exact location
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                  Your full address will be shown on the map so customers can get directions and visit your business.
                </p>
              </div>
            </div>

            {/* Option 2: Show approximate area */}
            <div
              onClick={() => updateField('addressVisibility', 'approximate')}
              className={cn(
                'relative p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5',
                formData.addressVisibility === 'approximate'
                  ? 'border-blue-600 bg-blue-50/25 dark:bg-blue-950/25 shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--glass-bg-subtle)]'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                  formData.addressVisibility === 'approximate'
                    ? 'border-blue-600 bg-white dark:bg-slate-900'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              >
                {formData.addressVisibility === 'approximate' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">
                    Show approximate area
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                  Hide your exact address; show a nearby area instead. Good for businesses that prefer more privacy.
                </p>
              </div>
            </div>
          </div>

          {/* Address Summary Info Row with Edit link */}
          <div className="p-4 rounded-2xl border bg-slate-50/80 dark:bg-slate-900/50 border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                <Globe size={18} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10 min-w-0">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Address
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] truncate">
                    {formData.streetAddress
                      ? `${formData.streetAddress}${
                          formData.locationCity ? `, ${formData.locationCity}` : ''
                        }`
                      : addressInput || DEFAULT_ADDRESS}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    City, State, ZIP
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] truncate">
                    {formData.locationCity
                      ? `${formData.locationCity}${zipCode ? ` ${zipCode}` : ''}`
                      : 'Philadelphia, PA 19107'}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                addressInputRef.current?.focus();
                addressInputRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0 self-end sm:self-center"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Business Hours ─────────────────────────────────── */}
      <div
        className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/20">
            <Clock size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              Business Hours
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Set your regular hours. You can add special hours for holidays or temporary closures later.
            </p>
          </div>
        </div>

        {/* 2-Column Days Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-3.5">
          {/* Left Column: Mon, Tue, Wed, Thu */}
          <div className="space-y-3.5 divide-y divide-[var(--color-border)]/50">
            {leftDays.map(renderDayRow)}
          </div>

          {/* Right Column: Fri, Sat, Sun */}
          <div className="space-y-3.5 divide-y divide-[var(--color-border)]/50">
            {rightDays.map(renderDayRow)}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopyMondayToWeekdays}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
          >
            <Copy size={15} />
            <span>Copy Monday&apos;s hours to weekdays</span>
          </button>

          <button
            type="button"
            onClick={handleCopyHoursToAllOpenDays}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
          >
            <Copy size={15} />
            <span>Copy hours to all open days</span>
          </button>
        </div>

        {/* Timezone Row */}
        <div className="p-4 rounded-2xl border bg-slate-50/80 dark:bg-slate-900/50 border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
              <Globe size={16} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                {timezone}
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)]">
                This is set automatically based on your address.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showTimezoneSelect ? (
              <select
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  setShowTimezoneSelect(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border bg-[var(--color-bg)] text-[var(--color-text-primary)] border-[var(--color-border)]"
              >
                {US_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setShowTimezoneSelect(true)}
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--glass-bg-subtle)] transition-colors shadow-sm"
        >
          Save draft
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
