import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, X, ChevronDown,
  Loader2, Search, AlertCircle, Check,
} from 'lucide-react';
import useUserLocation from '@hooks/useUserLocation';
import { cn } from '@lib/utils';

const RADIUS_OPTIONS = [
  { value: 2,    label: '2 mi' },
  { value: 5,    label: '5 mi' },
  { value: 10,   label: '10 mi' },
  { value: 25,   label: '25 mi' },
  { value: 50,   label: '50 mi' },
  { value: 9999, label: 'Any' },
];

export default function LocationSelector({
  compact = false,
  variant = 'default',
  className = '',
}) {
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

  const handleZipSubmit = (e) => {
    e.preventDefault();
    if (zipInput.trim()) {
      detectByZip(zipInput.trim());
    }
  };

  const handleRadiusChange = (miles) => {
    setRadius(miles);
  };

  // ── Mobile Bar variant (used below search bar on mobile view) ──
  if (compact && variant === 'mobile-bar') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
            'hover:bg-[var(--glass-bg-strong)] active:scale-[0.99]',
            className
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: isLocated ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isDetecting ? (
              <Loader2 size={15} className="animate-spin text-brand-500 flex-shrink-0" />
            ) : (
              <MapPin
                size={15}
                style={{
                  color: isLocated ? 'var(--color-brand)' : 'var(--color-text-muted)',
                }}
                className="flex-shrink-0"
              />
            )}
            <span className="truncate">
              {isLocated ? (displayLocation || 'Your Location') : 'Set your location to see nearby items'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {isLocated && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  backgroundColor: 'var(--color-brand-glow)',
                  color: 'var(--color-brand)',
                }}
              >
                {radiusMiles === 9999 ? 'Any' : `${radiusMiles}mi`}
              </span>
            )}
            <span className="text-xs font-semibold" style={{ color: 'var(--color-brand)' }}>
              {isLocated ? 'Change' : 'Set'}
            </span>
          </div>
        </button>

        <LocationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          tab={tab}
          setTab={setTab}
          zipInput={zipInput}
          setZipInput={setZipInput}
          isLocated={isLocated}
          isDetecting={isDetecting}
          displayLocation={displayLocation}
          radiusMiles={radiusMiles}
          error={error}
          onDetectGPS={detectGPS}
          onZipSubmit={handleZipSubmit}
          onRadiusChange={handleRadiusChange}
          onClear={() => { clearLocation(); }}
        />
      </>
    );
  }

  // ── Compact trigger (used in navbar) ──────────
  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
            'hover:bg-[var(--glass-bg-strong)]',
            className
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

        <LocationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          tab={tab}
          setTab={setTab}
          zipInput={zipInput}
          setZipInput={setZipInput}
          isLocated={isLocated}
          isDetecting={isDetecting}
          displayLocation={displayLocation}
          radiusMiles={radiusMiles}
          error={error}
          onDetectGPS={detectGPS}
          onZipSubmit={handleZipSubmit}
          onRadiusChange={handleRadiusChange}
          onClear={() => { clearLocation(); }}
        />
      </>
    );
  }

  // ── Full banner (used on listing / search pages) ────────
  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl',
          className
        )}
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
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-ghost text-xs flex-shrink-0"
        >
          {isLocated ? 'Change' : 'Set Location'}
        </button>
      </div>

      <LocationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tab={tab}
        setTab={setTab}
        zipInput={zipInput}
        setZipInput={setZipInput}
        isLocated={isLocated}
        isDetecting={isDetecting}
        displayLocation={displayLocation}
        radiusMiles={radiusMiles}
        error={error}
        onDetectGPS={detectGPS}
        onZipSubmit={handleZipSubmit}
        onRadiusChange={handleRadiusChange}
        onClear={() => { clearLocation(); }}
      />
    </>
  );
}

// ── Centered Modal Component ──────────────────────
function LocationModal({
  isOpen,
  onClose,
  tab,
  setTab,
  zipInput,
  setZipInput,
  isLocated,
  isDetecting,
  displayLocation,
  radiusMiles,
  error,
  onDetectGPS,
  onZipSubmit,
  onRadiusChange,
  onClear,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container in Middle of Screen */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{
              backgroundColor: 'var(--color-surface)',
              border:          '1px solid var(--color-border)',
            }}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title and Close Button */}
            <div
              className="flex items-center justify-between p-4 sm:p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="min-w-0 pr-2">
                <h3
                  className="text-base sm:text-lg font-bold flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  📍 Your Location
                </h3>
                {isLocated && displayLocation ? (
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Currently showing:{' '}
                    <span className="font-semibold text-[var(--color-brand)]">
                      {displayLocation}
                    </span>
                  </p>
                ) : (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Set your location to see nearby items & deals
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl transition-colors hover:bg-[var(--glass-bg-strong)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex-shrink-0"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Tab Selector */}
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
                    type="button"
                    onClick={() => setTab(t.id)}
                    className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
                    style={{
                      backgroundColor:
                        tab === t.id ? 'var(--color-brand)' : 'transparent',
                      color:
                        tab === t.id ? 'white' : 'var(--color-text-secondary)',
                      boxShadow: tab === t.id ? 'var(--shadow-brand)' : undefined,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* GPS Detection */}
              {tab === 'gps' && (
                <button
                  type="button"
                  onClick={onDetectGPS}
                  disabled={isDetecting}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all hover:bg-[var(--glass-bg-strong)] active:scale-[0.99]"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  {isDetecting ? (
                    <Loader2
                      size={20}
                      className="animate-spin flex-shrink-0"
                      style={{ color: 'var(--color-brand)' }}
                    />
                  ) : (
                    <Navigation
                      size={20}
                      className="flex-shrink-0"
                      style={{ color: 'var(--color-brand)' }}
                    />
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {isDetecting ? 'Detecting...' : 'Detect My Location'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Uses your device GPS to locate your city
                    </p>
                  </div>
                </button>
              )}

              {/* ZIP Input */}
              {tab === 'zip' && (
                <form onSubmit={onZipSubmit} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                    <input
                      type="text"
                      value={zipInput}
                      onChange={(e) =>
                        setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))
                      }
                      placeholder="Enter 5-digit ZIP code"
                      className="input-base pl-9 py-2.5 text-sm w-full"
                      autoFocus
                      maxLength={5}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={zipInput.length !== 5 || isDetecting}
                    className="btn-brand px-4 py-2.5 text-xs font-semibold rounded-xl"
                  >
                    {isDetecting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Set'
                    )}
                  </button>
                </form>
              )}

              {/* Error Alert */}
              {error && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    border:          '1px solid rgba(239,68,68,0.15)',
                    color:           'var(--color-error)',
                  }}
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Search Radius */}
              <div>
                <p
                  className="text-xs font-semibold mb-2.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  📏 Search Radius
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onRadiusChange(opt.value)}
                      className="py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
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
                      {radiusMiles === opt.value && <Check size={12} />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filter Button */}
              {isLocated && (
                <button
                  type="button"
                  onClick={onClear}
                  className="w-full flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl transition-colors hover:bg-[var(--glass-bg-strong)] border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color:       'var(--color-text-muted)',
                  }}
                >
                  <X size={13} />
                  Clear location filter
                </button>
              )}

              {/* Done Button */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-brand w-full py-2.5 text-xs font-semibold rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}