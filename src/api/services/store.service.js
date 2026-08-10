import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const StoreService = {
  // ✅ NEW: Get current user's store
  getMyStore: () =>
    api.get(API.STORES.MY).then((r) => r.data),

  create: (data) =>
    api.post(API.STORES.CREATE, data).then((r) => r.data),

  getBySlug: (slug) =>
    api.get(API.STORES.BY_SLUG(slug)).then((r) => r.data),

  update: (id, data) =>
    api.put(API.STORES.UPDATE(id), data).then((r) => r.data),

  uploadLogo: (id, formData) =>
    api.put(API.STORES.UPLOAD_LOGO(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  uploadBanner: (id, formData) =>
    api.put(API.STORES.UPLOAD_BANNER(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getProducts: (slug, params) =>
    api.get(API.STORES.PRODUCTS(slug), { params }).then((r) => r.data),

  getAnalytics: (id) =>
    api.get(API.STORES.ANALYTICS(id)).then((r) => r.data),

  follow: (slug) =>
    api.post(API.STORES.FOLLOW(slug)).then((r) => r.data),

  unfollow: (slug) =>
    api.delete(API.STORES.UNFOLLOW(slug)).then((r) => r.data),

  getFollowers: (id, params) =>
    api.get(API.STORES.FOLLOWERS(id), { params }).then((r) => r.data),

  delete: (id) =>
    api.delete(API.STORES.DELETE(id)).then((r) => r.data),
};

export default StoreService;