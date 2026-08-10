import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Store, Star, ShoppingBag, Users, UserMinus } from 'lucide-react';
import UserService from '@api/services/user.service';
import FollowerService from '@api/services/follower.service';
import { queryKeys } from '@lib/queryClient';
import { Card } from '@components/ui/Card';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import { formatCompactNumber, formatRating } from '@utils/formatters';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function FollowingPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.following(),
    queryFn:  () => UserService.getFollowing({ page: 1, limit: 50 }),
  });

  const stores = (data?.data || [])
    .map((f) => f.stores || f.store)
    .filter(Boolean);

  // Unfollow a store
  const unfollowMutation = useMutation({
    mutationFn: (storeId) => FollowerService.unfollow(storeId),
    onSuccess:  () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.following(),
      });
      toast.success('Unfollowed');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Helmet>
        <title>Following Stores — Aliwayz</title>
      </Helmet>

      <div className="container-app py-4 sm:py-6 max-w-2xl pb-24 md:pb-8">
        <PageHeader
          showBack
          title="Following"
          subtitle={`${stores.length} store${stores.length !== 1 ? 's' : ''}`}
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="card p-4 flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="Not following any stores"
            description="Follow stores to stay updated on their new listings and get notified when they add something new."
            actionLabel="Browse Marketplace"
            actionTo="/marketplace"
          />
        ) : (
          <div className="space-y-3">
            {stores.map((store, i) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    {/* Store banner thumbnail */}
                    <div className="relative flex-shrink-0">
                      {store.banner_url ? (
                        <div
                          className="w-14 h-14 rounded-2xl overflow-hidden"
                          style={{
                            background: `url(${store.banner_url}) center/cover`,
                          }}
                        >
                          <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                        </div>
                      ) : null}
                      <div
                        className="w-14 h-14 rounded-2xl overflow-hidden"
                        style={{
                          border: '2px solid var(--color-border)',
                        }}
                      >
                        <Avatar
                          src={store.logo_url}
                          name={store.store_name}
                          size="lg"
                        />
                      </div>
                      {store.is_verified && (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                          style={{
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Store info */}
                    <Link
                      to={`/store/${store.slug}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <h4
                          className="font-bold text-sm sm:text-base truncate hover:underline"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {store.store_name}
                        </h4>
                      </div>

                      <div
                        className="flex flex-wrap items-center gap-3 mt-1 text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {store.average_rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star
                              size={11}
                              fill="var(--color-warning)"
                              style={{ color: 'var(--color-warning)' }}
                            />
                            {formatRating(store.average_rating)}
                            {store.total_reviews > 0 &&
                              ` (${store.total_reviews})`}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <ShoppingBag size={11} />
                          {formatCompactNumber(store.total_sales)}{' '}
                          sales
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Users size={11} />
                          {formatCompactNumber(store.total_followers)}
                        </span>
                        {store.location_city && (
                          <span>📍 {store.location_city}</span>
                        )}
                      </div>
                    </Link>

                    {/* Unfollow button */}
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={<UserMinus size={12} />}
                      isLoading={unfollowMutation.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        unfollowMutation.mutate(store.id);
                      }}
                      className="flex-shrink-0"
                    >
                      <span className="hidden sm:inline">
                        Unfollow
                      </span>
                    </Button>
                  </div>

                  {/* Store description */}
                  {store.description && (
                    <p
                      className="text-xs mt-3 line-clamp-2 pl-[68px]"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {store.description}
                    </p>
                  )}

                  {/* View store products CTA */}
                  <div className="flex justify-end mt-3">
                    <Link to={`/store/${store.slug}`}>
                      <Button size="xs" variant="ghost">
                        View Store →
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}