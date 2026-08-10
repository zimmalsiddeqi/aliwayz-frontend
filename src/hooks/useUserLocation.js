import { useCallback } from 'react';
import useLocationStore from '@store/location.store';

/**
 * ZIP to coordinates using FREE API
 * No API key required
 * https://api.zippopotam.us/us/{zip}
 */
async function zipToCoords(zip) {
  const res = await fetch(
    `https://api.zippopotam.us/us/${zip}`
  );
  if (!res.ok) throw new Error('Invalid ZIP code');

  const data = await res.json();
  const place = data.places?.[0];

  if (!place) throw new Error('ZIP code not found');

  return {
    lat:   parseFloat(place.latitude),
    lng:   parseFloat(place.longitude),
    city:  place['place name'],
    state: place['state abbreviation'],
    zip,
  };
}

/**
 * Reverse geocode lat/lng → city/state
 * Uses free nominatim API
 */
async function coordsToCity(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent':      'Aliwayz-App',
        },
      }
    );
    const data = await res.json();
    const addr = data.address || {};
    return {
      city:  addr.city || addr.town || addr.village || null,
      state: addr.state || null,
    };
  } catch {
    return { city: null, state: null };
  }
}

export default function useUserLocation() {
  const {
    lat, lng, city, state, zip,
    radiusMiles, isLocated, isDetecting,
    error, setLocation, setRadius,
    setDetecting, setError, clearLocation,
    getDisplayLocation, getRadiusKm,
  } = useLocationStore();

  // ── Detect via GPS ─────────────────────────────
  const detectGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('GPS not supported on this device');
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Get city name from coordinates
        const { city: detectedCity, state: detectedState } =
          await coordsToCity(latitude, longitude);

        setLocation({
          lat:   latitude,
          lng:   longitude,
          city:  detectedCity,
          state: detectedState,
          zip:   null,
        });

        setDetecting(false);
      },
      (err) => {
        const messages = {
          1: 'Location access denied. Please enter your ZIP code.',
          2: 'Unable to detect location. Please enter your ZIP code.',
          3: 'Location request timed out. Please enter your ZIP code.',
        };
        setError(messages[err.code] || 'Location error');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [setLocation, setDetecting, setError]);

  // ── Detect via ZIP code ────────────────────────
  const detectByZip = useCallback(async (zipCode) => {
    const cleaned = zipCode.replace(/\D/g, '').slice(0, 5);

    if (cleaned.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setDetecting(true);

    try {
      const coords = await zipToCoords(cleaned);
      setLocation(coords);
    } catch (err) {
      setError(err.message || 'Invalid ZIP code');
    } finally {
      setDetecting(false);
    }
  }, [setLocation, setDetecting, setError]);

  return {
    // State
    lat,
    lng,
    city,
    state,
    zip,
    radiusMiles,
    isLocated,
    isDetecting,
    error,

    // Computed
    displayLocation: getDisplayLocation(),
    radiusKm:        getRadiusKm(),

    // Actions
    detectGPS,
    detectByZip,
    setRadius,
    clearLocation,
  };
}