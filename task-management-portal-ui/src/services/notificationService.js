import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import { DEFAULT_NOTIFICATIONS } from "../data/superAdminData";

const mock = createMockCrudService(STORAGE_KEYS.notifications, DEFAULT_NOTIFICATIONS, "n");

import { unwrapData, unwrapList } from "../utils/session";

const apiCrud = {
  getAll: async (params) => unwrapList(await api.get(ENDPOINTS.notifications, { params })),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.notifications}/${id}`)),
  create: async (data) => unwrapData(await api.post(ENDPOINTS.notifications, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.notifications}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.notifications}/${id}`)),
  markRead: async (id) => unwrapData(await api.patch(`${ENDPOINTS.notifications}/${id}/read`)),
  markAllRead: async () => unwrapData(await api.patch(`${ENDPOINTS.notifications}/read-all`)),
  getCount: async () => unwrapData(await api.get(`${ENDPOINTS.notifications}/count`)),
};

const notificationService = USE_MOCK_API ? mock : apiCrud;

export default notificationService;
