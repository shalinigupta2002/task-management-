import { USE_MOCK_API } from "../constants/config";
import companyService from "./companyService";
import dashboardService from "./dashboardService";
import planService from "./planService";
import auditLogService from "./auditLogService";
import notificationService from "./notificationService";
import { buildSuperAdminDashboard } from "../utils/superAdminDashboard";

function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

/**
 * Super Admin dashboard — live APIs only when USE_MOCK_API is false.
 * Empty API results yield zeros/empty arrays (no storage demo fallback).
 */
const superAdminDashboardService = {
  async getDashboard() {
    let companies = [];
    let plans = [];
    let auditLogs = [];
    let notifications = [];
    let backendTaskStats = null;

    try {
      companies = unwrapList(await companyService.getAll({ limit: 200 }));
    } catch {
      companies = [];
    }

    try {
      const planRes = await planService.getAll();
      plans = unwrapList(planRes?.data ?? planRes);
    } catch {
      plans = [];
    }

    try {
      auditLogs = unwrapList(await auditLogService.getAll({ limit: 50 }));
    } catch {
      auditLogs = [];
    }

    try {
      const notifRes = await notificationService.getAll({ limit: 50 });
      notifications = unwrapList(notifRes?.items ?? notifRes);
    } catch {
      notifications = [];
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
      plans,
      auditLogs,
      notifications,
      settings: {},
      backendTaskStats,
    });

    return { success: true, data: dashboard };
  },
};

export default superAdminDashboardService;
