/** Sub Admin–scoped mock data (HR demo profile / assigned employees only). */

export const SUB_ADMIN_EMPLOYEES = [
  { id: "1", firstName: "Anita", lastName: "Desai", fullName: "Anita Desai" },
  { id: "4", firstName: "Amit", lastName: "Patel", fullName: "Amit Patel" },
  { id: "9", firstName: "Deepa", lastName: "Iyer", fullName: "Deepa Iyer" },
];

export const SUB_ADMIN_TASKS = [
  { id: "t-1", title: "Employee Onboarding Checklist", assigneeId: "1", assignee: "Anita Desai", priority: "High", status: "Pending", dueDate: "10 Aug 2026", dueDateSort: "2026-08-10", category: "HR" },
  { id: "t-2", title: "Monthly Attendance Review", assigneeId: "9", assignee: "Deepa Iyer", priority: "Medium", status: "In Progress", dueDate: "12 Aug 2026", dueDateSort: "2026-08-12", category: "HR" },
  { id: "t-3", title: "Policy Update Distribution", assigneeId: "4", assignee: "Amit Patel", priority: "Low", status: "Completed", dueDate: "05 Aug 2026", dueDateSort: "2026-08-05", category: "HR" },
  { id: "t-4", title: "Training Schedule Q3", assigneeId: "1", assignee: "Anita Desai", priority: "High", status: "Overdue", dueDate: "01 Aug 2026", dueDateSort: "2026-08-01", category: "HR" },
  { id: "t-5", title: "HR Policy Acknowledgement", assigneeId: "9", assignee: "Deepa Iyer", priority: "Medium", status: "Completed", dueDate: "28 Jul 2026", dueDateSort: "2026-07-28", category: "HR" },
  { id: "t-6", title: "Weekly Team Sync Prep", assigneeId: "4", assignee: "Amit Patel", priority: "Low", status: "Pending", dueDate: "31 Jul 2026", dueDateSort: "2026-07-31", category: "HR" },
  { id: "t-7", title: "Benefits Enrollment Review", assigneeId: "1", assignee: "Anita Desai", priority: "Medium", status: "In Progress", dueDate: "08 Aug 2026", dueDateSort: "2026-08-08", category: "HR" },
  { id: "t-8", title: "Exit Interview Template", assigneeId: "9", assignee: "Deepa Iyer", priority: "High", status: "Overdue", dueDate: "29 Jul 2026", dueDateSort: "2026-07-29", category: "HR" },
];

export const SUB_ADMIN_ACTIVITIES = [
  { id: "sa-1", activity: "Task assigned", detail: "Employee Onboarding Checklist assigned to Anita Desai", user: "Priya Sharma", time: "15 min ago", type: "info" },
  { id: "sa-2", activity: "Task completed", detail: "Policy Update Distribution marked complete", user: "Amit Patel", time: "45 min ago", type: "success" },
  { id: "sa-3", activity: "Task status changed", detail: "Monthly Attendance Review moved to In Progress", user: "Deepa Iyer", time: "1 hour ago", type: "info" },
  { id: "sa-4", activity: "Extension requested", detail: "Training Schedule Q3 due date extension requested", user: "Anita Desai", time: "2 hours ago", type: "warning" },
  { id: "sa-5", activity: "Comment added", detail: "New comment on Benefits Enrollment Review", user: "Anita Desai", time: "3 hours ago", type: "info" },
  { id: "sa-6", activity: "Task reassigned", detail: "Exit Interview Template reassigned to Deepa Iyer", user: "Priya Sharma", time: "Yesterday", type: "info" },
];

export const SUB_ADMIN_NOTIFICATIONS = [
  { id: "n1", type: "task_assigned", title: "Task Assigned", message: "Employee Onboarding Checklist assigned to Anita Desai", time: "10 min ago", read: false },
  { id: "n2", type: "task_completed", title: "Task Completed", message: "Policy Update Distribution marked complete", time: "1 hour ago", read: false },
  { id: "n3", type: "task_overdue", title: "Overdue Alert", message: "Training Schedule Q3 is overdue", time: "3 hours ago", read: false },
  { id: "n4", type: "extension_request", title: "Extension Request", message: "Anita Desai requested due date extension", time: "Yesterday", read: true },
];

export const SUB_ADMIN_MESSAGE_THREADS = [
  { id: "c-main", name: "Main Admin", role: "Main Admin", unread: 1, lastMessage: "Please review the HR onboarding tasks for this week." },
  { id: "c-emp", name: "Anita Desai", role: "Employee", unread: 0, lastMessage: "Compliance report submitted." },
];

export const PRIORITY_STYLE = {
  High: { bg: "#FEF2F2", color: "#DC2626" },
  Medium: { bg: "#FFF7ED", color: "#EA580C" },
  Low: { bg: "#F0FDF4", color: "#16A34A" },
};

export const STATUS_STYLE = {
  Pending: { bg: "#FFF7ED", color: "#EA580C" },
  "In Progress": { bg: "#EFF6FF", color: "#2563EB" },
  Completed: { bg: "#F0FDF4", color: "#16A34A" },
  Overdue: { bg: "#DC2626", color: "#FFFFFF" },
};

export const STATUS_CHART_COLORS = {
  Completed: "#16A34A",
  "In Progress": "#2563EB",
  Pending: "#F97316",
  Overdue: "#DC2626",
};
