import api from "../api/axios";
import { USE_MOCK_API } from "../constants/config";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { STORAGE_KEYS } from "../constants/storageKeys";
import createMockCrudService from "./createMockCrudService";
import { unwrapData, unwrapList } from "../utils/session";
import { DEFAULT_SUB_ADMINS } from "../data/mainAdminData";

const DEFAULT_EMPLOYEES = DEFAULT_SUB_ADMINS.map((a) => ({
  id: a.id,
  fullName: a.fullName,
  email: a.email,
  phone: a.phone,
  department: a.department,
  departmentId: `dept-${a.department?.toLowerCase().slice(0, 3) || "hr"}`,
  role: "EMPLOYEE",
  roleName: "EMPLOYEE",
  status: a.status === "Active" ? "ACTIVE" : "INACTIVE",
}));

const mock = createMockCrudService(STORAGE_KEYS.employees, DEFAULT_EMPLOYEES, "emp");

/** Employee Management — always hits EMPLOYEE-only endpoint */
const apiCrud = {
  getAll: async (params) => {
    const { roleName: _ignoredRole, roleId: _ignoredRoleId, ...rest } = params || {};
    return unwrapList(await api.get(`${ENDPOINTS.users}/employees`, { params: rest }));
  },
  /** Generic user list (Admin Management) — role filter allowed */
  getUsers: async (params) => unwrapList(await api.get(ENDPOINTS.users, { params })),
  /** Main Admin User List — SUB_ADMIN + EMPLOYEE only (backend-enforced) */
  getManagedUsers: async (params) => unwrapList(await api.get(`${ENDPOINTS.users}/managed`, { params })),
  /** Authenticated current user profile */
  getMe: async () => unwrapData(await api.get(`${ENDPOINTS.users}/me`)),
  updateMe: async (data) => unwrapData(await api.patch(`${ENDPOINTS.users}/me`, data)),
  getById: async (id) => unwrapData(await api.get(`${ENDPOINTS.users}/${id}`)),
  create: async (data) => unwrapData(await api.post(`${ENDPOINTS.users}/employees`, data)),
  /** Main Admin — create Sub Admin (role forced SUB_ADMIN server-side) */
  createSubAdmin: async (data) => unwrapData(await api.post(`${ENDPOINTS.users}/sub-admins`, data)),
  /** Preview next auto-generated employee / sub-admin code */
  previewEmployeeCode: async (roleName = "EMPLOYEE") =>
    unwrapData(await api.get(`${ENDPOINTS.users}/employee-code-preview`, { params: { roleName } })),
  /** Generic user create (Admin Management) */
  createUser: async (data) => unwrapData(await api.post(ENDPOINTS.users, data)),
  update: async (id, data) => unwrapData(await api.patch(`${ENDPOINTS.users}/${id}`, data)),
  delete: async (id) => unwrapData(await api.delete(`${ENDPOINTS.users}/${id}`)),
};

const mockAdapter = {
  getAll: async (params) => {
    const res = await mock.getAll(params);
    let items = (res.data || []).filter(
      (e) => e.role === "EMPLOYEE" || e.roleName === "EMPLOYEE" || !e.role
    );
    if (params?.companyId) {
      items = items.filter((e) => !e.companyId || e.companyId === params.companyId);
    }
    if (params?.departmentId) {
      items = items.filter((e) => e.departmentId === params.departmentId);
    }
    if (params?.status) {
      const status = String(params.status).toUpperCase();
      items = items.filter((e) => String(e.status).toUpperCase() === status);
    }
    return { items, meta: { total: items.length } };
  },
  getUsers: async (params) => {
    const res = await mock.getAll(params);
    let items = res.data || [];
    if (params?.roleName) {
      items = items.filter((e) => e.role === params.roleName || e.roleName === params.roleName);
    }
    return { items, meta: undefined };
  },
  getManagedUsers: async (params) => {
    const res = await mock.getAll(params);
    let items = (res.data || []).filter((e) => {
      const r = e.role || e.roleName;
      return r === "SUB_ADMIN" || r === "EMPLOYEE" || !r;
    });
    if (params?.roleName) {
      items = items.filter((e) => e.role === params.roleName || e.roleName === params.roleName);
    }
    return { items, meta: { total: items.length } };
  },
  getMe: async () => {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  },
  updateMe: async (data) => {
    const current = await mockAdapter.getMe();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
    return updated;
  },
  getById: async (id) => (await mock.getById(id)).data,
  create: async (data) => (await mock.create(data)).data,
  createSubAdmin: async (data) => {
    const created = await mock.create({
      ...data,
      role: "SUB_ADMIN",
      roleName: "SUB_ADMIN",
      status: data.status || "ACTIVE",
    });
    return created.data;
  },
  previewEmployeeCode: async (roleName = "EMPLOYEE") => ({
    employeeId: `PREVIEW-${roleName === "SUB_ADMIN" ? "SA" : "EMP"}-001`,
    roleName,
  }),
  update: async (id, data) => (await mock.update(id, data)).data,
  delete: async (id) => (await mock.delete(id)).data,
};

const employeeService = USE_MOCK_API ? mockAdapter : apiCrud;

export default employeeService;
