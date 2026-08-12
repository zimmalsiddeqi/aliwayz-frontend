import { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@components/ui/Button';
import ReviewService from '@api/services/review.service';
import toast from '@lib/toast';

export default function ReviewPanel({ sellerId, productId, onComplete }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const qc = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: () => ReviewService.create({
      target_user_id: sellerId,
      product_id: productId,
      rating,
      comment
    }),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      qc.invalidateQueries({ queryKey: ['reviews'] });
      onComplete();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    }
  });

  return (
    <div className="mt-6 border border-[var(--color-border-subtle)] rounded-2xl p-6 bg-[var(--glass-bg)]">
      <h3 className="font-semibold text-lg text-center mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Rate the Seller
      </h3>
      <p className="text-sm text-center mb-4" style={{ color: 'var(--color-text-muted)' }}>
        How was your experience dealing with them?
      </p>

      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment (optional)..."
          className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-transparent p-3 text-sm outline-none focus:border-[var(--color-brand)]"
          rows={3}
        />

        <Button
          fullWidth
          disabled={!rating}
          isLoading={submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
}
