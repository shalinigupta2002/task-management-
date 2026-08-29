import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InsightsIcon from "@mui/icons-material/Insights";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GridViewIcon from "@mui/icons-material/GridView";

export const CATEGORIES = [
  { id: "all", label: "All Features", icon: GridViewIcon },
  { id: "task-management", label: "Task Management", icon: AssignmentIcon },
  { id: "workflows", label: "Workflows & Approvals", icon: AccountTreeIcon },
  { id: "planning", label: "Planning & Calendar", icon: EventAvailableIcon },
  { id: "reports", label: "Reports & Insights", icon: InsightsIcon },
  { id: "admin", label: "Admin & Security", icon: AdminPanelSettingsIcon },
];

export const FEATURES = [
  {
    id: 1,
    num: "1.",
    title: "Task Management",
    color: "#2563EB",
    bg: "#EFF6FF",
    category: "task-management",
    desc: "Create, organize, and track tasks with categories, frequencies, and priority levels.",
    bullets: ["Task Master", "Task Categories", "Frequency Settings", "Task Details & History"],
    mockup: "taskMaster",
  },
  {
    id: 2,
    num: "2.",
    title: "User & Department Management",
    color: "#16A34A",
    bg: "#F0FDF4",
    category: "admin",
    desc: "Manage users, departments, roles, and permissions from a centralized admin panel.",
    bullets: ["User Management", "Department Master", "Role Based Access", "Profile & Permissions"],
    mockup: "users",
  },
  {
    id: 3,
    num: "3.",
    title: "Assign Tasks & Workflow",
    color: "#7C3AED",
    bg: "#F5F3FF",
    category: "workflows",
    desc: "Assign tasks to team members with multi-step approval workflows and status tracking.",
    bullets: ["Assign to Users", "Approval Workflows", "Auto Approval Option", "Task Status Tracking"],
    mockup: "workflow",
  },
  {
    id: 4,
    num: "4.",
    title: "Approvals & Reviews",
    color: "#F97316",
    bg: "#FFF7ED",
    category: "workflows",
    desc: "Streamline approval processes with multi-level reviews, comments, and audit trails.",
    bullets: ["Multi-level Approvals", "Task Review & Re-open", "Comments & Feedback", "Audit Trail"],
    mockup: "approvals",
  },
  {
    id: 5,
    num: "5.",
    title: "Calendar & Scheduling",
    color: "#0EA5E9",
    bg: "#F0F9FF",
    category: "planning",
    desc: "Visualize tasks on calendar with daily, weekly, and monthly views plus drag-and-drop.",
    bullets: ["Daily/Weekly/Monthly/Yearly View", "Task Calendar", "Tasks Nearing Due", "Drag & Drop Reschedule"],
    mockup: "calendar",
  },
  {
    id: 6,
    num: "6.",
    title: "Reports & Insights",
    color: "#14B8A6",
    bg: "#F0FDFA",
    category: "reports",
    desc: "Generate detailed reports with charts, trends, and export options for data-driven decisions.",
    bullets: ["Task Detail Reports", "Status & Trend Reports", "User Performance", "Export to Excel/PDF"],
    mockup: "reports",
  },
  {
    id: 7,
    num: "7.",
    title: "Notifications & Reminders",
    color: "#22C55E",
    bg: "#F0FDF4",
    category: "task-management",
    desc: "Stay informed with email alerts, in-app notifications, and customizable reminder rules.",
    bullets: ["Email & In-App Notifications", "Due Date Reminders", "Escalation Alerts", "Custom Notification Rules"],
    mockup: "notifications",
  },
  {
    id: 8,
    num: "8.",
    title: "Security & Control",
    color: "#EF4444",
    bg: "#FEF2F2",
    category: "admin",
    desc: "Enterprise-grade security with role-based access, encryption, and activity logging.",
    bullets: ["Role Based Access Control", "Data Security & Encryption", "Activity Logs", "Secure Backups"],
    mockup: "security",
  },
];

export const PARTNERS = ["TechSolutions", "GreenLeaf", "FinCorp", "BuildIt", "HealthPlus", "EduSmart"];
