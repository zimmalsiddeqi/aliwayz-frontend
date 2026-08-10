import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { createReviewSchema } from '@lib/validators';
import ReviewService from '@api/services/review.service';
import Textarea from '@components/ui/Textarea';
import Button from '@components/ui/Button';
import { cn, getErrorMessage } from '@lib/utils';
import { BUYER_REVIEW_TAGS, SELLER_REVIEW_TAGS } from '@utils/constants';
import toast from '@lib/toast';

export default function ReviewForm({ transactionId, reviewerType, onSuccess }) {
  const qc   = useQueryClient();
  const tags = reviewerType === 'buyer' ? BUYER_REVIEW_TAGS : SELLER_REVIEW_TAGS;

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver:     zodResolver(createReviewSchema),
    defaultValues: {
      qr_transaction_id:    transactionId,
      rating:               0,
      comment:              '',
      tag_friendly:         false,
      tag_fast:             false,
      tag_accurate:         false,
      tag_great_comm:       false,
      tag_would_buy_again:  false,
      tag_would_sell_again: false,
    },
  });

  const rating = watch('rating');

  const mutation = useMutation({
    mutationFn: ReviewService.create,
    onSuccess:  () => {
      toast.success('Review submitted!');
      qc.invalidateQueries({ queryKey: ['reviews'] });
      onSuccess?.();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
      {/* Star Rating */}
      <div className="space-y-2">
        <label className="floating-label">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => setValue('rating', s, { shouldValidate: true })}
              className="p-1 rounded-lg transition-all"
            >
              <Star
                size={28}
                fill={s <= rating ? 'var(--color-warning)' : 'none'}
                style={{
                  color: s <= rating ? 'var(--color-warning)' : 'var(--color-border-strong)',
                  transition: 'all 0.15s',
                }}
              />
            </motion.button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>Please select a rating</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="floating-label">Tags (optional)</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Controller
              key={tag.key}
              name={tag.key}
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                  )}
                  style={{
                    backgroundColor: field.value ? 'var(--color-brand-glow)' : 'var(--color-surface-elevated)',
                    border: `1px solid ${field.value ? 'var(--color-brand)' : 'var(--color-border)'}`,
                    color: field.value ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                  }}
                >
                  {tag.emoji} {tag.label}
                </button>
              )}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <Textarea
        label="Comment (optional)"
        placeholder="Share your experience..."
        maxLength={1000}
        {...register('comment')}
      />

      <Button
        type="submit"
        fullWidth
        isLoading={mutation.isPending}
        loadingText="Submitting..."
        disabled={rating === 0}
      >
        Submit Review
      </Button>
    </form>
  );
}