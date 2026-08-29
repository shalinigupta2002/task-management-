import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import { unwrapData, unwrapList } from "../utils/session";

const MOCK_DEFAULTS = [
  { id: "dept-1", departmentName: "Information Technology", departmentCode: "IT", description: "Manages IT infrastructure and software development", headName: "Rahul Verma", userCount: 42, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-2", departmentName: "Human Resources", departmentCode: "HR", description: "Employee relations, recruitment and HR policies", headName: "Priya Sharma", userCount: 18, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-3", departmentName: "Finance", departmentCode: "FIN", description: "Financial planning, accounting and budgeting", headName: "Amit Patel", userCount: 22, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-4", departmentName: "Compliance", departmentCode: "COMP", description: "Regulatory compliance and audit management", headName: "Anita Desai", userCount: 15, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-5", departmentName: "Operations", departmentCode: "OPS", description: "Day-to-day business operations and logistics", headName: "Vikram Singh", userCount: 28, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-6", departmentName: "Marketing", departmentCode: "MKT", description: "Brand management and marketing campaigns", headName: "Sneha Reddy", userCount: 12, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-7", departmentName: "Legal", departmentCode: "LEG", description: "Legal affairs and contract management", headName: "Arjun Mehta", userCount: 8, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-8", departmentName: "Customer Support", departmentCode: "CS", description: "Customer service and support operations", headName: "Kavita Nair", userCount: 20, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-9", departmentName: "Research & Development", departmentCode: "RND", description: "Product research and innovation", headName: "Deepa Iyer", userCount: 14, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-10", departmentName: "Administration", departmentCode: "ADM", description: "General administration and facilities", headName: "Rohan Gupta", userCount: 10, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-11", departmentName: "Quality Assurance", departmentCode: "QA", description: "Quality control and testing processes", headName: "Neha Joshi", userCount: 16, companyId: "mock-company", status: "ACTIVE" },
  { id: "dept-12", departmentName: "Legacy Systems", departmentCode: "LEG2", description: "Deprecated legacy system maintenance", headName: null, userCount: 0, companyId: "mock-company", status: "INACTIVE" },
];

const mock = createMockCrudService(STORAGE_KEYS.departments, MOCK_DEFAULTS, "dept");

/** Backfill list fields missing from older mock localStorage records. */
function enrichMockDepartment(item) {
  const template = MOCK_DEFAULTS.find(
    (d) => d.id === item.id || d.departmentCode === item.departmentCode
  );
  const merged = template ? { ...template, ...item } : { ...item };

  if (merged.description == null || merged.description === "") {
    merged.description = template?.description ?? null;
  }
  if (!merged.headName && template?.headName) {
    merged.headName = template.headName;
  }
  if (merged.userCount == null && template?.userCount != null) {
    merged.userCount = template.userCount;
  }

  return merged;
}

const apiCrud = {
  getAll: async (params) => unwrapList(await api.get(ENDPOINTS.departments, { params })),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.departments}/${id}`)),
  create: async (data) => unwrapData(await api.post(ENDPOINTS.departments, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.departments}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.departments}/${id}`)),
};

const mockAdapter = {
  getAll: async (params) => {
    const res = await mock.getAll(params);
    let items = (res.data || []).map(enrichMockDepartment);
    if (params?.companyId) {
      items = items.filter((d) => d.companyId === params.companyId || d.companyId === "mock-company");
    }
    if (params?.status) {
      items = items.filter((d) => d.status === params.status);
    }
    return { items, meta: undefined };
  },
  getById: async (id) => enrichMockDepartment((await mock.getById(id)).data),
  create: async (data) => (await mock.create(data)).data,
  update: async (id, data) => (await mock.update(id, data)).data,
  delete: async (id) => (await mock.delete(id)).data,
};

const departmentService = USE_MOCK_API ? mockAdapter : apiCrud;

export default departmentService;
