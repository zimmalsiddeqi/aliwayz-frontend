import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const CategoryService = {
  getTree: () =>
    api.get(API.CATEGORIES.TREE).then((r) => r.data),

  getFlat: () =>
    api.get(API.CATEGORIES.FLAT).then((r) => r.data),

  getBySlug: (slug, params) =>
    api.get(API.CATEGORIES.BY_SLUG(slug), { params }).then((r) => r.data),

  create: (data) =>
    api.post(API.CATEGORIES.CREATE, data).then((r) => r.data),

  update: (id, data) =>
    api.put(API.CATEGORIES.UPDATE(id), data).then((r) => r.data),

  delete: (id) =>
    api.delete(API.CATEGORIES.DELETE(id)).then((r) => r.data),
};

export default CategoryService;