import { USE_MOCK_API } from "../constants/config";
import companyService from "./companyService";
import dashboardService from "./dashboardService";
import taskCategoryService from "./taskCategoryService";
import planService from "./planService";
import auditLogService from "./auditLogService";
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
    let plans = [];
    let auditLogs = [];
    let backendTaskStats = null;

    try {
      companies = unwrapList(await companyService.getAll({ limit: 200 }));
    } catch {
      companies = [];
    }

    try {
      categories = unwrapList(await taskCategoryService.getAll({ limit: 100 }));
    } catch {
      categories = [];
    }

    try {
      const planRes = await planService.getAll();
      plans = unwrapList(planRes?.data ?? planRes);
    } catch {
      plans = [];
    }

    try {
      auditLogs = unwrapList(await auditLogService.getAll({ limit: 100 }));
    } catch {
      auditLogs = [];
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
      plans,
      categories,
      auditLogs,
      backendTaskStats,
      filters,
    });

    return { success: true, data: report };
  },
};

export default superAdminReportsService;
