import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const SearchService = {
  searchProducts: (params) =>
    api.get(API.SEARCH.PRODUCTS, { params }).then((r) => r.data),

  searchStores: (params) =>
    api.get(API.SEARCH.STORES, { params }).then((r) => r.data),

  getSuggestions: (params) =>
    api.get(API.SEARCH.SUGGESTIONS, { params }).then((r) => r.data),

  getPopular: () =>
    api.get(API.SEARCH.POPULAR).then((r) => r.data),

  getHistory: () =>
    api.get(API.SEARCH.HISTORY).then((r) => r.data),

  clearHistory: () =>
    api.delete(API.SEARCH.CLEAR_HISTORY).then((r) => r.data),
};

export default SearchService;