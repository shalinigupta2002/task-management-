export const PERMISSIONS = [
  { id: "manage_employees", label: "Manage Employees" },
  { id: "manage_departments", label: "Manage Departments" },
  { id: "create_task", label: "Create Task" },
  { id: "edit_task", label: "Edit Task" },
  { id: "delete_task", label: "Delete Task" },
  { id: "assign_task", label: "Assign Task" },
  { id: "view_reports", label: "View Reports" },
  { id: "export_reports", label: "Export Reports" },
  { id: "manage_categories", label: "Manage Categories" },
  { id: "manage_frequency", label: "Manage Frequency" },
  { id: "manage_notifications", label: "Manage Notifications" },
  { id: "view_audit_logs", label: "View Audit Logs" },
  { id: "manage_company_settings", label: "Manage Company Settings" },
];

export const DEFAULT_ROLES = [
  {
    id: "hr-admin",
    name: "HR Admin",
    type: "system",
    permissions: ["manage_employees", "manage_departments", "create_task", "edit_task", "assign_task", "view_reports", "manage_categories"],
  },
  {
    id: "it-admin",
    name: "IT Admin",
    type: "system",
    permissions: ["manage_employees", "create_task", "edit_task", "delete_task", "assign_task", "view_reports", "export_reports", "manage_categories", "manage_frequency"],
  },
  {
    id: "finance-admin",
    name: "Finance Admin",
    type: "system",
    permissions: ["view_reports", "export_reports", "create_task", "edit_task", "assign_task", "manage_categories"],
  },
  {
    id: "operations-admin",
    name: "Operations Admin",
    type: "system",
    permissions: ["manage_employees", "manage_departments", "create_task", "edit_task", "assign_task", "view_reports", "export_reports", "manage_categories", "manage_frequency"],
  },
];

export const DEFAULT_SUB_ADMINS = [
  {
    id: "sa-1",
    fullName: "Priya Sharma",
    email: "priya.sharma@company.com",
    phone: "+91 98765 43210",
    department: "HR",
    roleId: "hr-admin",
    roleName: "HR Admin",
    status: "Active",
    lastLogin: "06 Aug 2026, 09:15 AM",
    createdAt: "15 Jan 2025",
    permissions: ["manage_employees", "manage_departments", "create_task", "edit_task", "assign_task", "view_reports", "manage_categories"],
    assignedEmployees: ["1", "4", "9"],
  },
  {
    id: "sa-2",
    fullName: "Amit Patel",
    email: "amit.patel@company.com",
    phone: "+91 91234 56789",
    department: "IT",
    roleId: "it-admin",
    roleName: "IT Admin",
    status: "Active",
    lastLogin: "06 Aug 2026, 08:42 AM",
    createdAt: "20 Feb 2025",
    permissions: ["manage_employees", "create_task", "edit_task", "delete_task", "assign_task", "view_reports", "export_reports"],
    assignedEmployees: ["2", "5", "10"],
  },
  {
    id: "sa-3",
    fullName: "Deepa Iyer",
    email: "deepa.iyer@company.com",
    phone: "+91 99887 76655",
    department: "Finance",
    roleId: "finance-admin",
    roleName: "Finance Admin",
    status: "Inactive",
    lastLogin: "28 Jul 2026, 04:20 PM",
    createdAt: "10 Mar 2025",
    permissions: ["view_reports", "export_reports", "create_task", "edit_task", "assign_task"],
    assignedEmployees: ["3", "8"],
  },
];

export const DEFAULT_NOTIFICATIONS = [
  { id: "n-1", type: "task_assigned", title: "Task Assigned", message: "Monthly Compliance Report assigned to Anita Desai", time: "10 min ago", read: false },
  { id: "n-2", type: "task_completed", title: "Task Completed", message: "Server Maintenance marked complete by Rahul Verma", time: "1 hour ago", read: false },
  { id: "n-3", type: "task_overdue", title: "Task Overdue", message: "Q3 Budget Review is overdue by 2 days", time: "3 hours ago", read: false },
  { id: "n-4", type: "extension_request", title: "Extension Request", message: "Priya Sharma requested due date extension for HR Audit", time: "Yesterday", read: true },
  { id: "n-5", type: "task_updated", title: "Task Updated", message: "IT Security Patch task priority changed to High", time: "Yesterday", read: true },
];

