import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const ChatService = {
  createConversation: (data) =>
    api.post(API.CONVERSATIONS.CREATE, data).then((r) => r.data),

  getConversations: (params) =>
    api.get(API.CONVERSATIONS.LIST, { params }).then((r) => r.data),

  getConversation: (id) =>
    api.get(API.CONVERSATIONS.BY_ID(id)).then((r) => r.data),

  getMessages: (id, params) =>
    api.get(API.CONVERSATIONS.MESSAGES(id), { params }).then((r) => r.data),

  archiveConversation: (id) =>
    api.delete(API.CONVERSATIONS.ARCHIVE(id)).then((r) => r.data),

  blockUser: (id) =>
    api.post(API.CONVERSATIONS.BLOCK(id), {}).then((r) => r.data),

  reportConversation: (id, data) =>
    api.post(API.CONVERSATIONS.REPORT(id), data).then((r) => r.data),
};

export default ChatService;