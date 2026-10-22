import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Navigation,
  Shield,
  Eye,
  Check,
  Compass,
  ExternalLink,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@lib/utils';
import Input from '@components/ui/Input';
import toast from '@lib/toast';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
const HAS_REAL_GOOGLE_KEY =
  Boolean(GOOGLE_MAPS_KEY) &&
  GOOGLE_MAPS_KEY !== 'your_google_maps_key' &&
  !GOOGLE_MAPS_KEY.includes('your_');

// Default center: United States (geographic center or major hub, e.g. Austin, TX)
const DEFAULT_CENTER = {
  lat: 30.2672,
  lng: -97.7431,
  city: 'Austin, TX',
  street: '',
};

const US_STATES = {
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
 * Free geocoding via Nominatim (OpenStreetMap) with enhanced State & ZIP code detection
 */
async function geocodeSearch(query) {
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
        'User-Agent': 'Aliwayz-Marketplace',
      },
    });
    let data = res.ok ? await res.json() : [];

    // Fallback if structured search returned empty
    if ((!data || data.length === 0) && (isZip || isState)) {
      const fallbackQuery = isStateCode
        ? `${US_STATES[upper]}, USA`
        : `${q}, USA`;
      res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          fallbackQuery
        )}`,
        {
          headers: {
            'Accept-Language': 'en-US,en',
            'User-Agent': 'Aliwayz-Marketplace',
          },
        }
      );
      data = res.ok ? await res.json() : [];
    }

    if (!data || data.length === 0) {
      res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          q
        )}`,
        {
          headers: {
            'Accept-Language': 'en-US,en',
            'User-Agent': 'Aliwayz-Marketplace',
          },
        }
      );
      data = res.ok ? await res.json() : [];
    }

    return (data || []).map((item) => {
      const a = item.address || {};
      const city =
        a.city || a.town || a.village || a.suburb || a.county || '';
      const state = a.state_code || a.state || (isStateCode ? upper : (stateNameMatch || ''));
      const street = [a.house_number, a.road].filter(Boolean).join(' ');
      const locationCity = [city, state].filter(Boolean).join(', ') || state || city;

      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        streetAddress: street || '',
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

/**
 * Free reverse geocoding via Nominatim (coordinates -> city/street)
 */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'Aliwayz-Marketplace',
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address || {};
    const city =
      a.city || a.town || a.village || a.suburb || a.county || '';
    const state = a.state_code || a.state || '';
    const street = [a.house_number, a.road].filter(Boolean).join(' ');
    const locationCity = [city, state].filter(Boolean).join(', ');

    return {
      streetAddress: street || '',
      locationCity: locationCity || city,
      zip: a.postcode || '',
    };
  } catch (_e) {
    return null;
  }
}

/**
 * GoogleLocationPicker
 * Interactive map component for setting Exact or Approximate location during seller creation.
 */
