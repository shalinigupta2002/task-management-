import {
  SUB_ADMIN_EMPLOYEES,
  SUB_ADMIN_TASKS,
  SUB_ADMIN_ACTIVITIES,
  SUB_ADMIN_NOTIFICATIONS,
  SUB_ADMIN_MESSAGE_THREADS,
  STATUS_CHART_COLORS,
} from "../data/subAdminDashboardData";

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function scopeTasks(profile) {
  const ids = new Set((profile.assignedEmployees || []).map(String));
  return SUB_ADMIN_TASKS.filter((t) => ids.has(String(t.assigneeId)));
}

function scopeEmployees(profile) {
  const ids = new Set((profile.assignedEmployees || []).map(String));
  return SUB_ADMIN_EMPLOYEES.filter((e) => ids.has(String(e.id)));
}

export function buildSubAdminDashboard(profile) {
  const tasks = scopeTasks(profile);
  const employees = scopeEmployees(profile);
  const today = todayIso();

  const statusCounts = { Completed: 0, "In Progress": 0, Pending: 0, Overdue: 0 };
  tasks.forEach((t) => {
    if (statusCounts[t.status] !== undefined) statusCounts[t.status] += 1;
  });

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: STATUS_CHART_COLORS[name],
  }));

  const totalTasks = tasks.length;
  const completedTasks = statusCounts.Completed;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const nearingDueDeadlines = [...tasks]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => a.dueDateSort.localeCompare(b.dueDateSort))
    .slice(0, 5);

  const employeePerformance = employees.map((emp) => {
    const empTasks = tasks.filter((t) => String(t.assigneeId) === String(emp.id));
    const completed = empTasks.filter((t) => t.status === "Completed").length;
    const total = empTasks.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    return {
      id: emp.id,
      name: emp.fullName,
      total,
      completed,
      pct,
    };
  });

  const assignedEmployeeNames = new Set(employees.map((e) => e.fullName));
  const activities = SUB_ADMIN_ACTIVITIES.filter((a) => {
    return [...assignedEmployeeNames].some((name) => a.detail.includes(name)) || a.user === profile.fullName;
  });

  const notifications = SUB_ADMIN_NOTIFICATIONS.filter((n) =>
    [...assignedEmployeeNames].some((name) => n.message.includes(name)) || n.type === "extension_request"
  );

  const messageThreads = SUB_ADMIN_MESSAGE_THREADS.filter(
    (t) => t.role === "Main Admin" || assignedEmployeeNames.has(t.name)
  );

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadMessages = messageThreads.reduce((sum, t) => sum + (t.unread || 0), 0);
  const todaysTasks = tasks.filter((t) => t.dueDateSort === today && t.status !== "Completed").length;

  const stats = {
    assignedEmployees: employees.length,
    assignedTasks: totalTasks,
    completedTasks,
    pendingTasks: statusCounts.Pending,
    overdueTasks: statusCounts.Overdue,
    todaysTasks,
    completionTrend: completionRate >= 50 ? `+${completionRate}%` : undefined,
  };

  return {
    stats,
    chartData,
    statusCounts,
    totalTasks,
    nearingDueDeadlines,
    employeePerformance,
    activities,
    notifications,
    messageThreads,
    unreadNotifications,
    unreadMessages,
  };
}
