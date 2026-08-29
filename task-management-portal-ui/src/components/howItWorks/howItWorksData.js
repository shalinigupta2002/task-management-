import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const PRIMARY = "#0056D2";

export const PROCESS_STEPS = [
  {
    num: 1,
    label: "Create",
    title: "1. Create",
    desc: "Define tasks, set priorities, and add all the details.",
    icon: NoteAddOutlinedIcon,
    color: PRIMARY,
    bg: "#EFF6FF",
  },
  {
    num: 2,
    label: "Assign",
    title: "2. Assign",
    desc: "Assign tasks to the right people with due dates.",
    icon: GroupAddOutlinedIcon,
    color: "#22C55E",
    bg: "#F0FDF4",
  },
  {
    num: 3,
    label: "Approve",
    title: "3. Approve",
    desc: "Tasks flow through approvals as per your workflow.",
    icon: AccountTreeOutlinedIcon,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    num: 4,
    label: "Execute",
    title: "4. Execute",
    desc: "Team members work on tasks and update progress.",
    icon: PendingActionsOutlinedIcon,
    color: "#F97316",
    bg: "#FFF7ED",
  },
  {
    num: 5,
    label: "Review & Close",
    title: "5. Review & Close",
    desc: "Review the work, approve and close the task.",
    icon: TaskAltOutlinedIcon,
    color: "#16A34A",
    bg: "#F0FDF4",
  },
];

export const WORKFLOW_STEPS = [
  {
    num: 1,
    title: "Create Tasks",
    desc: "Create tasks with all the important details like category, frequency, priority, and description.",
    mockup: "create",
    color: PRIMARY,
    tip: {
      label: "Pro Tip",
      text: "Use task categories and frequency to standardize and automate recurring work effortlessly.",
      icon: LightbulbOutlinedIcon,
      color: PRIMARY,
      bg: "#EFF6FF",
    },
  },
  {
    num: 2,
    title: "Assign Tasks",
    desc: "Assign tasks to team members or departments with clear deadlines and priorities.",
    mockup: "assign",
    color: "#22C55E",
    tip: {
      label: "Best Practice",
      text: "Assign tasks to individuals or teams based on workload and expertise.",
      icon: GroupsIcon,
      color: "#16A34A",
      bg: "#F0FDF4",
    },
  },
  {
    num: 3,
    title: "Approval Workflow",
    desc: "Tasks go through the defined approval workflow with multiple levels if required.",
    mockup: "approve",
    color: "#7C3AED",
    tip: {
      label: "In Control",
      text: "Flexible multi-level approvals ensure quality and accountability.",
      icon: ShieldOutlinedIcon,
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  },
  {
    num: 4,
    title: "Execute & Track",
    desc: "Assignees work on tasks, update progress and add comments or attachments.",
    mockup: "execute",
    color: "#F97316",
    tip: {
      label: "Stay Updated",
      text: "Real-time updates keep everyone informed about progress and blockers.",
      icon: BarChartIcon,
      color: "#F97316",
      bg: "#FFF7ED",
    },
  },
  {
    num: 5,
    title: "Review & Close",
    desc: "Review the completed work, provide feedback and close the task.",
    mockup: "review",
    color: "#14B8A6",
    tip: {
      label: "Done Right",
      text: "Proper review and closure ensures quality output and complete visibility.",
      icon: CheckCircleOutlineIcon,
      color: "#14B8A6",
      bg: "#F0FDFA",
    },
  },
];
