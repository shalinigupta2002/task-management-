import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import { DEFAULT_COMPANIES } from "../data/superAdminData";
import { unwrapData, unwrapList } from "../utils/session";

const mock = createMockCrudService(STORAGE_KEYS.companies, DEFAULT_COMPANIES, "co");

const apiCrud = {
  getAll: async (params) => unwrapList(await api.get(ENDPOINTS.companies, { params })),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.companies}/${id}`)),
  create: async (data) => unwrapData(await api.post(ENDPOINTS.companies, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.companies}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.companies}/${id}`)),
};

const companyService = USE_MOCK_API ? mock : apiCrud;

export default companyService;
