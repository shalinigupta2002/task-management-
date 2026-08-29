/**
 * Super Admin Reports — platform analytics computed from tenant data.
 * Replace mock/fallback sections when dedicated report APIs are available.
 */
import {
  formatINR,
  computeTaskStats,
} from "./superAdminDashboard";

export { formatINR };

export const DATE_PRESET_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "last7", label: "Last 7 Days" },
  { id: "last30", label: "Last 30 Days" },
  { id: "last3m", label: "Last 3 Months" },
  { id: "last6m", label: "Last 6 Months" },
  { id: "thisYear", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function getDateRangeBounds(preset, customStart, customEnd) {
  const now = new Date();
  const to = endOfDay(now);
  let from = startOfDay(now);

  switch (preset) {
    case "today":
      break;
    case "last7":
      from = startOfDay(new Date(now.getTime() - 6 * 86400000));
      break;
    case "last30":
      from = startOfDay(new Date(now.getTime() - 29 * 86400000));
      break;
    case "last3m":
      from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
      break;
    case "last6m":
      from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()));
      break;
    case "thisYear":
      from = startOfDay(new Date(now.getFullYear(), 0, 1));
      break;
    case "custom":
      from = customStart ? startOfDay(new Date(customStart)) : from;
      return { from, to: customEnd ? endOfDay(new Date(customEnd)) : to };
    default:
      from = startOfDay(new Date(now.getTime() - 29 * 86400000));
  }
  return { from, to };
}

function daysInRange(from, to) {
  return Math.max(1, Math.ceil((to - from) / 86400000));
}

function getPlanPrice(plans, planId) {
  return plans.find((p) => p.id === planId)?.price || 0;
}

function countTotalUsers(companies) {
  return companies.reduce((sum, c) => sum + (c.employees || 0) + (c.mainAdmin ? 1 : 0) + (c.subAdmins?.length || 0), 0);
}

function daysUntil(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  const today = startOfDay(new Date());
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
}

function companyExistsInPeriod(company, from, to) {
  const created = parseDate(company.createdAt);
  if (!created) return true;
  return created <= to;
}

function companyCreatedInPeriod(company, from, to) {
  const created = parseDate(company.createdAt);
  if (!created) return false;
  return created >= from && created <= to;
}

function periodRevenue(companies, plans, from, to) {
  const months = daysInRange(from, to) / 30;
  return companies
    .filter((c) => c.status === "Active" && companyExistsInPeriod(c, from, to))
    .reduce((sum, c) => sum + getPlanPrice(plans, c.planId) * months, 0);
}

function buildRevenueSeries(companies, plans, monthCount, endDate) {
  const series = [];
  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    const revenue = companies
      .filter((c) => {
        const created = parseDate(c.createdAt);
        return c.status === "Active" && created && created <= monthEnd;
      })
      .reduce((s, c) => s + getPlanPrice(plans, c.planId), 0);
    series.push({ month: label, revenue: Math.round(revenue) });
  }
  return series;
}

function buildCompanyGrowthSeries(companies, monthCount, endDate) {
  const series = [];
  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = d.toLocaleString("en-IN", { month: "short" });
    const total = companies.filter((c) => {
      const created = parseDate(c.createdAt);
      return created && created <= monthEnd;
    }).length;
    const newly = companies.filter((c) => {
      const created = parseDate(c.createdAt);
      return created && created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    }).length;
    series.push({ month: label, total, newly });
  }
  return series;
}

function computeCompanyTaskStats(company) {
  const total = company.tasks || 0;
  const samples = company.companyTasks || [];
  if (samples.length === 0) {
    const completed = Math.round(total * 0.35);
    const overdue = Math.round(total * 0.08);
    const inProgress = Math.round(total * 0.32);
    const pending = Math.max(0, total - completed - overdue - inProgress);
    return { total, completed, pending, overdue, inProgress, open: pending };
  }
  const counts = { Open: 0, "In Progress": 0, Completed: 0, Overdue: 0 };
  samples.forEach((t) => {
    const k = counts[t.status] !== undefined ? t.status : "Open";
    counts[k] += 1;
  });
  const sampleTotal = samples.length;
  const completed = Math.round((counts.Completed / sampleTotal) * total);
  const overdue = Math.round((counts.Overdue / sampleTotal) * total);
  const inProgress = Math.round((counts["In Progress"] / sampleTotal) * total);
  const pending = Math.max(0, total - completed - overdue - inProgress);
  return { total, completed, pending, overdue, inProgress, open: pending };
}

