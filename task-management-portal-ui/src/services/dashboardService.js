import api from "../api/axios";
import { USE_MOCK_API, MOCK_API_DELAY } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";

const delay = (ms = MOCK_API_DELAY) => new Promise((r) => setTimeout(r, ms));

const mockDashboard = {
  async getDashboard() {
    await delay();
    return {
      success: true,
      data: {
        totalTasks: 128,
        completedTasks: 94,
        pendingTasks: 34,
        overdueTasks: 5,
      },
    };
  },
  async getDashboardStats() {
    return this.getDashboard();
  },
  async getRecentTasks() {
    await delay();
    return { success: true, data: [] };
  },
  async getAdminDashboard() {
    return this.getDashboard();
  },
};

import { unwrapData } from "../utils/session";

const apiDashboard = {
  getDashboard: async (params) => unwrapData(await api.get(ENDPOINTS.dashboard, { params })),
  getDashboardStats: async (params) => unwrapData(await api.get(`${ENDPOINTS.dashboard}/stats`, { params })),
  getRecentTasks: async (params) => unwrapData(await api.get(`${ENDPOINTS.dashboard}/recent-tasks`, { params })),
  getAdminDashboard: async (params) => unwrapData(await api.get(`${ENDPOINTS.dashboard}/admin`, { params })),
  getSummary: async (params) => unwrapData(await api.get(ENDPOINTS.dashboard, { params })),
};

const dashboardService = USE_MOCK_API ? mockDashboard : apiDashboard;

export default dashboardService;
