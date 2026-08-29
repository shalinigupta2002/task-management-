import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import BarChartIcon from "@mui/icons-material/BarChart";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import TuneIcon from "@mui/icons-material/Tune";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const PRIMARY = "#0056D2";
const ICON_BG = "#EFF6FF";

export const HERO_VALUES = [
  {
    icon: AccessTimeIcon,
    title: "Save Time",
    desc: "Automate workflows and eliminate manual follow-ups.",
    color: PRIMARY,
    bg: ICON_BG,
  },
  {
    icon: FolderOpenIcon,
    title: "Stay Organized",
    desc: "Everything in one place, structured and easy to find.",
    color: PRIMARY,
    bg: ICON_BG,
  },
  {
    icon: HowToRegIcon,
    title: "Improve Accountability",
    desc: "Clear ownership and visibility at every step.",
    color: PRIMARY,
    bg: ICON_BG,
  },
  {
    icon: PieChartOutlineIcon,
    title: "Drive Results",
    desc: "Better decisions, faster execution, stronger outcomes.",
    color: PRIMARY,
    bg: ICON_BG,
  },
];

export const CORE_BENEFITS = [
  {
    icon: GpsFixedIcon,
    title: "Increased Productivity",
    desc: "Reduce time spent on manual tracking, meetings and status updates. Focus on work that truly matters.",
    color: "#22C55E",
    bg: "#F0FDF4",
  },
  {
    icon: VisibilityIcon,
    title: "Complete Visibility",
    desc: "Get real-time visibility into tasks, progress and deadlines across teams, departments and projects.",
    color: PRIMARY,
    bg: "#EFF6FF",
  },
  {
    icon: VerifiedUserIcon,
    title: "Better Accountability",
    desc: "Clear task ownership, workflows and approvals ensure everyone is responsible and nothing slips through the cracks.",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    icon: EventAvailableIcon,
    title: "Never Miss a Deadline",
    desc: "Smart reminders, calendars and notifications help you stay ahead of every important deadline.",
    color: "#F97316",
    bg: "#FFF7ED",
  },
  {
    icon: BarChartIcon,
    title: "Data-Driven Decisions",
    desc: "Powerful reports and insights help you identify bottlenecks, track performance and make informed decisions.",
    color: "#EC4899",
    bg: "#FDF2F8",
  },
  {
    icon: BadgeOutlinedIcon,
    title: "Simplify Compliance",
    desc: "Manage compliance tasks, approvals and documentation effortlessly and stay audit-ready at all times.",
    color: "#14B8A6",
    bg: "#F0FDFA",
  },
  {
    icon: GroupsIcon,
    title: "Stronger Collaboration",
    desc: "Centralized communication, file sharing and updates keep your team aligned and moving forward.",
    color: "#8B5CF6",
    bg: "#EDE9FE",
  },
  {
    icon: TuneIcon,
    title: "Customizable & Scalable",
    desc: "Configure TaskFlow to match your unique processes and scale as your organization grows.",
    color: "#0EA5E9",
    bg: "#F0F9FF",
  },
  {
    icon: LockOutlinedIcon,
    title: "Secure & Reliable",
    desc: "Enterprise-grade security, role-based access and data protection you can rely on—always.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
];

export const STATS = [
  { icon: BusinessIcon, value: "500+", label: "Organizations Trust TaskFlow" },
  { icon: GroupsIcon, value: "25K+", label: "Active Users Worldwide" },
  { icon: AssignmentTurnedInIcon, value: "1M+", label: "Tasks Completed Every Month" },
  { icon: SentimentSatisfiedAltOutlinedIcon, value: "98%", label: "Customer Satisfaction Rate" },
  { icon: TrendingUpIcon, value: "40%", label: "Average Increase in Team Productivity" },
];

export const TESTIMONIALS = [
  {
    quote: "TaskFlow transformed how we manage compliance tasks. Everything is tracked, approvals are seamless, and we are always audit-ready.",
    name: "Anita Sharma",
    role: "Compliance Manager, FinCorp",
    avatar: "AS",
    avatarColor: "#7C3AED",
  },
  {
    quote: "Our IT team finally has one platform for all task tracking. Real-time visibility has reduced delays and improved coordination across departments.",
    name: "Rahul Verma",
    role: "IT Manager, TechSolutions",
    avatar: "RV",
    avatarColor: PRIMARY,
  },
  {
    quote: "From planning to execution, TaskFlow keeps our operations running smoothly. Deadlines are clear, accountability is strong, and productivity has increased significantly.",
    name: "Priya Nair",
    role: "Operations Head, BuildIt",
    avatar: "PN",
    avatarColor: "#0EA5E9",
  },
];
