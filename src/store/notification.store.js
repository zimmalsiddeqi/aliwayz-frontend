import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,

  setNotifications: (notifications, unreadCount) => {
    set({
      notifications,
      unreadCount:
        unreadCount !== undefined
          ? unreadCount
          : notifications.filter((n) => !n.is_read)
              .length,
    });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        notification,
        ...state.notifications,
      ],
      unreadCount:
        state.unreadCount +
        (notification.is_read ? 0 : 1),
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const notifications =
        state.notifications.map((n) =>
          n.id === notificationId
            ? {
                ...n,
                is_read: true,
                read_at:
                  new Date().toISOString(),
              }
            : n
        );
      return {
        notifications,
        unreadCount: notifications.filter(
          (n) => !n.is_read
        ).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(
        (n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })
      ),
      unreadCount: 0,
    }));
  },

  setUnreadCount: (count) =>
    set({ unreadCount: count }),

  reset: () =>
    set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;