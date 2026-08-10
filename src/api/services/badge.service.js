import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const BadgeService = {
  getAll: () =>
    api.get(API.BADGES.ALL).then((r) => r.data),

  getUserBadges: (userId) =>
    api.get(API.BADGES.USER(userId)).then((r) => r.data),

  getProgress: () =>
    api.get(API.BADGES.PROGRESS).then((r) => r.data),

  getHistory: (userId) =>
    api.get(API.BADGES.HISTORY(userId)).then((r) => r.data),

  triggerEvaluation: (userId) =>
    api.post(API.BADGES.EVALUATE(userId)).then((r) => r.data),
};

export default BadgeService;