import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const WantedService = {
  create: (data) =>
    api.post(API.WANTED.CREATE, data).then((r) => r.data),

  browse: (params) =>
    api.get(API.WANTED.BROWSE, { params }).then((r) => r.data),

  getMyRequests: (params) =>
    api.get(API.WANTED.MY_REQUESTS, { params }).then((r) => r.data),

  getById: (id) =>
    api.get(API.WANTED.BY_ID(id)).then((r) => r.data),

  updateStatus: (id, status) =>
    api.patch(API.WANTED.UPDATE_STATUS(id), { status }).then((r) => r.data),

  submitMatch: (id, data) =>
    api.post(API.WANTED.SUBMIT_MATCH(id), data).then((r) => r.data),
};

export default WantedService;
