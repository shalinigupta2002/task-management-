import api from "../api/axios";
import { unwrapData } from "../utils/session";

const BASE = "/v1/task-occurrences";

const taskOccurrenceService = {
  getCalendar: async (params) => unwrapData(await api.get(`${BASE}/calendar`, { params })),
  getByTask: async (taskId) => unwrapData(await api.get(`${BASE}/task/${taskId}`)),
  updateProgress: async (id, data) => unwrapData(await api.patch(`${BASE}/${id}/progress`, data)),
  complete: async (id, data) => unwrapData(await api.post(`${BASE}/${id}/complete`, data || {})),
  approve: async (id) => unwrapData(await api.post(`${BASE}/${id}/approve`)),
  reject: async (id, data) => unwrapData(await api.post(`${BASE}/${id}/reject`, data)),
  resubmit: async (id) => unwrapData(await api.post(`${BASE}/${id}/resubmit`)),
};

export default taskOccurrenceService;