export default function GoogleLocationPicker({
  value = {},
  onChange,
  defaultVisibility = 'approximate',
  sellerType = 'individual', // 'individual' | 'business'
  className,
}) {
  const initialLat = value.lat ? parseFloat(value.lat) : DEFAULT_CENTER.lat;
  const initialLng = value.lng ? parseFloat(value.lng) : DEFAULT_CENTER.lng;

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [streetAddress, setStreetAddress] = useState(value.streetAddress || '');
  const [locationCity, setLocationCity] = useState(value.locationCity || '');
  const [addressVisibility, setAddressVisibility] = useState(
    value.addressVisibility || defaultVisibility
  );

  const [searchQuery, setSearchQuery] = useState(
    value.streetAddress
      ? `${value.streetAddress}, ${value.locationCity || ''}`.trim()
      : value.locationCity || ''
  );
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [zoom, setZoom] = useState(14);
  const [useGoogleScript, setUseGoogleScript] = useState(HAS_REAL_GOOGLE_KEY);

  const mapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const googleMarkerRef = useRef(null);
  const googleCircleRef = useRef(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value.lat && value.lng) {
      setCoords({ lat: parseFloat(value.lat), lng: parseFloat(value.lng) });
    }
    if (value.streetAddress !== undefined) setStreetAddress(value.streetAddress);
    if (value.locationCity !== undefined) setLocationCity(value.locationCity);
    if (value.addressVisibility !== undefined) {
      setAddressVisibility(value.addressVisibility);
    }
  }, [value.lat, value.lng, value.streetAddress, value.locationCity, value.addressVisibility]);

  // Dispatch change updates to parent
  const notifyChange = useCallback(
    (nextState) => {
      const merged = {
        lat: nextState.lat ?? coords.lat,
        lng: nextState.lng ?? coords.lng,
        streetAddress: nextState.streetAddress ?? streetAddress,
        locationCity: nextState.locationCity ?? locationCity,
        addressVisibility: nextState.addressVisibility ?? addressVisibility,
        isApproximate:
          (nextState.addressVisibility ?? addressVisibility) === 'approximate',
      };
      onChange?.(merged);
    },
    [coords, streetAddress, locationCity, addressVisibility, onChange]
  );

  // ── 1. Google Maps JS API Integration ────────────────────────
  useEffect(() => {
    if (!HAS_REAL_GOOGLE_KEY) return;

    let isMounted = true;

    const initGoogleMap = () => {
      if (!window.google?.maps || !mapContainerRef.current) return;

      try {
        const centerLatLng = { lat: coords.lat, lng: coords.lng };

        const mapInstance = new window.google.maps.Map(mapContainerRef.current, {
          center: centerLatLng,
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });
        googleMapRef.current = mapInstance;

        // Add Marker
        const marker = new window.google.maps.Marker({
          position: centerLatLng,
          map: mapInstance,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });
        googleMarkerRef.current = marker;

        // Add Privacy Circle
        const circle = new window.google.maps.Circle({
          map: mapInstance,
          center: centerLatLng,
          radius: 1400, // ~1 mile
          fillColor: '#2563EB',
          fillOpacity: 0.16,
          strokeColor: '#2563EB',
          strokeOpacity: 0.5,
          strokeWeight: 2,
        });
        googleCircleRef.current = circle;

        // Visibility sync
        if (addressVisibility === 'approximate') {
          circle.setVisible(true);
          marker.setVisible(false);
        } else {
          circle.setVisible(false);
          marker.setVisible(true);
        }

        // Marker dragend listener
        marker.addListener('dragend', async (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          setCoords({ lat: newLat, lng: newLng });
          circle.setCenter({ lat: newLat, lng: newLng });

          const geo = await reverseGeocode(newLat, newLng);
          if (geo && isMounted) {
            setStreetAddress(geo.streetAddress);
            setLocationCity(geo.locationCity);
            notifyChange({
              lat: newLat,
              lng: newLng,
              streetAddress: geo.streetAddress,
              locationCity: geo.locationCity,
            });
          } else {
            notifyChange({ lat: newLat, lng: newLng });
          }
        });

        // Map click listener
        mapInstance.addListener('click', async (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          setCoords({ lat: newLat, lng: newLng });
          marker.setPosition({ lat: newLat, lng: newLng });
          circle.setCenter({ lat: newLat, lng: newLng });

          const geo = await reverseGeocode(newLat, newLng);
          if (geo && isMounted) {
            setStreetAddress(geo.streetAddress);
            setLocationCity(geo.locationCity);
            notifyChange({
              lat: newLat,
              lng: newLng,
              streetAddress: geo.streetAddress,
              locationCity: geo.locationCity,
            });
          } else {
            notifyChange({ lat: newLat, lng: newLng });
          }
        });
      } catch (_err) {
        setUseGoogleScript(false);
      }
    };

    if (window.google?.maps) {
      initGoogleMap();
    } else {
      const scriptId = 'google-maps-api-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) initGoogleMap();
        };
        script.onerror = () => {
          if (isMounted) setUseGoogleScript(false);
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Google map when coords or visibility mode change
  useEffect(() => {
    if (!googleMapRef.current || !window.google?.maps) return;
    const center = { lat: coords.lat, lng: coords.lng };
    googleMapRef.current.panTo(center);

    if (googleMarkerRef.current) {
      googleMarkerRef.current.setPosition(center);
      googleMarkerRef.current.setVisible(addressVisibility === 'exact');
    }

    if (googleCircleRef.current) {
      googleCircleRef.current.setCenter(center);
      googleCircleRef.current.setVisible(addressVisibility === 'approximate');
    }
  }, [coords.lat, coords.lng, addressVisibility]);

  // ── 2. Autocomplete & Auto-detection on Typing Handler ───────
  const debounceTimerRef = useRef(null);

  const handleSearchInput = (val) => {
    setSearchQuery(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      const results = await geocodeSearch(val);
      setSuggestions(results);
      setIsSearching(false);

      // Automatically detect and set location from top result
      if (results && results.length > 0) {
        const top = results[0];
        setCoords({ lat: top.lat, lng: top.lng });
        if (top.isState) setZoom(7);
        else if (top.isZip) setZoom(13);
        else if (top.streetAddress) setZoom(16);
        else setZoom(14);

        const detectedStreet = top.streetAddress || (top.isState || top.isZip ? '' : val.split(',')[0].trim());
        const detectedCity = top.locationCity || '';
        setStreetAddress(detectedStreet);
        setLocationCity(detectedCity);

        notifyChange({
          lat: top.lat,
          lng: top.lng,
          streetAddress: detectedStreet,
          locationCity: detectedCity,
        });
      }
    }, 300);
  };

  const handleSelectLocation = (loc) => {
    setCoords({ lat: loc.lat, lng: loc.lng });
    if (loc.isState) setZoom(7);
    else if (loc.isZip) setZoom(13);
    else if (loc.streetAddress) setZoom(16);
    else setZoom(14);

    setStreetAddress(loc.streetAddress || '');
    setLocationCity(loc.locationCity || '');
    setSearchQuery(
      loc.streetAddress
        ? `${loc.streetAddress}, ${loc.locationCity}`
        : loc.locationCity
    );
    setSuggestions([]);

    notifyChange({
      lat: loc.lat,
      lng: loc.lng,
      streetAddress: loc.streetAddress || '',
      locationCity: loc.locationCity || '',
    });
  };

  // ── 3. Device GPS Location Detection ────────────────────────
  const handleDetectGPS = () => {
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

          const geo = await reverseGeocode(latitude, longitude);
          if (geo) {
            setStreetAddress(geo.streetAddress);
            setLocationCity(geo.locationCity);
            setSearchQuery(
              geo.streetAddress
                ? `${geo.streetAddress}, ${geo.locationCity}`
                : geo.locationCity
            );
            notifyChange({
              lat: latitude,
              lng: longitude,
              streetAddress: geo.streetAddress,
              locationCity: geo.locationCity,
            });
            toast.success(`Location set to ${geo.locationCity}`);
          } else {
            notifyChange({ lat: latitude, lng: longitude });
          }
        } catch (_e) {
          toast.error('Could not determine city from GPS coordinates');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        const msg =
          err.code === 1
            ? 'Location access was denied. Please search your address above.'
            : 'Unable to acquire GPS coordinates. Please search your city above.';
        toast.error(msg);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  // ── 4. Toggle Visibility Mode (Exact vs. Approximate) ────────
  const handleToggleVisibility = (mode) => {
    setAddressVisibility(mode);
    notifyChange({ addressVisibility: mode });
  };

  // Google Maps external link for user convenience
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    streetAddress
      ? `${streetAddress}, ${locationCity}`
      : `${coords.lat},${coords.lng}`
  )}`;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* ── Top Search & Quick GPS Controls ───────────────────────── */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search street address, city, or ZIP code (e.g. Austin, TX)"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              leftIcon={<Search size={16} />}
              className="pr-9"
            />
            {isSearching && (
              <RefreshCw
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-text-muted)]"
              />
            )}
          </div>

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all hover:bg-[var(--glass-bg-strong)]"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-brand)',
            }}
            title="Detect your current location via device GPS"
          >
            <Navigation
              size={15}
              className={cn(isLocating && 'animate-spin')}
            />
            <span className="hidden sm:inline">
              {isLocating ? 'Locating...' : 'Use My GPS'}
            </span>
            <span className="sm:hidden">{isLocating ? '...' : 'GPS'}</span>
          </button>
        </div>

        {/* Search Autocomplete Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-2xl border shadow-xl overflow-hidden divide-y"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {suggestions.map((loc, idx) => (
                <button
                  key={`${loc.lat}-${loc.lng}-${idx}`}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-[var(--glass-bg-strong)] flex items-start gap-3"
                >
                  <MapPin
                    size={16}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--color-brand)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {loc.streetAddress || loc.locationCity}
                    </p>
                    <p
                      className="text-[11px] truncate mt-0.5"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {loc.displayName}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Exact Location vs. Approximate Location Selector ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Option 1: Exact Location */}
        <button
          type="button"
          onClick={() => handleToggleVisibility('exact')}
          className="p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden"
          style={{
            background:
              addressVisibility === 'exact'
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(29, 78, 216, 0.08) 100%)'
                : 'var(--color-surface)',
            borderColor:
              addressVisibility === 'exact'
                ? '#2563EB'
                : 'var(--color-border)',
            boxShadow:
              addressVisibility === 'exact'
                ? '0 0 0 1px #2563EB, 0 8px 20px -4px rgba(37, 99, 235, 0.25)'
                : 'none',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor:
                addressVisibility === 'exact'
                  ? '#2563EB'
                  : 'var(--color-bg)',
              color: addressVisibility === 'exact' ? '#ffffff' : 'var(--color-brand)',
            }}
          >
            <MapPin size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-xs sm:text-sm font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Exact Location
              </span>
              {addressVisibility === 'exact' && (
                <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px]">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </div>
            <p
              className="text-[11px] mt-1 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Pinpoints exact address on the map. Ideal for retail stores, dealerships, or showrooms.
            </p>
          </div>
        </button>

        {/* Option 2: Approximate Location */}
        <button
          type="button"
          onClick={() => handleToggleVisibility('approximate')}
          className="p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden"
          style={{
            background:
              addressVisibility === 'approximate'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)'
                : 'var(--color-surface)',
            borderColor:
              addressVisibility === 'approximate'
                ? '#10B981'
                : 'var(--color-border)',
            boxShadow:
              addressVisibility === 'approximate'
                ? '0 0 0 1px #10B981, 0 8px 20px -4px rgba(16, 185, 129, 0.25)'
                : 'none',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor:
                addressVisibility === 'approximate'
                  ? '#10B981'
                  : 'var(--color-bg)',
              color: addressVisibility === 'approximate' ? '#ffffff' : '#10B981',
            }}
          >
            <Shield size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-xs sm:text-sm font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Approximate Location
              </span>
              {addressVisibility === 'approximate' && (
                <span className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px]">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </div>
            <p
              className="text-[11px] mt-1 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Shows a ~1 mile neighborhood circle. Your street address is hidden. Recommended for personal sellers.
            </p>
          </div>
        </button>
      </div>

      {/* ── Interactive Map Box ───────────────────────────────────── */}
      <div
        className="w-full rounded-2xl border overflow-hidden shadow-sm relative"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {/* Mode Pill Indicator Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span
            className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md"
            style={{
              backgroundColor:
                addressVisibility === 'exact'
                  ? 'rgba(37, 99, 235, 0.92)'
                  : 'rgba(16, 185, 129, 0.92)',
              color: '#ffffff',
            }}
          >
            {addressVisibility === 'exact' ? (
              <>
                <MapPin size={13} />
                <span>Exact Location Pin</span>
              </>
            ) : (
              <>
                <Shield size={13} />
                <span>Approximate Privacy Area (~1 mi)</span>
              </>
            )}
          </span>
        </div>

        {/* Direct Link to Google Maps */}
        <div className="absolute top-3 right-3 z-20">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-md border transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            title="Open coordinates in Google Maps"
          >
            <span>Open Google Maps</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Real Google Map Canvas or Fallback Visual Interactive Map */}
        {useGoogleScript && HAS_REAL_GOOGLE_KEY ? (
          <div
            ref={mapContainerRef}
            className="w-full h-64 sm:h-80 bg-slate-100 dark:bg-slate-900"
          />
        ) : (
          <div className="relative w-full h-64 sm:h-80 overflow-hidden select-none bg-slate-900">
            {/* Visual Google Map style embed/tile background */}
            <iframe
              title="Location Map"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'contrast(1.05) brightness(0.98)' }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=${
                addressVisibility === 'exact' ? 15 : 13
              }&output=embed`}
            />

            {/* Approximate radius privacy circle overlay */}
            {addressVisibility === 'approximate' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-emerald-500 animate-pulse flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.20)',
                    borderColor: '#10B981',
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-emerald-600 shadow" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Bottom Status Bar */}
        <div
          className="p-3 sm:p-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin
              size={14}
              style={{
                color:
                  addressVisibility === 'exact' ? '#2563EB' : '#10B981',
              }}
              className="flex-shrink-0"
            />
            <span
              className="font-bold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {addressVisibility === 'exact' && streetAddress
                ? `${streetAddress}, ${locationCity || 'Location set'}`
                : locationCity || 'Click map or search above to set location'}
            </span>
          </div>

          <div
            className="flex items-center gap-3 text-[11px] font-mono flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span>Lat: {coords.lat.toFixed(4)}</span>
            <span>Lng: {coords.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
