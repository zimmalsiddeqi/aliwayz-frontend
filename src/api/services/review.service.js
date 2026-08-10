import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const ReviewService = {
  create: (data) =>
    api.post(API.REVIEWS.CREATE, data).then((r) => r.data),

  getByUser: (userId, params) =>
    api.get(API.REVIEWS.BY_USER(userId), { params }).then((r) => r.data),

  getUserSummary: (userId) =>
    api.get(API.REVIEWS.USER_SUMMARY(userId)).then((r) => r.data),

  getUserWritten: (userId, params) =>
    api.get(API.REVIEWS.USER_WRITTEN(userId), { params }).then((r) => r.data),

  getByStore: (storeId, params) =>
    api.get(API.REVIEWS.BY_STORE(storeId), { params }).then((r) => r.data),
};

export default ReviewService;