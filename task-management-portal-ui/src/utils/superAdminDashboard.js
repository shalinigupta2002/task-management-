/** Platform dashboard metrics — replace mock sections when backend endpoints are wired. */

export function formatINR(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString("en-IN")}`;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysUntil(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function countTotalUsers(companies) {
  return companies.reduce((sum, c) => {
    const admins = c.mainAdmin ? 1 : 0;
    const subAdmins = (c.subAdmins || []).length;
    return sum + (c.employees || 0) + admins + subAdmins;
  }, 0);
}

function getPlanPrice(plans, planId) {
  const plan = plans.find((p) => p.id === planId);
  return plan?.price || 0;
}

/** Task stats: prefers backend payload; falls back to tenant task totals + sample breakdown. */
export function computeTaskStats(companies, backendStats) {
  if (backendStats && typeof backendStats.totalTasks === "number") {
    const total = backendStats.totalTasks;
    const completed = backendStats.completedTasks ?? 0;
    const overdue = backendStats.overdueTasks ?? 0;
    const pending = backendStats.pendingTasks ?? 0;
    const inProgress = backendStats.inProgressTasks ?? Math.max(0, total - completed - overdue - pending);
    return { total, open: pending, inProgress, completed, overdue, pendingAndProgress: pending + inProgress };
  }

  const total = companies.reduce((s, c) => s + (c.tasks || 0), 0);
  const samples = companies.flatMap((c) => c.companyTasks || []);
  const counts = { Open: 0, "In Progress": 0, Completed: 0, Overdue: 0 };
  samples.forEach((t) => {
    const key = counts[t.status] !== undefined ? t.status : "Open";
    counts[key] += 1;
  });

  const sampleTotal = samples.length || 1;
  let open = Math.round((counts.Open / sampleTotal) * total);
  let inProgress = Math.round((counts["In Progress"] / sampleTotal) * total);
  let completed = Math.round((counts.Completed / sampleTotal) * total);
  let overdue = Math.max(0, total - open - inProgress - completed);

  return {
    total,
    open,
    inProgress,
    completed,
    overdue,
    pendingAndProgress: open + inProgress,
  };
}

export function buildSuperAdminDashboard({ companies = [], plans = [], auditLogs = [], notifications = [], settings = {}, backendTaskStats = null }) {
  const activeCompanies = companies.filter((c) => c.status === "Active");
  const suspendedCompanies = companies.filter((c) => c.status === "Suspended");
  const pendingCompanies = companies.filter((c) => c.status === "Pending");
  const trialCompanies = companies.filter((c) => c.subscriptionStatus === "Trial" || c.status === "Trial");

  const trialDays = Number(settings.trialDays) || 14;
  const trialByAge = companies.filter((c) => {
    const created = parseDate(c.createdAt);
    if (!created || c.status !== "Active") return false;
    const ageDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return ageDays <= trialDays;
  });

  const expiringSoon = companies.filter((c) => {
    const days = daysUntil(c.subscriptionExpiry);
    return days !== null && days >= 0 && days <= 30 && c.status === "Active";
  });

  const expiredSubscriptions = companies.filter((c) => {
    const days = daysUntil(c.subscriptionExpiry);
    return days !== null && days < 0;
  });

  const monthlyRevenue = activeCompanies.reduce((sum, c) => sum + getPlanPrice(plans, c.planId), 0);
  const monthsActiveEstimate = activeCompanies.reduce((sum, c) => {
    const created = parseDate(c.createdAt);
    if (!created) return sum + 6;
    const months = Math.max(1, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return sum + months;
  }, 0);
  const totalRevenue = activeCompanies.reduce((sum, c) => {
    const price = getPlanPrice(plans, c.planId);
    const created = parseDate(c.createdAt);
    const months = created ? Math.max(1, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 6;
    return sum + price * months;
  }, 0);

  const taskStats = computeTaskStats(companies, backendTaskStats);

  const planDistribution = plans.map((plan) => {
    const subscribed = companies.filter((c) => c.planId === plan.id);
    const revenue = subscribed.filter((c) => c.status === "Active").length * (plan.monthlyPrice ?? (plan.price || 0));
    return {
      id: plan.id,
      name: plan.name,
      companies: subscribed.length,
      revenue,
      enabled: plan.enabled !== false,
      price: plan.monthlyPrice ?? (plan.price || 0),
    };
  });

  const maxPlanCompanies = Math.max(...planDistribution.map((p) => p.companies), 1);

  const recentCompanies = [...companies]
    .sort((a, b) => (parseDate(b.createdAt)?.getTime() || 0) - (parseDate(a.createdAt)?.getTime() || 0))
    .slice(0, 8);

  const activities = auditLogs.slice(0, 8).map((log) => ({
    id: log.id,
    description: `${log.action} — ${log.entity}`,
    user: log.user,
    time: log.date,
    type: log.action.includes("Suspended") || log.action.includes("Expired") ? "warning" : log.action.includes("Activated") || log.action.includes("Created") ? "success" : "info",
  }));

  const pendingActions = [
    pendingCompanies.length > 0 && {
      id: "pending-approval",
      label: `${pendingCompanies.length} company approval(s) pending`,
      path: "/super-admin/companies",
    },
    expiringSoon.length > 0 && {
      id: "expiring",
      label: `${expiringSoon.length} subscription(s) expiring within 30 days`,
      path: "/super-admin/companies",
    },
    suspendedCompanies.length > 0 && {
      id: "suspended",
      label: `${suspendedCompanies.length} suspended compan${suspendedCompanies.length === 1 ? "y" : "ies"}`,
      path: "/super-admin/companies",
    },
    expiredSubscriptions.length > 0 && {
      id: "expired",
      label: `${expiredSubscriptions.length} expired subscription(s)`,
      path: "/super-admin/companies",
    },
    notifications.filter((n) => !n.read).length > 0 && {
      id: "notifications",
      label: `${notifications.filter((n) => !n.read).length} unread notification(s)`,
      path: "/super-admin/notifications",
    },
  ].filter(Boolean);

  const alerts = notifications
    .filter((n) => !n.read || n.type === "warning" || n.type === "alert")
    .slice(0, 5)
    .map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.time,
      type: n.type || "info",
    }));

  const trialOrPendingCount = pendingCompanies.length + trialCompanies.length + (trialByAge.length > 0 ? trialByAge.length : 0);

  const stats = {
    totalCompanies: companies.length,
    activeCompanies: activeCompanies.length,
    totalUsers: countTotalUsers(companies),
    totalEmployees: companies.reduce((s, c) => s + (c.employees || 0), 0),
    activeSubscriptions: activeCompanies.length,
    trialPending: trialOrPendingCount,
    monthlyRevenue,
    totalRevenue,
    totalTasks: taskStats.total,
    completedTasks: taskStats.completed,
    pendingInProgressTasks: taskStats.pendingAndProgress,
    overdueTasks: taskStats.overdue,
    suspendedCompanies: suspendedCompanies.length,
    totalDepartments: companies.reduce((s, c) => s + (c.departments?.length || 0), 0),
    totalSubAdmins: companies.reduce((s, c) => s + (c.subAdmins?.length || 0), 0),
  };

  const taskChartData = [
    { name: "Open", value: taskStats.open, color: "#F97316" },
    { name: "In Progress", value: taskStats.inProgress, color: "#2563EB" },
    { name: "Completed", value: taskStats.completed, color: "#16A34A" },
    { name: "Overdue", value: taskStats.overdue, color: "#DC2626" },
  ];

  const subscriptionChartData = planDistribution.filter((p) => p.companies > 0).map((p) => ({
    name: p.name,
    companies: p.companies,
    revenue: p.revenue,
  }));

  return {
    stats,
    statsFormatted: {
      monthlyRevenue: formatINR(monthlyRevenue),
      totalRevenue: formatINR(totalRevenue),
    },
    companyOverview: {
      total: companies.length,
      active: activeCompanies.length,
      suspended: suspendedCompanies.length,
      trial: trialCompanies.length || trialByAge.length,
      pending: pendingCompanies.length,
      recentlyRegistered: recentCompanies.length,
    },
    recentCompanies,
    planDistribution,
    maxPlanCompanies,
    subscriptionChartData,
    taskStats,
    taskChartData,
    activities,
    pendingActions,
    alerts,
    monthsActiveEstimate,
  };
}
