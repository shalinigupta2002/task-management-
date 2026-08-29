import api from "../api/axios";
import { USE_MOCK_API, MOCK_API_DELAY } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import createMockCrudService from "./createMockCrudService";

const delay = (ms = MOCK_API_DELAY) => new Promise((r) => setTimeout(r, ms));

const DEFAULT_REPORTS = [
  { id: "r-1", name: "Task Completion Report", type: "tasks", period: "Aug 2026", status: "Ready" },
  { id: "r-2", name: "Employee Performance", type: "employees", period: "Q3 2026", status: "Ready" },
];

const mock = {
  ...createMockCrudService("tm_reports", DEFAULT_REPORTS, "r"),
  async exportReport() {
    await delay();
    return { success: true, data: new Blob(["mock report"], { type: "text/csv" }) };
  },
};

const apiReport = {
  getAll: async (params) => (await api.get(ENDPOINTS.reports, { params })).data,
  getById: async (id) => (await api.get(`${ENDPOINTS.reports}/${id}`)).data,
  create: async (data) => (await api.post(ENDPOINTS.reports, data)).data,
  update: async (id, data) => (await api.put(`${ENDPOINTS.reports}/${id}`, data)).data,
  delete: async (id) => (await api.delete(`${ENDPOINTS.reports}/${id}`)).data,
  exportReport: async () => {
    const response = await api.get(`${ENDPOINTS.reports}/export`, { responseType: "blob" });
    return response.data;
  },
};

const reportService = USE_MOCK_API ? mock : apiReport;

/** Legacy aliases */
reportService.getAllReports = reportService.getAll;
reportService.getReportById = reportService.getById;
reportService.createReport = reportService.create;
reportService.updateReport = reportService.update;
reportService.deleteReport = reportService.delete;

export default reportService;
