import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { unwrapData, unwrapList } from "../utils/session";

const apiCrud = {
  getAll: async (params) => unwrapList(await api.get(ENDPOINTS.messages, { params })),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.messages}/${id}`)),
  send: async (data) => unwrapData(await api.post(ENDPOINTS.messages, data)),
  create: async (data) => unwrapData(await api.post(ENDPOINTS.messages, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.messages}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.messages}/${id}`)),
  markRead: async (data) => unwrapData(await api.patch(`${ENDPOINTS.messages}/mark-read`, data)),
  getUnreadCount: async () => unwrapData(await api.get(`${ENDPOINTS.messages}/unread-count`)),
};

/** Mock adapter for USE_MOCK_API=true only — empty, never seeded with demo contacts */
const mock = {
  getAll: async () => ({ items: [], meta: { total: 0 } }),
  getById: async () => null,
  send: async () => { throw new Error("Mock messaging disabled"); },
  create: async () => { throw new Error("Mock messaging disabled"); },
  update: async () => null,
  delete: async () => null,
  markRead: async () => ({ unreadCount: 0 }),
  getUnreadCount: async () => ({ unreadCount: 0 }),
};

const messageService = USE_MOCK_API ? mock : apiCrud;

export default messageService;
