import ReviewCard from '@components/cards/ReviewCard';
import EmptyState from '@components/common/EmptyState';
import Spinner from '@components/ui/Spinner';

export default function StoreReviews({ reviews, isLoading }) {
  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="md" /></div>;
  if (!reviews.length) return <EmptyState icon="⭐" title="No reviews yet" />;

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}