import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import ReviewService from '@api/services/review.service';
import { queryKeys } from '@lib/queryClient';
import ReviewCard from '@components/cards/ReviewCard';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import { formatRating } from '@utils/formatters';

export default function UserReviewsSection({ userId }) {
  const { data: summaryData } = useQuery({
    queryKey: queryKeys.reviews.summary(userId),
    queryFn: () => ReviewService.getUserSummary(userId),
    enabled: !!userId,
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: queryKeys.reviews.user(userId),
    queryFn: () =>
      ReviewService.getByUser(userId, {
        page: 1,
        limit: 5,
      }),
    enabled: !!userId,
  });

  const summary = summaryData?.data;
  const reviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="md" />
      </div>
    );
  }

  if (!summary || summary.total === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-semibold text-sm"
            style={{
              color: 'var(--color-text-primary)',
            }}
          >
            Reviews ({summary.total})
          </h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Average rating */}
          <div className="text-center">
            <p
              className="text-3xl font-bold"
              style={{
                color: 'var(--color-warning)',
              }}
            >
              {formatRating(summary.average_rating)}
            </p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  fill={
                    s <=
                    Math.round(
                      summary.average_rating
                    )
                      ? 'var(--color-warning)'
                      : 'none'
                  }
                  style={{
                    color:
                      s <=
                      Math.round(
                        summary.average_rating
                      )
                        ? 'var(--color-warning)'
                        : 'var(--color-text-muted)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Rating bars */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                summary.rating_breakdown?.[rating] ||
                0;
              const pct =
                summary.total > 0
                  ? (count / summary.total) * 100
                  : 0;
              return (
                <div
                  key={rating}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="w-3 text-right"
                    style={{
                      color:
                        'var(--color-text-muted)',
                    }}
                  >
                    {rating}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{
                      backgroundColor:
                        'var(--color-surface-elevated)',
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          'var(--color-warning)',
                      }}
                    />
                  </div>
                  <span
                    className="w-6 text-right"
                    style={{
                      color:
                        'var(--color-text-muted)',
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular tags */}
        {summary.popular_tags && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {Object.entries(summary.popular_tags)
              .filter(([_, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([tag, count]) => {
                const tagLabels = {
                  friendly: '😊 Friendly',
                  fast: '⚡ Fast',
                  accurate: '✅ Accurate',
                  great_comm:
                    '💬 Great Communication',
                  would_buy_again:
                    '🔄 Would Buy Again',
                  would_sell_again:
                    '🔄 Would Sell Again',
                };
                return (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor:
                        'var(--glass-bg-strong)',
                      color:
                        'var(--color-text-secondary)',
                      border:
                        '1px solid var(--color-border)',
                    }}
                  >
                    {tagLabels[tag] || tag} ({count}
                    )
                  </span>
                );
              })}
          </div>
        )}
      </Card>

      {/* Recent reviews */}
      {reviews.length > 0 && (
        <div className="space-y-2">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showProduct
            />
          ))}
        </div>
      )}
    </div>
  );
}