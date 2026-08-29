import { USE_MOCK_API } from "../constants/config";
import companyService from "./companyService";
import dashboardService from "./dashboardService";
import taskCategoryService from "./taskCategoryService";
import { getPlans, getAuditLogs } from "../utils/superAdminStorage";
import { buildSuperAdminReports } from "../utils/superAdminReports";

function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

const superAdminReportsService = {
  async getReports(filters = {}) {
    let companies = [];
    let categories = [];
    let backendTaskStats = null;

    try {
      const companiesRes = await companyService.getAll();
      companies = unwrapList(companiesRes);
    } catch {
      companies = [];
    }

    try {
      const catRes = await taskCategoryService.getAll({ limit: 100 });
      categories = unwrapList(catRes);
    } catch {
      categories = [];
    }

    if (!USE_MOCK_API) {
      try {
        const dashRes = await dashboardService.getAdminDashboard();
        backendTaskStats = dashRes?.data ?? dashRes;
      } catch {
        backendTaskStats = null;
      }
    }

    const report = buildSuperAdminReports({
      companies,
      plans: getPlans(),
      categories,
      auditLogs: getAuditLogs(),
      backendTaskStats,
      filters,
    });

    return { success: true, data: report };
  },
};

export default superAdminReportsService;