function buildCategoryAnalytics(categories, taskStats) {
  if (!categories.length) return [];
  const totalTasks = taskStats.total || 0;
  const perCat = Math.floor(totalTasks / categories.length);
  let remainder = totalTasks - perCat * categories.length;

  return categories.map((cat) => {
    const count = perCat + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    const completed = Math.round(count * (taskStats.completed / (taskStats.total || 1)));
    const pending = count - completed;
    const pct = count ? Math.round((completed / count) * 100) : 0;
    return {
      id: cat.id,
      name: cat.categoryName || cat.name || "Category",
      total: count,
      completed,
      pending,
      pct,
    };
  });
}

function buildPriorityAnalytics(taskStats) {
  const total = taskStats.total || 0;
  const ratios = { High: 0.28, Medium: 0.42, Low: 0.3 };
  const completedRatio = total ? taskStats.completed / total : 0;

  return ["High", "Medium", "Low"].map((priority) => {
    const count = Math.round(total * ratios[priority]);
    const completed = Math.round(count * completedRatio);
    return { priority, total: count, completed, pending: count - completed };
  });
}

export function buildSuperAdminReports({
  companies = [],
  plans = [],
  categories = [],
  auditLogs = [],
  settings: _settings = {},
  backendTaskStats = null,
  filters = {},
}) {
  const { datePreset = "last30", customStart, customEnd, companyId, planId } = filters;
  const { from, to } = getDateRangeBounds(datePreset, customStart, customEnd);
  const rangeDays = daysInRange(from, to);
  const prevTo = new Date(from.getTime() - 86400000);
  const prevFrom = new Date(prevTo.getTime() - (rangeDays - 1) * 86400000);

  let filtered = [...companies];
  if (companyId) filtered = filtered.filter((c) => c.id === companyId);
  if (planId) filtered = filtered.filter((c) => c.planId === planId);

  const active = filtered.filter((c) => c.status === "Active");
  const suspended = filtered.filter((c) => c.status === "Suspended");
  const trial = filtered.filter((c) => c.subscriptionStatus === "Trial" || c.status === "Trial");
  const pending = filtered.filter((c) => c.status === "Pending");
  const newlyRegistered = filtered.filter((c) => companyCreatedInPeriod(c, from, to));

  const currentRevenue = Math.round(periodRevenue(filtered, plans, from, to));
  const previousRevenue = Math.round(periodRevenue(filtered, plans, prevFrom, prevTo));
  const revenueGrowth = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const mrr = active.reduce((s, c) => s + getPlanPrice(plans, c.planId), 0);
  const taskStats = computeTaskStats(filtered, backendTaskStats);
  const completionRate = taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  const overdueRate = taskStats.total ? Math.round((taskStats.overdue / taskStats.total) * 100) : 0;

  const totalCompanies = filtered.length;
  const statusBreakdown = [
    { status: "Active", count: active.length, pct: totalCompanies ? Math.round((active.length / totalCompanies) * 100) : 0 },
    { status: "Suspended", count: suspended.length, pct: totalCompanies ? Math.round((suspended.length / totalCompanies) * 100) : 0 },
    { status: "Trial", count: trial.length, pct: totalCompanies ? Math.round((trial.length / totalCompanies) * 100) : 0 },
    { status: "Pending", count: pending.length, pct: totalCompanies ? Math.round((pending.length / totalCompanies) * 100) : 0 },
  ].filter((s) => s.count > 0 || s.status === "Active");

  const planDistribution = plans.map((plan) => {
    const subs = filtered.filter((c) => c.planId === plan.id);
    const activeSubs = subs.filter((c) => c.status === "Active");
    const revenue = activeSubs.length * (plan.monthlyPrice ?? (plan.price || 0));
    return {
      id: plan.id,
      name: plan.name,
      companies: subs.length,
      activeSubscriptions: activeSubs.length,
      pct: totalCompanies ? Math.round((subs.length / totalCompanies) * 100) : 0,
      revenue,
      price: plan.monthlyPrice ?? (plan.price || 0),
      enabled: plan.enabled !== false,
    };
  });

  const totalPlanRevenue = planDistribution.reduce((s, p) => s + p.revenue, 0);
  const revenueByPlan = planDistribution.map((p) => ({
    ...p,
    revenuePct: totalPlanRevenue ? Math.round((p.revenue / totalPlanRevenue) * 100) : 0,
  }));

  const expiringSoon = filtered.filter((c) => {
    const days = daysUntil(c.subscriptionExpiry);
    return days !== null && days >= 0 && days <= 30;
  });
  const expired = filtered.filter((c) => {
    const days = daysUntil(c.subscriptionExpiry);
    return days !== null && days < 0;
  });

  const subscriptionStatus = [
    { status: "Active", count: active.length },
    { status: "Expiring Soon", count: expiringSoon.length },
    { status: "Expired", count: expired.length },
    { status: "Suspended", count: suspended.length },
  ].filter((s) => s.count > 0);

  const mainAdminCount = filtered.filter((c) => c.mainAdmin).length;
  const subAdminCount = filtered.reduce((s, c) => s + (c.subAdmins?.length || 0), 0);
  const employeeCount = filtered.reduce((s, c) => s + (c.employees || 0), 0);

  const userRoles = [
    { role: "Super Admin", count: 1 },
    { role: "Main Admin", count: mainAdminCount },
    { role: "Sub Admin", count: subAdminCount },
    { role: "Employee", count: employeeCount },
  ];

  let activeUsers = 1;
  let inactiveUsers = 0;
  filtered.forEach((c) => {
    if (c.mainAdmin) {
      if (c.mainAdmin.status === "Inactive") inactiveUsers += 1;
      else activeUsers += 1;
    }
    (c.companyEmployees || []).forEach((e) => {
      if (e.status === "Inactive") inactiveUsers += 1;
      else activeUsers += 1;
    });
  });

  const companyPerformance = filtered.map((c) => {
    const ts = computeCompanyTaskStats(c);
    const pct = ts.total ? Math.round((ts.completed / ts.total) * 100) : 0;
    return {
      id: c.id,
      name: c.name,
      plan: c.planName || "—",
      employees: c.employees || 0,
      totalTasks: ts.total,
      completedTasks: ts.completed,
      pendingTasks: ts.pending,
      overdueTasks: ts.overdue,
      completionPct: pct,
      status: c.status,
    };
  });

  const topCompanies = [...companyPerformance]
    .filter((c) => c.totalTasks > 0)
    .sort((a, b) => b.completionPct - a.completionPct || b.completedTasks - a.completedTasks)
    .slice(0, 5)
    .map((c, i) => ({ rank: i + 1, ...c }));

  const attentionIds = new Set();
  const attentionList = [];
  [...expiringSoon, ...expired, ...suspended].forEach((c) => {
    if (attentionIds.has(c.id)) return;
    attentionIds.add(c.id);
    attentionList.push(c);
  });

  const subscriptionsAttention = attentionList.slice(0, 10).map((c) => {
      const days = daysUntil(c.subscriptionExpiry);
      let status = c.status;
      if (c.status === "Suspended") status = "Suspended";
      else if (days !== null && days < 0) status = "Expired";
      else if (days !== null && days <= 30) status = "Expiring Soon";
      return {
        id: c.id,
        name: c.name,
        plan: c.planName || "—",
        expiry: c.subscriptionExpiry || "—",
        status,
      };
    });

  const activities = auditLogs.slice(0, 10).map((log) => ({
    id: log.id,
    description: log.action,
    entity: log.entity,
    user: log.user,
    time: log.date,
    type: /suspend|expir/i.test(log.action) ? "warning" : /activ|creat|renew/i.test(log.action) ? "success" : "info",
  }));

  const monthCount = datePreset === "last6m" || datePreset === "thisYear" ? 6 : 6;
  const revenueSeries = buildRevenueSeries(filtered, plans, monthCount, to);
  const companyGrowthSeries = buildCompanyGrowthSeries(filtered, monthCount, to);

  const categoryList = categories.length
    ? categories
    : [...new Set(filtered.flatMap((c) => c.departments || []))].map((name, i) => ({ id: `dept-${i}`, categoryName: name }));

  const categoryAnalytics = buildCategoryAnalytics(categoryList, taskStats);
  const priorityAnalytics = buildPriorityAnalytics(taskStats);

  const taskChartData = [
    { name: "Open", value: taskStats.open, color: "#F97316" },
    { name: "In Progress", value: taskStats.inProgress, color: "#2563EB" },
    { name: "Completed", value: taskStats.completed, color: "#16A34A" },
    { name: "Overdue", value: taskStats.overdue, color: "#DC2626" },
  ];

  const planPieData = planDistribution.filter((p) => p.companies > 0).map((p) => ({
    name: p.name,
    value: p.companies,
  }));

  return {
    filters: { from, to, datePreset, companyId, planId },
    overview: {
      totalRevenue: currentRevenue,
      totalRevenueFormatted: formatINR(currentRevenue),
      mrr,
      mrrFormatted: formatINR(mrr),
      activeCompanies: active.length,
      totalCompanies: filtered.length,
      totalUsers: countTotalUsers(filtered) + 1,
      totalEmployees: employeeCount,
      totalTasks: taskStats.total,
      completionRate,
      completionRateLabel: `${completionRate}%`,
      overdueRate,
    },
    revenue: {
      current: currentRevenue,
      previous: previousRevenue,
      growth: revenueGrowth,
      growthLabel: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      currentFormatted: formatINR(currentRevenue),
      previousFormatted: formatINR(previousRevenue),
      series: revenueSeries,
    },
    company: {
      total: filtered.length,
      active: active.length,
      suspended: suspended.length,
      trial: trial.length,
      newlyRegistered: newlyRegistered.length,
      statusBreakdown,
      growthSeries: companyGrowthSeries,
    },
    subscription: {
      planDistribution,
      planPieData,
      subscriptionStatus,
      revenueByPlan,
    },
    users: {
      roles: userRoles,
      activeUsers,
      inactiveUsers,
      newUsers: newlyRegistered.length,
    },
    tasks: {
      stats: taskStats,
      chartData: taskChartData,
      completionRate,
      overdueRate,
      categoryAnalytics,
      priorityAnalytics,
    },
    companyPerformance,
    topCompanies,
    subscriptionsAttention,
    activities,
    exportRows: buildExportRows({
      overview: { totalRevenue: currentRevenue, mrr, activeCompanies: active.length, totalCompanies: filtered.length, totalUsers: countTotalUsers(filtered) + 1, totalEmployees: employeeCount, totalTasks: taskStats.total, completionRate },
      companyPerformance,
      revenueByPlan,
    }),
  };
}

