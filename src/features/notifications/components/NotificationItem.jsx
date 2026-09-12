import NotificationCard from '@components/cards/NotificationCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationService from '@api/services/notification.service';
import { queryKeys } from '@lib/queryClient';
import useNotificationStore from '@store/notification.store';

export default function NotificationItem({ notification, index, onDelete }) {
  const qc           = useQueryClient();
  const { markAsRead, deleteNotification } = useNotificationStore();

  const readMutation = useMutation({
    mutationFn: (id) => NotificationService.markAsRead(id),
    onSuccess:  (_, id) => {
      markAsRead(id);
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => NotificationService.delete(id),
    onSuccess: (_, id) => {
      deleteNotification(id);
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });

  return (
    <NotificationCard
      notification={notification}
      index={index}
      onRead={(id) => !notification.is_read && readMutation.mutate(id)}
      onDelete={(id) => (onDelete ? onDelete(id) : deleteMutation.mutate(id))}
    />
  );
}