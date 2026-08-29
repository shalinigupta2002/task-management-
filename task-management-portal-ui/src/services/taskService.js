import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import { unwrapData, unwrapList } from "../utils/session";
import { DEFAULT_TASKS } from "../data/employeeData";

const mock = createMockCrudService(STORAGE_KEYS.tasks, DEFAULT_TASKS, "TSK");

const apiCrud = {
  getAll: async (params) => unwrapList(await api.get(ENDPOINTS.tasks, { params })),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.tasks}/${id}`)),
  create: async (data) => unwrapData(await api.post(ENDPOINTS.tasks, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.tasks}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.tasks}/${id}`)),
  getDashboardStats: async (params) => unwrapData(await api.get(`${ENDPOINTS.tasks}/dashboard/stats`, { params })),
  assign: async (id, data) => unwrapData(await api.post(`${ENDPOINTS.tasks}/${id}/assign`, data)),
  reassign: async (id, data) => unwrapData(await api.post(`${ENDPOINTS.tasks}/${id}/reassign`, data)),
  changeStatus: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.tasks}/${id}/status`, data)),
};

const mockAdapter = {
  getAll: async (params) => {
    const res = await mock.getAll(params);
    return { items: res.data || [], meta: undefined };
  },
  getById: async (id) => (await mock.getById(id)).data,
  create: async (data) => (await mock.create({
    ...data,
    category: data.categoryId,
    frequency: data.frequencyId,
    status: data.status || "Open",
    priority: data.priority || "Medium",
  })).data,
  update: async (id, data) => (await mock.update(id, data)).data,
  delete: async (id) => (await mock.delete(id)).data,
};

const taskService = USE_MOCK_API ? mockAdapter : apiCrud;

/** Legacy aliases for gradual migration */
taskService.getAllTasks = taskService.getAll;
taskService.getTaskById = taskService.getById;
taskService.createTask = taskService.create;
taskService.updateTask = taskService.update;
taskService.deleteTask = taskService.delete;

export default taskService;
