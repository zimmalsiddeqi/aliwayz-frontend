import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const VerificationService = {
  getStatus: () =>
    api.get(API.VERIFICATION.STATUS).then((r) => r.data),

  submitVerification: (formData) =>
    api.post(API.VERIFICATION.SUBMIT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};

export default VerificationService;
