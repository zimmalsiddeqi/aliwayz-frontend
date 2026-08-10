import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const UserService = {
  getMe: () =>
    api.get(API.USERS.ME).then((r) => r.data),

  updateProfile: (data) =>
    api.put(API.USERS.UPDATE_PROFILE, data).then((r) => r.data),

  uploadAvatar: (formData) =>
    api.put(API.USERS.UPLOAD_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  updateLocation: (data) =>
    api.put(API.USERS.UPDATE_LOCATION, data).then((r) => r.data),

  updateRole: (data) =>
    api.put(API.USERS.UPDATE_ROLE, data).then((r) => r.data),

  updateFcmToken: (data) =>
    api.put(API.USERS.UPDATE_FCM_TOKEN, data).then((r) => r.data),

  getPurchases: (params) =>
    api.get(API.USERS.PURCHASES, { params }).then((r) => r.data),

  getFavorites: (params) =>
    api.get(API.USERS.FAVORITES, { params }).then((r) => r.data),

  getFollowing: (params) =>
    api.get(API.USERS.FOLLOWING, { params }).then((r) => r.data),

  getPublicProfile: (username) =>
    api.get(API.USERS.PUBLIC_PROFILE(username)).then((r) => r.data),

  deleteAccount: () =>
    api.delete(API.USERS.DELETE_ACCOUNT).then((r) => r.data),
};

export default UserService;