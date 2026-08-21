import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SearchService from '@api/services/search.service';
import { queryKeys } from '@lib/queryClient';
import useLocationStore from '@store/location.store';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import SearchBar from '@components/common/SearchBar';
import LocationSelector from '@components/common/LocationSelector';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/ui/Button';
import { DEFAULT_PAGE_SIZE } from '@utils/constants';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { lat, lng, isLocated, radiusMiles } = useLocationStore();

  const locationParams = isLocated && lat && lng && radiusMiles !== 9999
    ? { lat, lng, radius_km: radiusMiles * 1.60934 }
    : {};

  const {
    data, fetchNextPage, hasNextPage,
    isFetchingNextPage, isLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.search.results(query, { ...Object.fromEntries(searchParams), lat, lng, radiusMiles }),
    queryFn: ({ pageParam = 1 }) =>
      SearchService.searchProducts({
        q: query,
        page: pageParam,
        limit: DEFAULT_PAGE_SIZE,
        ...locationParams,
        ...Object.fromEntries(
          [...searchParams.entries()].filter(([k]) => k !== 'q' && k !== 'page')
        ),
      }),
    getNextPageParam: (lastPage) => {
      const pag = lastPage.pagination;
      return pag?.has_next ? pag.page + 1 : undefined;
    },
    enabled: query.length > 0,
  });

  const products   = data?.pages.flatMap((p) => p.data) || [];
  const totalCount = data?.pages?.[0]?.pagination?.total || 0;

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" — Search` : 'Search'} — Aliwayz</title>
      </Helmet>

      <div className="container-app py-6 space-y-6">
        <div className="max-w-2xl mx-auto">
          <SearchBar autoFocus={!query} />
        </div>

        <LocationSelector />

        {isLocated && radiusMiles !== 9999 && (
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            📍 Showing results within {radiusMiles} miles of your location
          </p>
        )}

        {query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PageHeader
              title={`Results for "${query}"`}
              subtitle={`${totalCount} item${totalCount !== 1 ? 's' : ''} found`}
            />

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No results found"
                description={`We couldn't find anything matching "${query}". Try different keywords.`}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      isLoading={isFetchingNextPage}
                      loadingText="Loading..."
                      onClick={() => fetchNextPage()}
                      leftIcon={<ChevronDown size={16} />}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {!query && (
          <EmptyState
            icon="🔎"
            title="Search for anything"
            description="Find automotive, real estate, and marketplace items on Aliwayz"
          />
        )}
      </div>
    </>
  );
}