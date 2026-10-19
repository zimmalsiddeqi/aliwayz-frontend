import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import ProductService from '@api/services/product.service';
import useLocationStore from '@store/location.store';
import useInterestStore from '@store/interest.store';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';

export default function RecommendedProducts() {
  const { lat, lng, isLocated, radiusMiles } = useLocationStore();
  const getTopCategories = useInterestStore((s) => s.getTopCategories);
  const decayScores = useInterestStore((s) => s.decayScores);
  const [topCats, setTopCats] = useState([]);

  // Fetch top interests only on mount so it doesn't shuffle mid-session if they click things
  useEffect(() => {
    setTopCats(getTopCategories(2));
    decayScores();
  }, [getTopCategories, decayScores]);

  const locationParams =
    isLocated && lat && lng && radiusMiles !== 9999
      ? { lat, lng, radius_km: radiusMiles * 1.60934 }
      : {};

  const { data: recommendedProducts, isLoading } = useQuery({
    queryKey: ['recommended-products', topCats, locationParams],
    queryFn: async () => {
      // 1. Try to fetch from interested categories first
      if (topCats.length > 0) {
        const results = await Promise.all(
          topCats.map((catId) =>
            ProductService.browse({
              category_id: catId,
              limit: 10,
              ...locationParams,
            }).catch(() => ({ data: [] }))
          )
        );

        // Interleave the results evenly
        const combined = [];
        const maxLen = Math.max(...results.map((r) => r.data?.length || 0));
        for (let i = 0; i < maxLen; i++) {
          results.forEach((res) => {
            if (res.data && res.data[i]) {
              combined.push(res.data[i]);
            }
          });
        }

        if (combined.length > 0) return combined.slice(0, 15);
      }

      // 2. Fallback: Nearby products (if location is granted)
      if (isLocated && lat && lng) {
        const res = await ProductService.getNearby({
          lat,
          lng,
          radius_km: radiusMiles * 1.60934,
          limit: 15,
        }).catch(() => ({ data: [] }));
        if (res.data?.length > 0) return res.data;
      }

      // 3. Ultimate Fallback: Trending global
      const res = await ProductService.getTrending().catch(() => ({ data: [] }));
      return res.data?.slice(0, 15) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  if (!isLoading && (!recommendedProducts || recommendedProducts.length === 0)) {
    return null;
  }

  return (
    <div className="py-6 sm:py-10">
      <div className="container-app mb-4 sm:mb-6 flex items-center gap-2">
        <Sparkles className="text-brand-500" size={24} />
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Recommended for You
        </h2>
      </div>

      <div className="container-app">
        <div className="-mx-4 sm:mx-0 overflow-x-auto hide-scrollbar pb-6 px-4 sm:px-0">
          <div className="flex gap-4 w-max">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-[180px] sm:w-[240px] flex-shrink-0">
                    <ProductCardSkeleton />
                  </div>
                ))
              : recommendedProducts.map((product) => (
                  <div key={product.id} className="w-[180px] sm:w-[240px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
