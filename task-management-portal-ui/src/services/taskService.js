import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import { unwrapData, unwrapList } from "../utils/session";
import { DEFAULT_TASKS } from "../data/employeeData";

const mock = createMockCrudService(STORAGE_KEYS.tasks, DEFAULT_TASKS, "TSK");

/** In-flight dedupe only — do NOT cache list results. A 20s result cache hid
 * newly assigned tasks on Employee My Tasks after admin create (Founder E2E). */
let listInflight = null;

function invalidateTaskListCache() {
  listInflight = null;
}

const apiCrud = {
  getAll: async (params) => {
    const key = JSON.stringify(params || {});
    if (listInflight && listInflight.key === key) {
      return listInflight.promise;
    }
    // unwrapList is synchronous — do not call .then on its return value.
    const promise = (async () => {
      try {
        const data = unwrapList(await api.get(ENDPOINTS.tasks, { params }));
        return data;
      } finally {
        listInflight = null;
      }
    })();
    listInflight = { key, promise };
    return promise;
  },
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.tasks}/${id}`)),
  create: async (data) => {
    invalidateTaskListCache();
    return unwrapData(await api.post(ENDPOINTS.tasks, data));
  },
  update: async (id, data) => {
    invalidateTaskListCache();
    return unwrapData(await api.patch(`${ENDPOINTS.tasks}/${id}`, data));
  },
  delete: async (id) => {
    invalidateTaskListCache();
    return unwrapData(await api.delete(`${ENDPOINTS.tasks}/${id}`));
  },
  getDashboardStats: async (params) => unwrapData(await api.get(`${ENDPOINTS.tasks}/dashboard/stats`, { params })),
  assign: async (id, data) => {
    invalidateTaskListCache();
    return unwrapData(await api.post(`${ENDPOINTS.tasks}/${id}/assign`, data));
  },
  reassign: async (id, data) => {
    invalidateTaskListCache();
    return unwrapData(await api.post(`${ENDPOINTS.tasks}/${id}/reassign`, data));
  },
  changeStatus: async (id, data) => {
    invalidateTaskListCache();
    return unwrapData(await api.patch(`${ENDPOINTS.tasks}/${id}/status`, data));
  },
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
