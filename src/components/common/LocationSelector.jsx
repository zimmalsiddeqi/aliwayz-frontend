import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, X, ChevronDown,
  Loader2, Search, AlertCircle,
} from 'lucide-react';
import useUserLocation from '@hooks/useUserLocation';
import useOnClickOutside from '@hooks/useOnClickOutside';
import { cn } from '@lib/utils';

const RADIUS_OPTIONS = [
  { value: 2,    label: '2 mi' },
  { value: 5,    label: '5 mi' },
  { value: 10,   label: '10 mi' },
  { value: 25,   label: '25 mi' },
  { value: 50,   label: '50 mi' },
  { value: 9999, label: 'Any' },
];

export default function LocationSelector({ compact = false }) {
  const {
    displayLocation,
    radiusMiles,
    isLocated,
    isDetecting,
    error,
    detectGPS,
    detectByZip,
    setRadius,
    clearLocation,
  } = useUserLocation();

  const [isOpen, setIsOpen]     = useState(false);
  const [zipInput, setZipInput] = useState('');
  const [tab, setTab]           = useState('gps'); // 'gps' | 'zip'

  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const handleZipSubmit = (e) => {
    e.preventDefault();
    if (zipInput.trim()) {
      detectByZip(zipInput.trim());
    }
  };

  const handleRadiusChange = (miles) => {
    setRadius(miles);
    setIsOpen(false);
  };

  // ── Compact trigger (used in navbar) ──────────
  if (compact) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
            'hover:bg-[var(--glass-bg-strong)]'
          )}
          style={{
            border: '1px solid var(--color-border)',
            color:  isLocated
              ? 'var(--color-text-primary)'
              : 'var(--color-text-muted)',
          }}
        >
          {isDetecting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <MapPin
              size={12}
              style={{
                color: isLocated
                  ? 'var(--color-brand)'
                  : 'var(--color-text-muted)',
              }}
            />
          )}
          <span className="max-w-[80px] truncate">
            {isLocated
              ? displayLocation || 'Located'
              : 'Set Location'}
          </span>
          {isLocated && (
            <>
              <span style={{ color: 'var(--color-border)' }}>•</span>
              <span style={{ color: 'var(--color-brand)' }}>
                {radiusMiles === 9999 ? 'Any' : `${radiusMiles}mi`}
              </span>
            </>
          )}
          <ChevronDown
            size={11}
            className={cn(
              'transition-transform flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <LocationDropdown
              tab={tab}
              setTab={setTab}
              zipInput={zipInput}
              setZipInput={setZipInput}
              isLocated={isLocated}
              isDetecting={isDetecting}
              displayLocation={displayLocation}
              radiusMiles={radiusMiles}
              error={error}
              onDetectGPS={() => { detectGPS(); }}
              onZipSubmit={handleZipSubmit}
              onRadiusChange={handleRadiusChange}
              onClear={() => { clearLocation(); setIsOpen(false); }}
              align="left"
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Full banner (used on listing pages) ────────
  return (
    <div ref={ref} className="relative">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border:          '1px solid var(--color-border)',
        }}
      >
        <MapPin
          size={18}
          style={{
            color: isLocated
              ? 'var(--color-brand)'
              : 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        />

        <div className="flex-1 min-w-0">
          {isLocated ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-sm font-medium truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                📍 {displayLocation || 'Your Location'}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: 'var(--color-brand-glow)',
                  color:           'var(--color-brand)',
                }}
              >
                {radiusMiles === 9999 ? 'Any distance' : `Within ${radiusMiles} miles`}
              </span>
            </div>
          ) : (
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Set your location to see nearby listings
            </p>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-ghost text-xs flex-shrink-0"
        >
          {isLocated ? 'Change' : 'Set Location'}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <LocationDropdown
            tab={tab}
            setTab={setTab}
            zipInput={zipInput}
            setZipInput={setZipInput}
            isLocated={isLocated}
            isDetecting={isDetecting}
            displayLocation={displayLocation}
            radiusMiles={radiusMiles}
            error={error}
            onDetectGPS={() => { detectGPS(); }}
            onZipSubmit={handleZipSubmit}
            onRadiusChange={handleRadiusChange}
            onClear={() => { clearLocation(); setIsOpen(false); }}
            align="right"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Shared dropdown component ──────────────────────
function LocationDropdown({
  tab, setTab, zipInput, setZipInput,
  isLocated, isDetecting, displayLocation,
  radiusMiles, error,
  onDetectGPS, onZipSubmit, onRadiusChange, onClear,
  align = 'left',
}) {
  return (
    <motion.div
      className={cn(
        'absolute top-full mt-2 z-50 w-80 rounded-2xl overflow-hidden',
        align === 'right' ? 'right-0' : 'left-0'
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
        boxShadow:       'var(--shadow-xl)',
      }}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          📍 Your Location
        </p>
        {isLocated && displayLocation && (
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Currently showing: {displayLocation}
          </p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Tab selector */}
        <div
          className="flex rounded-xl p-1"
          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
        >
          {[
            { id: 'gps', label: '📡 Use GPS' },
            { id: 'zip', label: '🔢 Enter ZIP' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{
                backgroundColor:
                  tab === t.id ? 'var(--color-brand)' : 'transparent',
                color:
                  tab === t.id ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* GPS detection */}
        {tab === 'gps' && (
          <button
            onClick={onDetectGPS}
            disabled={isDetecting}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[var(--glass-bg-strong)]"
            style={{ border: '1px solid var(--color-border)' }}
          >
            {isDetecting ? (
              <Loader2
                size={18}
                className="animate-spin flex-shrink-0"
                style={{ color: 'var(--color-brand)' }}
              />
            ) : (
              <Navigation
                size={18}
                className="flex-shrink-0"
                style={{ color: 'var(--color-brand)' }}
              />
            )}
            <div className="text-left">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {isDetecting ? 'Detecting...' : 'Detect My Location'}
              </p>
              <p
                className="text-[11px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Uses your device GPS
              </p>
            </div>
          </button>
        )}

        {/* ZIP input */}
        {tab === 'zip' && (
          <form onSubmit={onZipSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                value={zipInput}
                onChange={(e) =>
                  setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))
                }
                placeholder="Enter ZIP code"
                className="input-base pl-8 py-2 text-sm"
                autoFocus
                maxLength={5}
              />
            </div>
            <button
              type="submit"
              disabled={zipInput.length !== 5 || isDetecting}
              className="btn-brand px-3 py-2 text-xs rounded-xl"
            >
              {isDetecting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Go'
              )}
            </button>
          </form>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2 p-2.5 rounded-xl text-xs"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              border:          '1px solid rgba(239,68,68,0.15)',
              color:           'var(--color-error)',
            }}
          >
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Radius selector */}
        <div>
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            📏 Search Radius
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onRadiusChange(opt.value)}
                className="py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor:
                    radiusMiles === opt.value
                      ? 'var(--color-brand)'
                      : 'var(--color-surface-elevated)',
                  color:
                    radiusMiles === opt.value
                      ? 'white'
                      : 'var(--color-text-secondary)',
                  border: `1px solid ${
                    radiusMiles === opt.value
                      ? 'var(--color-brand)'
                      : 'var(--color-border)'
                  }`,
                  boxShadow:
                    radiusMiles === opt.value
                      ? 'var(--shadow-brand)'
                      : undefined,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        {isLocated && (
          <button
            onClick={onClear}
            className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl transition-colors hover:bg-[var(--glass-bg-strong)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={12} />
            Clear location filter
          </button>
        )}
      </div>
    </motion.div>
  );
}