export const DEFAULT_CHAT_THREADS = [
  {
    id: "c-1",
    name: "Super Admin",
    role: "Super Admin",
    online: true,
    unread: 1,
    lastMessage: "Your subscription renewal is due next month.",
    lastTime: "09:30 AM",
    messages: [
      { id: "m-1", sender: "Super Admin", text: "Hello, your company plan renewal is approaching.", time: "09:28 AM", date: "06 Aug 2026", seen: true, type: "text" },
      { id: "m-2", sender: "You", text: "Thank you, we will process it this week.", time: "09:30 AM", date: "06 Aug 2026", seen: false, type: "text" },
    ],
  },
  {
    id: "c-2",
    name: "Priya Sharma",
    role: "HR Sub Admin",
    online: true,
    unread: 2,
    lastMessage: "Employee onboarding tasks are updated.",
    lastTime: "08:15 AM",
    messages: [
      { id: "m-3", sender: "Priya Sharma", text: "Employee onboarding tasks are updated.", time: "08:15 AM", date: "06 Aug 2026", seen: false, type: "text" },
      { id: "m-4", sender: "Priya Sharma", text: "Please review the attached checklist.", time: "08:16 AM", date: "06 Aug 2026", seen: false, type: "document", attachment: "Onboarding_Checklist.pdf" },
    ],
  },
  {
    id: "c-3",
    name: "Anita Desai",
    role: "Employee",
    online: false,
    unread: 0,
    lastMessage: "Compliance report submitted.",
    lastTime: "Yesterday",
    messages: [
      { id: "m-5", sender: "Anita Desai", text: "Compliance report submitted.", time: "05:30 PM", date: "05 Aug 2026", seen: true, type: "text" },
    ],
  },
];

export const DEFAULT_AUDIT_LOGS = [
  { id: "al-1", action: "Employee Created", user: "Priya Sharma", target: "Rohan Gupta", timestamp: "06 Aug 2026, 09:00 AM", ip: "192.168.1.10" },
  { id: "al-2", action: "Task Created", user: "Amit Patel", target: "Server Maintenance", timestamp: "06 Aug 2026, 08:45 AM", ip: "192.168.1.15" },
  { id: "al-3", action: "Department Updated", user: "Main Admin", target: "Finance", timestamp: "05 Aug 2026, 04:20 PM", ip: "192.168.1.5" },
  { id: "al-4", action: "Sub Admin Added", user: "Main Admin", target: "Deepa Iyer", timestamp: "05 Aug 2026, 11:00 AM", ip: "192.168.1.5" },
  { id: "al-5", action: "Permission Changed", user: "Main Admin", target: "IT Admin Role", timestamp: "04 Aug 2026, 03:30 PM", ip: "192.168.1.5" },
  { id: "al-6", action: "Task Deleted", user: "Amit Patel", target: "Legacy Backup Task", timestamp: "04 Aug 2026, 02:15 PM", ip: "192.168.1.15" },
  { id: "al-7", action: "Employee Deleted", user: "Main Admin", target: "Temp User", timestamp: "03 Aug 2026, 10:00 AM", ip: "192.168.1.5" },
];

export const COMPANY_SETTINGS_DEFAULT = {
  companyName: "TechSolutions Pvt Ltd",
  companyEmail: "admin@techsolutions.com",
  companyPhone: "+91 98765 43210",
  address: "Bangalore, Karnataka, India",
  logo: "",
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  passwordMinLength: 8,
  passwordRequireSpecial: true,
  passwordRequireNumber: true,
  passwordExpiryDays: 90,
  emailNotifications: true,
  inAppNotifications: true,
};

export const NOTIFICATION_SETTINGS_DEFAULT = {
  reminders: ["1_day", "6_hours"],
  customReminderHours: 24,
  channels: { inApp: true, email: true },
};

export const RECENT_ACTIVITIES = [
  { id: "ra-1", text: "Anita Desai completed Monthly Compliance Report", time: "10 min ago", type: "success" },
  { id: "ra-2", text: "New employee Rohan Gupta added to IT department", time: "45 min ago", type: "info" },
  { id: "ra-3", text: "Task Q3 Budget Review marked overdue", time: "2 hours ago", type: "warning" },
  { id: "ra-4", text: "Priya Sharma updated HR onboarding checklist", time: "3 hours ago", type: "info" },
  { id: "ra-5", text: "Amit Patel assigned Server Maintenance to Rahul Verma", time: "Yesterday", type: "info" },
];

export const SUB_ADMIN_PROFILE_DEFAULT = {
  id: "sa-demo",
  fullName: "Priya Sharma",
  email: "priya.sharma@company.com",
  phone: "+91 98765 43210",
  department: "HR",
  roleName: "HR Admin",
  permissions: ["manage_employees", "create_task", "edit_task", "assign_task", "view_reports"],
  assignedEmployees: ["1", "4", "9"],
  canDeleteTask: false,
};
