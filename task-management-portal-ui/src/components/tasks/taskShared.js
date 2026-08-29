import { OVERDUE_FULL } from "../../constants/overdueStyles";

export const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5" };

export const SAMPLE_TASK = {
  id: "1",
  title: "Monthly Compliance Report Submission",
  category: "Compliance",
  frequency: "Monthly",
  priority: "High",
  status: "Draft",
  startDate: "2024-05-01",
  dueDate: "2024-05-25",
  effort: "8",
  description: "Prepare and submit the monthly compliance report including all regulatory checkpoints, audit logs, and department sign-offs.",
  submitter: "Sandeep Mallik",
  assignedTo: [
    { name: "Rahul Verma", role: "Compliance Officer", avatar: "RV" },
    { name: "Priya Sharma", role: "Reviewer", avatar: "PS" },
  ],
  approvers: ["Anita Desai", "Vikram Singh", "Sandeep Mallik"],
  attachments: [
    { name: "compliance_template.xlsx", size: "245 KB" },
    { name: "guidelines.pdf", size: "1.2 MB" },
  ],
};

export const TASK_LIST = [
  { id: "1", title: "Monthly Compliance Report Submission", category: "Compliance", frequency: "Monthly", priority: "High", status: "Draft", dueDate: "25 May 2024", assignee: "Rahul Verma" },
  { id: "2", title: "IT Security Audit", category: "Information Technology", frequency: "Quarterly", priority: "High", status: "Pending Approval", dueDate: "30 May 2024", assignee: "Anita Desai" },
  { id: "3", title: "HR Policy Review", category: "Human Resources", frequency: "Yearly", priority: "Medium", status: "In Progress", dueDate: "15 Jun 2024", assignee: "Priya Sharma" },
  { id: "4", title: "Budget Planning Q2", category: "Finance", frequency: "Quarterly", priority: "High", status: "Completed", dueDate: "10 May 2024", assignee: "Amit Patel" },
  { id: "5", title: "Client Feedback Analysis", category: "Customer Support", frequency: "Weekly", priority: "Low", status: "Under Review", dueDate: "28 May 2024", assignee: "Kavita Nair" },
  { id: "6", title: "Marketing Campaign Launch", category: "Marketing", frequency: "Once", priority: "Medium", status: "Closed", dueDate: "05 May 2024", assignee: "Sneha Reddy" },
];

export const STATUS_STYLE = {
  Draft: { bg: "#FEFCE8", color: "#CA8A04", label: "Draft" },
  "Pending Approval": { bg: "#EFF6FF", color: "#2563EB", label: "Pending Approval" },
  "In Progress": { bg: "#EFF6FF", color: "#2563EB", label: "In Progress" },
  Completed: { bg: "#F0FDF4", color: "#16A34A", label: "Completed" },
  "Under Review": { bg: "#EFF6FF", color: "#2563EB", label: "Under Review" },
  "Completed (Pending Review)": { bg: "#EFF6FF", color: "#2563EB", label: "Completed (Pending Review)" },
  Closed: { bg: "#F0FDF4", color: "#16A34A", label: "Closed" },
  Open: { bg: "#FFF7ED", color: "#EA580C", label: "Open" },
  Overdue: { bg: OVERDUE_FULL.bg, color: OVERDUE_FULL.color, label: OVERDUE_FULL.label },
  OVERDUE: { bg: OVERDUE_FULL.bg, color: OVERDUE_FULL.color, label: OVERDUE_FULL.label },
};

export const PRIORITY_DOT = { High: "#EF4444", Medium: "#F97316", Low: "#16A34A" };
