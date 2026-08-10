import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const QRService = {
  generate: (data) =>
    api.post(API.QR.GENERATE, data).then((r) => r.data),

  scan: (data) =>
    api.post(API.QR.SCAN, data).then((r) => r.data),

  cancel: (data) =>
    api.post(API.QR.CANCEL, data).then((r) => r.data),

  regenerate: (data) =>
    api.post(API.QR.REGENERATE, data).then((r) => r.data),

  getStatus: (productId) =>
    api.get(API.QR.STATUS(productId)).then((r) => r.data),
};

export default QRService;