import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const AdminService = {
  getDashboard: () =>
    api.get(API.ADMIN.DASHBOARD).then((r) => r.data),

  getUsers: (params) =>
    api.get(API.ADMIN.USERS, { params }).then((r) => r.data),

  getUserDetail: (id) =>
    api.get(API.ADMIN.USER_DETAIL(id)).then((r) => r.data),

  updateUserStatus: (id, data) =>
    api.put(API.ADMIN.USER_STATUS(id), data).then((r) => r.data),

  deleteUser: (id) =>
    api.delete(API.ADMIN.DELETE_USER(id)).then((r) => r.data),

  getStores: (params) =>
    api.get(API.ADMIN.STORES, { params }).then((r) => r.data),

  verifyStore: (id, data) =>
    api.put(API.ADMIN.VERIFY_STORE(id), data).then((r) => r.data),

  getProducts: (params) =>
    api.get(API.ADMIN.PRODUCTS, { params }).then((r) => r.data),

  featureProduct: (id, data) =>
    api.put(API.ADMIN.FEATURE_PRODUCT(id), data).then((r) => r.data),

  deleteProduct: (id, data) =>
    api.delete(API.ADMIN.DELETE_PRODUCT(id), { data }).then((r) => r.data),

  getReports: (params) =>
    api.get(API.ADMIN.REPORTS, { params }).then((r) => r.data),

  resolveReport: (id, data) =>
    api.put(API.ADMIN.RESOLVE_REPORT(id), data).then((r) => r.data),

  sendBroadcast: (data) =>
    api.post(API.ADMIN.BROADCAST, data).then((r) => r.data),

  getLogs: (params) =>
    api.get(API.ADMIN.LOGS, { params }).then((r) => r.data),
};

export default AdminService;