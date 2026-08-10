import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const ReportService = {
  create: (data) =>
    api.post(API.REPORTS.CREATE, data).then((r) => r.data),

  getMyReports: (params) =>
    api.get(API.REPORTS.MY_LIST, { params }).then((r) => r.data),

  getAll: (params) =>
    api.get(API.REPORTS.LIST, { params }).then((r) => r.data),

  resolve: (id, data) =>
    api.put(API.REPORTS.RESOLVE(id), data).then((r) => r.data),
};

export default ReportService;