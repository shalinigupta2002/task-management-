export const DEFAULT_EMPLOYEE_PROFILE = {
  employeeId: "EMP-101",
  firstName: "Sandeep",
  lastName: "Malik",
  email: "sandeep.malik@company.com",
  phone: "+91 98765 43210",
  department: "Engineering",
  designation: "Software Developer",
  joiningDate: "15 Jan 2024",
  photo: "",
  assignedMainAdmin: "Rajesh Kumar",
  assignedSubAdmin: "Priya Sharma",
};

export const DEFAULT_TASKS = [
  {
    id: "TSK-1001",
    title: "Monthly Compliance Report",
    description: "Prepare and submit the monthly compliance report covering all regulatory requirements for the engineering department.",
    category: "Compliance",
    priority: "High",
    frequency: "Monthly",
    status: "Open",
    assignedBy: "Priya Sharma",
    assignedDepartment: "HR",
    assignedDate: "01 Aug 2026",
    dueDate: "10 Aug 2026",
    reminder: "1 day before",
    extensionStatus: null,
    attachments: [
      { id: "a1", name: "Compliance_Template.pdf", type: "pdf", size: "245 KB" },
    ],
    comments: [
      { id: "c1", author: "Priya Sharma", text: "Please use the updated template for Q3.", time: "01 Aug 2026, 10:00 AM", own: false },
    ],
    timeline: [
      { id: "tl1", type: "assigned", text: "Task assigned by Priya Sharma", time: "01 Aug 2026, 09:30 AM" },
      { id: "tl2", type: "comment", text: "Comment added by Priya Sharma", time: "01 Aug 2026, 10:00 AM" },
    ],
  },
  {
    id: "TSK-1002",
    title: "IT Asset Verification",
    description: "Verify all IT assets assigned to the engineering team and update the asset register.",
    category: "IT",
    priority: "Medium",
    frequency: "Quarterly",
    status: "In Progress",
    assignedBy: "Amit Patel",
    assignedDepartment: "IT",
    assignedDate: "28 Jul 2026",
    dueDate: "15 Aug 2026",
    reminder: "6 hours before",
    extensionStatus: null,
    attachments: [],
    comments: [],
    timeline: [
      { id: "tl3", type: "assigned", text: "Task assigned by Amit Patel", time: "28 Jul 2026, 02:00 PM" },
      { id: "tl4", type: "status", text: "Status changed to In Progress", time: "29 Jul 2026, 11:00 AM" },
    ],
  },
  {
    id: "TSK-1003",
    title: "Security Audit Checklist",
    description: "Complete the security audit checklist for all applications under your ownership.",
    category: "Compliance",
    priority: "High",
    frequency: "Half Yearly",
    status: "Completed",
    assignedBy: "Rajesh Kumar",
    assignedDepartment: "Operations",
    assignedDate: "20 Jul 2026",
    dueDate: "05 Aug 2026",
    completedAt: "2026-08-05T16:45:00.000Z",
    completeDate: "05 Aug 2026",
    reminder: "1 day before",
    extensionStatus: null,
    attachments: [
      { id: "a2", name: "Audit_Results.xlsx", type: "excel", size: "128 KB" },
    ],
    comments: [
      { id: "c2", author: "You", text: "All items verified and documented.", time: "05 Aug 2026, 04:30 PM", own: true },
    ],
    timeline: [
      { id: "tl5", type: "assigned", text: "Task assigned by Rajesh Kumar", time: "20 Jul 2026, 09:00 AM" },
      { id: "tl6", type: "completed", text: "Task marked as Completed", time: "05 Aug 2026, 04:45 PM" },
    ],
  },
  {
    id: "TSK-1004",
    title: "Quarterly Budget Review",
    description: "Review department budget allocations and submit variance report.",
    category: "Finance",
    priority: "Medium",
    frequency: "Quarterly",
    status: "Overdue",
    assignedBy: "Deepa Iyer",
    assignedDepartment: "Finance",
    assignedDate: "15 Jul 2026",
    dueDate: "01 Aug 2026",
    reminder: "2 days before",
    extensionStatus: "pending",
    attachments: [],
    comments: [],
    timeline: [
      { id: "tl7", type: "assigned", text: "Task assigned by Deepa Iyer", time: "15 Jul 2026, 11:00 AM" },
      { id: "tl8", type: "extension", text: "Extension requested — Pending approval", time: "31 Jul 2026, 03:00 PM" },
    ],
  },
  {
    id: "TSK-1005",
    title: "Team Standup Notes",
    description: "Document weekly standup notes and action items for the engineering sprint.",
    category: "Operations",
    priority: "Low",
    frequency: "Weekly",
    status: "Open",
    assignedBy: "Rajesh Kumar",
    assignedDepartment: "Engineering",
    assignedDate: "06 Aug 2026",
    dueDate: "08 Aug 2026",
    reminder: "30 minutes before",
    extensionStatus: null,
    attachments: [],
    comments: [],
    timeline: [
      { id: "tl9", type: "assigned", text: "Task assigned by Rajesh Kumar", time: "06 Aug 2026, 08:00 AM" },
    ],
  },
];

