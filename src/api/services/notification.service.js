import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const NotificationService = {
  getAll: (params) =>
    api.get(API.NOTIFICATIONS.LIST, { params }).then((r) => r.data),

  markAsRead: (id) =>
    api.put(API.NOTIFICATIONS.READ(id)).then((r) => r.data),

  markAllAsRead: () =>
    api.put(API.NOTIFICATIONS.READ_ALL).then((r) => r.data),
};

export default NotificationService;