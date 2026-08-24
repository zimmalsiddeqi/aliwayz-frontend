import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const ProductService = {
  create: (data) =>
    api.post(API.PRODUCTS.CREATE, data).then((r) => r.data),

  browse: (params) =>
    api.get(API.PRODUCTS.BROWSE, { params }).then((r) => r.data),

  getTrending: () =>
    api.get(API.PRODUCTS.TRENDING).then((r) => r.data),

  getRecent: (params) =>
    api.get(API.PRODUCTS.RECENT, { params }).then((r) => r.data),

  getNearby: (params) =>
    api.get(API.PRODUCTS.NEARBY, { params }).then((r) => r.data),

  getRecommended: () =>
    api.get(API.PRODUCTS.RECOMMENDED).then((r) => r.data),

  getById: (id) =>
    api.get(API.PRODUCTS.BY_ID(id)).then((r) => r.data),

  update: (id, data) =>
    api.put(API.PRODUCTS.UPDATE(id), data).then((r) => r.data),

  updateStatus: (id, data) =>
    api.put(API.PRODUCTS.UPDATE_STATUS(id), data).then((r) => r.data),

  delete: (id) =>
    api.delete(API.PRODUCTS.DELETE(id)).then((r) => r.data),

  // ✅ FIX: Correct image upload with proper headers + timeout
  uploadImages: (id, formData) =>
    api.post(API.PRODUCTS.UPLOAD_IMAGES(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 min timeout for large uploads
      onUploadProgress: (progressEvent) => {
        const pct = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        // Could dispatch to a progress store here
        console.info(`Upload progress: ${pct}%`);
      },
    }).then((r) => r.data),

  deleteImage: (id, imageId) =>
    api.delete(API.PRODUCTS.DELETE_IMAGE(id, imageId)).then((r) => r.data),

  uploadVideo: (id, formData) =>
    api.post(API.PRODUCTS.UPLOAD_VIDEO(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 min for video
    }).then((r) => r.data),

  favorite: (id) =>
    api.post(API.PRODUCTS.FAVORITE(id), {}).then((r) => r.data),

  unfavorite: (id) =>
    api.delete(API.PRODUCTS.UNFAVORITE(id)).then((r) => r.data),
};

export default ProductService;