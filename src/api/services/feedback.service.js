import api from '@api/axios.instance';

const FeedbackService = {
  submit: (data) =>
    api.post('/feedback', data).then((r) => r.data),

  getAll: (params) =>
    api.get('/feedback', { params }).then((r) => r.data),

  update: (id, data) =>
    api.put(`/feedback/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/feedback/${id}`).then((r) => r.data),
};

export default FeedbackService;