export const DEFAULT_NOTIFICATIONS = [
  { id: "n1", type: "new_task", title: "New Task Assigned", message: "Team Standup Notes has been assigned to you", time: "10 min ago", read: false },
  { id: "n2", type: "task_reminder", title: "Task Reminder", message: "Monthly Compliance Report is due tomorrow", time: "1 hour ago", read: false },
  { id: "n3", type: "due_today", title: "Due Today", message: "Monthly Compliance Report is due today", time: "3 hours ago", read: false },
  { id: "n4", type: "task_overdue", title: "Task Overdue", message: "Quarterly Budget Review is overdue", time: "Yesterday", read: true },
  { id: "n5", type: "extension_pending", title: "Extension Pending", message: "Your extension request for Quarterly Budget Review is pending", time: "Yesterday", read: true },
  { id: "n6", type: "new_message", title: "New Message", message: "Priya Sharma sent you a message", time: "2 days ago", read: true },
];

export const DEFAULT_CHAT_THREADS = [
  {
    id: "chat-main",
    name: "Rajesh Kumar",
    role: "Main Admin",
    online: true,
    unread: 1,
    lastMessage: "Please prioritize the compliance report.",
    lastTime: "09:30 AM",
    messages: [
      { id: "m1", sender: "Rajesh Kumar", text: "Please prioritize the compliance report.", time: "09:28 AM", date: "06 Aug 2026", seen: true, type: "text" },
      { id: "m2", sender: "You", text: "Will submit by end of day.", time: "09:30 AM", date: "06 Aug 2026", seen: false, type: "text" },
    ],
  },
  {
    id: "chat-sub",
    name: "Priya Sharma",
    role: "Sub Admin",
    online: true,
    unread: 2,
    lastMessage: "Use the updated compliance template.",
    lastTime: "08:15 AM",
    messages: [
      { id: "m3", sender: "Priya Sharma", text: "Use the updated compliance template.", time: "08:15 AM", date: "06 Aug 2026", seen: false, type: "text" },
      { id: "m4", sender: "Priya Sharma", text: "Compliance_Template.pdf", time: "08:16 AM", date: "06 Aug 2026", seen: false, type: "document", attachment: "Compliance_Template.pdf" },
    ],
  },
];

export const DEFAULT_ACTIVITY = [
  { id: "act1", type: "assigned", text: "Task TSK-1005 Team Standup Notes assigned by Rajesh Kumar", time: "06 Aug 2026, 08:00 AM" },
  { id: "act2", type: "opened", text: "Task TSK-1002 IT Asset Verification opened", time: "29 Jul 2026, 11:00 AM" },
  { id: "act3", type: "status", text: "Task TSK-1002 status changed to In Progress", time: "29 Jul 2026, 11:00 AM" },
  { id: "act4", type: "comment", text: "Comment added on Task TSK-1003 Security Audit Checklist", time: "05 Aug 2026, 04:30 PM" },
  { id: "act5", type: "attachment", text: "Attachment uploaded to Task TSK-1003", time: "05 Aug 2026, 04:00 PM" },
  { id: "act6", type: "extension", text: "Extension requested for Task TSK-1004 Quarterly Budget Review", time: "31 Jul 2026, 03:00 PM" },
  { id: "act7", type: "completed", text: "Task TSK-1003 Security Audit Checklist completed", time: "05 Aug 2026, 04:45 PM" },
];

export const RECENT_ACTIVITIES = [
  { id: "ra1", text: "Team Standup Notes assigned to you", time: "10 min ago", type: "info" },
  { id: "ra2", text: "Compliance report due tomorrow", time: "1 hour ago", type: "warning" },
  { id: "ra3", text: "Security Audit Checklist completed", time: "Yesterday", type: "success" },
  { id: "ra4", text: "Extension request pending for Budget Review", time: "Yesterday", type: "warning" },
];

export const NEARING_DUE_DEADLINES = [
  { id: "ud1", title: "Monthly Compliance Report", dueDate: "10 Aug 2026", priority: "High" },
  { id: "ud2", title: "Team Standup Notes", dueDate: "08 Aug 2026", priority: "Low" },
  { id: "ud3", title: "IT Asset Verification", dueDate: "15 Aug 2026", priority: "Medium" },
];

/** @deprecated Use NEARING_DUE_DEADLINES */
export const UPCOMING_DEADLINES = NEARING_DUE_DEADLINES;