function buildExportRows({ overview, companyPerformance, revenueByPlan }) {
  const rows = [
    ["Super Admin Platform Report"],
    ["Generated", new Date().toLocaleString("en-IN")],
    [],
    ["Overview Metric", "Value"],
    ["Total Revenue (Period)", overview.totalRevenue],
    ["MRR", overview.mrr],
    ["Active Companies", overview.activeCompanies],
    ["Total Companies", overview.totalCompanies],
    ["Total Users", overview.totalUsers],
    ["Total Employees", overview.totalEmployees],
    ["Total Tasks", overview.totalTasks],
    ["Completion Rate %", overview.completionRate],
    [],
    ["Company Performance"],
    ["Company", "Plan", "Employees", "Total Tasks", "Completed", "Pending", "Overdue", "Completion %", "Status"],
    ...companyPerformance.map((c) => [c.name, c.plan, c.employees, c.totalTasks, c.completedTasks, c.pendingTasks, c.overdueTasks, c.completionPct, c.status]),
    [],
    ["Revenue by Plan"],
    ["Plan", "Subscribers", "Price", "Revenue", "Revenue %"],
    ...revenueByPlan.map((p) => [p.name, p.companies, p.price, p.revenue, p.revenuePct]),
  ];
  return rows;
}

export function downloadReportCsv(rows, filename = "taskflow-platform-report") {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printReport() {
  window.print();
}
