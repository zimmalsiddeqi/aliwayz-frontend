import { useQuery } from '@tanstack/react-query';
import ReviewCard from '@components/cards/ReviewCard';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import ReviewService from '@api/services/review.service';
import { queryKeys } from '@lib/queryClient';

export default function ReviewsList({ userId, showProduct = true }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.reviews.user(userId),
    queryFn:  () => ReviewService.getByUser(userId, { page: 1, limit: 20 }),
    enabled:  !!userId,
  });

  const reviews = data?.data || [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="md" /></div>;
  if (!reviews.length) return <EmptyState icon="⭐" title="No reviews yet" />;

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} showProduct={showProduct} />
      ))}
    </div>
  );
}