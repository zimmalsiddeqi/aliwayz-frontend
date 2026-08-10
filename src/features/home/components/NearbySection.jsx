import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductService from '@api/services/product.service';
import { queryKeys } from '@lib/queryClient';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';

export default function NearbySection() {
  const [coords, setCoords]         = useState(null);
  const [geoBlocked, setGeoBlocked] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoBlocked(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }),
      () => setGeoBlocked(true),    // ← Silently handle denial
      { timeout: 5000 }
    );
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.nearby(coords),
    queryFn:  () =>
      ProductService.getNearby({
        lat:       coords.lat,
        lng:       coords.lng,
        radius_km: 50,
      }).then((r) => r.data),
    enabled:   !!coords && !geoBlocked,
    staleTime: 10 * 60 * 1000,
    retry:     false,
  });

  const products = data || [];

  // ✅ Don't render if geo is blocked or no products
  if (geoBlocked || (!isLoading && products.length === 0)) return null;
  if (!coords && !geoBlocked) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Compass size={18} style={{ color: 'var(--color-brand)' }} />
          <h2
            className="text-lg sm:text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Near You
          </h2>
        </div>
        <Link
          to="/marketplace"
          className="flex items-center gap-1 text-xs font-medium hover:underline"
          style={{ color: 'var(--color-brand)' }}
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}