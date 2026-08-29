import { USE_MOCK_API } from "../constants/config";
import companyService from "./companyService";
import dashboardService from "./dashboardService";
import {
  getPlans,
  getAuditLogs,
  getNotifications,
  getGlobalSettings,
} from "../utils/superAdminStorage";
import { buildSuperAdminDashboard } from "../utils/superAdminDashboard";

function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

/**
 * Loads Super Admin dashboard data.
 * Companies: companyService (mock CRUD or API).
 * Plans / audit / notifications: storage fallback until dedicated super-admin APIs exist.
 * Task breakdown: dashboardService when USE_MOCK_API is false; otherwise derived from tenant data.
 */
const superAdminDashboardService = {
  async getDashboard() {
    let companies = [];
    let backendTaskStats = null;

    try {
      const companiesRes = await companyService.getAll();
      companies = unwrapList(companiesRes);
    } catch {
      companies = [];
    }

    if (!USE_MOCK_API) {
      try {
        const dashRes = await dashboardService.getAdminDashboard();
        backendTaskStats = dashRes?.data ?? dashRes;
      } catch {
        backendTaskStats = null;
      }
    }

    const dashboard = buildSuperAdminDashboard({
      companies,
      plans: getPlans(),
      auditLogs: getAuditLogs(),
      notifications: getNotifications(),
      settings: getGlobalSettings(),
      backendTaskStats,
    });

    return { success: true, data: dashboard };
  },
};

export default superAdminDashboardService;
