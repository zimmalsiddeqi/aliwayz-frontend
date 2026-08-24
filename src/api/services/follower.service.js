import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const FollowerService = {
  follow: (storeId) =>
    api.post(API.FOLLOWERS.FOLLOW(storeId), {}).then((r) => r.data),

  unfollow: (storeId) =>
    api.delete(API.FOLLOWERS.UNFOLLOW(storeId)).then((r) => r.data),

  getStoreFollowers: (storeId, params) =>
    api.get(API.FOLLOWERS.STORE_FOLLOWERS(storeId), { params }).then((r) => r.data),

  getMyStores: (params) =>
    api.get(API.FOLLOWERS.MY_STORES, { params }).then((r) => r.data),

  getStatus: (storeId) =>
    api.get(API.FOLLOWERS.STATUS(storeId)).then((r) => r.data),
};

export default FollowerService;