import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) => {
    const list = Array.isArray(notifications) ? notifications : [];
    set({
      notifications: list,
      unreadCount:
        unreadCount !== undefined
          ? unreadCount
          : list.filter((n) => !n.is_read).length,
    });
  },

  addNotification: (notification) => {
    if (!notification) return;
    set((state) => {
      const list = Array.isArray(state.notifications) ? state.notifications : [];
      return {
        notifications: [notification, ...list],
        unreadCount: (state.unreadCount || 0) + (notification.is_read ? 0 : 1),
      };
    });
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const list = Array.isArray(state.notifications) ? state.notifications : [];
      const notifications = list.map((n) =>
        n.id === notificationId
          ? {
              ...n,
              is_read: true,
              read_at: new Date().toISOString(),
            }
          : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.is_read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const list = Array.isArray(state.notifications) ? state.notifications : [];
      const notifications = list.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      }));
      return {
        notifications,
        unreadCount: 0,
      };
    });
  },

  setUnreadCount: (count) => set({ unreadCount: count || 0 }),

  reset: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;