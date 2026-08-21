import { useState } from 'react';
import { MapPin, Compass, Store, Crosshair } from 'lucide-react';
import useLocationStore from '@store/location.store';
import Button from '@components/ui/Button';

export default function LocationOptionSelector({ value, onChange, store }) {
  const {
    lat: userLat,
    lng: userLng,
    city: userCity,
    state: userState,
    isLocated,
    isDetecting,
    setLocation,
    setDetecting,
    setError,
  } = useLocationStore();

  const isQuickListStore = store?.description === 'Personal listings';

  // Detect location helper
  const detectLocation = () => {
    setDetecting(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Attempt reverse geocoding to get city/state (fallback to coordinates)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.suburb || '';
          const state = address.state || '';
          setLocation({ lat: latitude, lng: longitude, city, state });
        } catch (e) {
          setLocation({ lat: latitude, lng: longitude, city: 'Detected Location', state: '' });
        }
        setDetecting(false);
      },
      (err) => {
        setError(err.message);
        setDetecting(false);
      }
    );
  };

  const getDisplayLabel = () => {
    if (userCity && userState) return `${userCity}, ${userState}`;
    if (userCity) return userCity;
    if (userLat && userLng) return `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
    return null;
  };

  const locationLabel = getDisplayLabel();

  // Define selector choices
  const options = [
    {
      id: 'approximate',
      title: 'Approximate Location',
      desc: locationLabel
        ? `Within 10 miles of ${locationLabel}`
        : 'Hide exact address, show 10-mile approximate area',
      icon: Compass,
      disabled: !isLocated,
    },
    {
      id: 'exact',
      title: 'My Current Location (Exact)',
      desc: locationLabel ? `Exactly at ${locationLabel}` : 'Detected exact coordinates',
      icon: MapPin,
      disabled: !isLocated,
    },
  ];

  // If it's a permanent store, add store option
  if (!isQuickListStore && store?.location_city) {
    options.unshift({
      id: 'store',
      title: 'Store Location',
      desc: `Use shop address: ${store.location_city}`,
      icon: Store,
      disabled: false,
    });
  }

  // Ensure default value selection if currently none selected
  const activeValue = value || (isQuickListStore ? 'approximate' : (store?.location_city ? 'store' : 'approximate'));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Listing Location
        </label>
        {!isLocated && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            isLoading={isDetecting}
            leftIcon={<Crosshair size={12} />}
            onClick={detectLocation}
          >
            Detect Location
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = activeValue === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={() => onChange(opt.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                opt.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
              style={{
                backgroundColor: isSelected ? 'var(--color-brand-glow)' : 'var(--color-surface)',
                borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                boxShadow: isSelected ? '0 0 0 1px var(--color-brand)' : 'none',
              }}
            >
              <div
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: isSelected ? 'var(--color-brand)' : 'var(--color-surface-elevated)',
                  color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {opt.title}
                </p>
                <p
                  className="mt-0.5 text-xs truncate"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {opt.disabled ? 'Please detect location first' : opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
