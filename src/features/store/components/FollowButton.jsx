import { UserPlus, UserMinus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FollowerService from '@api/services/follower.service';
import { queryKeys } from '@lib/queryClient';
import Button from '@components/ui/Button';
import useAuthStore from '@store/auth.store';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function FollowButton({ storeSlug, storeId, ownerId }) {
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const isOwner = user?.id === ownerId;

  const { data: statusData } = useQuery({
    queryKey: ['follow-status', storeId],
    queryFn:  () => FollowerService.getStatus(storeId),
    enabled:  !!storeId && isAuthenticated && !isOwner,
  });

  const isFollowing = statusData?.data?.is_following || false;

  const mutation = useMutation({
    mutationFn: () => isFollowing ? FollowerService.unfollow(storeId) : FollowerService.follow(storeId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['follow-status', storeId] });
      qc.invalidateQueries({ queryKey: queryKeys.stores.bySlug(storeSlug) });
      toast.success(isFollowing ? 'Unfollowed' : 'Following!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isOwner || !isAuthenticated) return null;

  return (
    <Button
      variant={isFollowing ? 'outline' : 'brand'}
      size="md"
      isLoading={mutation.isPending}
      leftIcon={isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
      onClick={() => mutation.mutate()}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}