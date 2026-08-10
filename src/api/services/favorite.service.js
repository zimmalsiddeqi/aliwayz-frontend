import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const FavoriteService = {
  getAll: (params) =>
    api.get(API.FAVORITES.LIST, { params }).then((r) => r.data),

  add: (productId) =>
    api.post(API.FAVORITES.ADD(productId)).then((r) => r.data),

  remove: (productId) =>
    api.delete(API.FAVORITES.REMOVE(productId)).then((r) => r.data),

  getStatus: (productId) =>
    api.get(API.FAVORITES.STATUS(productId)).then((r) => r.data),
};

export default FavoriteService;