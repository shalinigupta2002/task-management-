import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import departmentService from "./departmentService";
import { normalizeCategoryCode, unwrapData, unwrapList } from "../utils/session";

const MOCK_DEFAULTS = [
  {
    id: "cat-1",
    categoryName: "Compliance",
    categoryCode: "COMP",
    description: "Regulatory and compliance related tasks",
    status: "ACTIVE",
    companyId: "mock-company",
    departmentId: "dept-4",
    _count: { tasks: 6 },
    department: { id: "dept-4", departmentName: "Compliance", departmentCode: "COMP" },
  },
];

const mock = createMockCrudService(STORAGE_KEYS.taskCategories, MOCK_DEFAULTS, "CAT");

function loadMockItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.taskCategories);
    return raw ? JSON.parse(raw) : [...MOCK_DEFAULTS];
  } catch {
    return [...MOCK_DEFAULTS];
  }
}

function assertUniqueCode(items, companyId, categoryCode, excludeId) {
  const normalized = normalizeCategoryCode(categoryCode);
  const duplicate = items.find(
    (item) =>
      item.id !== excludeId
      && (item.companyId === companyId || (!item.companyId && companyId === "mock-company"))
      && normalizeCategoryCode(item.categoryCode) === normalized
  );
  if (duplicate) {
    const err = new Error("Category code already exists for this company");
    err.status = 409;
    throw err;
  }
}

async function enrichDepartments(items, params = {}) {
  const deptRes = await departmentService.getAll(params);
  const deptMap = Object.fromEntries((deptRes.items || []).map((d) => [d.id, d]));
  return items.map((item) => ({
    ...item,
    department: item.departmentId ? deptMap[item.departmentId] || item.department : item.department,
  }));
}

const apiCrud = {
  getAll: async (params) => unwrapList(await api.get(ENDPOINTS.taskCategories, { params })),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.taskCategories}/${id}`)),
  create: async (data) => unwrapData(await api.post(ENDPOINTS.taskCategories, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.taskCategories}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.taskCategories}/${id}`)),
};

const mockAdapter = {
  getAll: async (params) => {
    const res = await mock.getAll(params);
    const items = await enrichDepartments(res.data || [], params);
    return { items, meta: undefined };
  },
  getById: async (id) => {
    const item = (await mock.getById(id)).data;
    const [enriched] = await enrichDepartments([item]);
    return enriched;
  },
  create: async (data) => {
    const companyId = data.companyId || "mock-company";
    const categoryCode = normalizeCategoryCode(data.categoryCode);
    if (!categoryCode) {
      const err = new Error("Category code is required");
      err.status = 400;
      throw err;
    }
    const items = loadMockItems();
    assertUniqueCode(items, companyId, categoryCode);
    const created = (
      await mock.create({
        ...data,
        companyId,
        categoryCode,
        departmentId: data.departmentId || null,
      })
    ).data;
    const [enriched] = await enrichDepartments([created], { companyId });
    return enriched;
  },
  update: async (id, data) => {
    const items = loadMockItems();
    const existing = items.find((i) => i.id === id);
    if (!existing) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    if (data.categoryCode != null) {
      const categoryCode = normalizeCategoryCode(data.categoryCode);
      if (!categoryCode) {
        const err = new Error("Category code is required");
        err.status = 400;
        throw err;
      }
      assertUniqueCode(items, existing.companyId || "mock-company", categoryCode, id);
      data = { ...data, categoryCode };
    }
    const updated = (await mock.update(id, {
      ...data,
      ...(data.departmentId !== undefined ? { departmentId: data.departmentId || null } : {}),
    })).data;
    const [enriched] = await enrichDepartments([updated], { companyId: existing.companyId || "mock-company" });
    return enriched;
  },
  delete: async (id) => (await mock.delete(id)).data,
};

const taskCategoryService = USE_MOCK_API ? mockAdapter : apiCrud;

export default taskCategoryService;
