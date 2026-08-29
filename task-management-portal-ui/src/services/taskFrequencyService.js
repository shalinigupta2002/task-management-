import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import { unwrapData, unwrapList } from "../utils/session";

const MOCK_DEFAULTS = [
  { id: "freq-1", frequencyName: "Daily", daysInterval: 1, numberOfDays: 7, description: "Tasks occur every day", status: "ACTIVE" },
  { id: "freq-2", frequencyName: "Weekly", daysInterval: 7, numberOfDays: 7, description: "Tasks occur every week", status: "ACTIVE" },
  { id: "freq-3", frequencyName: "Monthly", daysInterval: 30, numberOfDays: 30, description: "Tasks occur every month", status: "ACTIVE" },
];

const mock = createMockCrudService(STORAGE_KEYS.taskFrequencies, MOCK_DEFAULTS, "FREQ");

const apiCrud = {
  getAll: async (params) => unwrapList(await api.get(ENDPOINTS.taskFrequency, { params })),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.taskFrequency}/${id}`)),
  create: async (data) => unwrapData(await api.post(ENDPOINTS.taskFrequency, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.taskFrequency}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.taskFrequency}/${id}`)),
};

const mockAdapter = {
  getAll: async (params) => {
    const res = await mock.getAll(params);
    return { items: res.data || [], meta: undefined };
  },
  getById: async (id) => (await mock.getById(id)).data,
  create: async (data) => (await mock.create({ status: "ACTIVE", ...data })).data,
  update: async (id, data) => (await mock.update(id, data)).data,
  delete: async (id) => (await mock.delete(id)).data,
};

const taskFrequencyService = USE_MOCK_API ? mockAdapter : apiCrud;

export default taskFrequencyService;
