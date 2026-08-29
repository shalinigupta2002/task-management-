import { Box, Typography, Chip, Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const SIDEBAR = [
  { icon: DashboardIcon, label: "Dashboard", active: true },
  { icon: AssignmentIcon, label: "Tasks" },
  { icon: CalendarMonthIcon, label: "Calendar" },
  { icon: AssessmentIcon, label: "Reports" },
  { icon: HowToRegIcon, label: "Approvals" },
  { icon: PeopleIcon, label: "Users" },
  { icon: SettingsIcon, label: "Settings" },
];

const STATS = [
  { v: "128", l: "Total Tasks", icon: AssignmentOutlinedIcon, c: "#0056D2", bg: "#EFF6FF" },
  { v: "42", l: "Completed", icon: CheckCircleOutlineIcon, c: "#22C55E", bg: "#F0FDF4" },
  { v: "15", l: "In Progress", icon: HourglassEmptyIcon, c: "#F97316", bg: "#FFF7ED" },
  { v: "9", l: "Overdue", icon: AccessTimeIcon, c: "#FFFFFF", bg: "#DC2626" },
];

const TASKS = [
  { t: "Monthly Compliance Report", d: "30 May 2025", p: "High", pc: "#EF4444", s: "Open", sc: "#0056D2", sb: "#EFF6FF" },
  { t: "IT Asset Verification", d: "28 May 2025", p: "Medium", pc: "#F97316", s: "In Progress", sc: "#16A34A", sb: "#F0FDF4" },
  { t: "Onboarding Docs", d: "25 May 2025", p: "High", pc: "#EF4444", s: "Review", sc: "#7C3AED", sb: "#F5F3FF" },
  { t: "Budget Review", d: "20 May 2025", p: "Medium", pc: "#F97316", s: "Overdue", sc: "#FFFFFF", sb: "#DC2626" },
];

const UPCOMING = [
  { t: "Daily System Backup Check", tag: "Daily", tc: "#0056D2", tb: "#EFF6FF" },
  { t: "Weekly Team Meeting", tag: "Weekly", tc: "#7C3AED", tb: "#F5F3FF" },
];

const WORKFLOW = [
  { n: 1, label: "Draft", icon: EditNoteIcon, active: true },
  { n: 2, label: "Approval", icon: HowToRegIcon, active: true },
  { n: 3, label: "Open", icon: PlayCircleOutlineIcon, active: true },
  { n: 4, label: "In Progress", icon: HourglassEmptyIcon, active: false },
  { n: 5, label: "Review", icon: RateReviewIcon, active: false },
  { n: 6, label: "Closed", icon: LockIcon, active: false },
];

function PriorityDot({ color, label }) {
  return (
    <Box display="flex" alignItems="center" gap={0.4}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ color: "#64748B", fontSize: "0.52rem", fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

export default function DashboardPreview() {
  return (
    <Box sx={{ display: "flex", minHeight: 440, bgcolor: "#F4F7FE", fontSize: "0.65rem" }}>
      {/* Sidebar */}
      <Box sx={{ width: 118, bgcolor: "#0F172A", py: 1.5, px: 1, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 0.5, mb: 1.5 }}>
          <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: "#0056D2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AssignmentTurnedInIcon sx={{ color: "#FFF", fontSize: 14 }} />
          </Box>
          <Typography sx={{ color: "#FFF", fontWeight: 700, fontSize: "0.62rem", lineHeight: 1.1 }}>TaskFlow</Typography>
        </Box>
        {SIDEBAR.map(({ icon: Icon, label, active }) => (
          <Box key={label} sx={{
            display: "flex", alignItems: "center", gap: 0.7, px: 0.8, py: 0.65, borderRadius: 1.5, mb: 0.2,
            bgcolor: active ? "#0056D2" : "transparent",
          }}>
            <Icon sx={{ color: "#FFF", fontSize: 13, opacity: active ? 1 : 0.65 }} />
            <Typography sx={{ color: "#FFF", fontSize: "0.55rem", fontWeight: active ? 600 : 400, opacity: active ? 1 : 0.7, whiteSpace: "nowrap" }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, p: 1.25, display: "flex", flexDirection: "column", gap: 0.9, minWidth: 0 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.82rem", flexShrink: 0 }}>Dashboard</Typography>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", bgcolor: "#FFF", borderRadius: 2, px: 1, py: 0.5, border: "1px solid #E8EDF5", minWidth: 0 }}>
            <SearchIcon sx={{ fontSize: 12, color: "#94A3B8", mr: 0.5, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.52rem", color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Search tasks, users, departments...
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.6} flexShrink={0}>
            <Avatar sx={{ width: 22, height: 22, bgcolor: "#CBD5E1", fontSize: "0.5rem" }}>SM</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.52rem", lineHeight: 1.2 }}>Sandeep Malik</Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.45rem", lineHeight: 1.2 }}>Administrator</Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats */}
        <Box display="grid" gridTemplateColumns="repeat(4,1fr)" gap={0.7}>
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Box key={s.l} sx={{ bgcolor: "#FFF", borderRadius: 2, p: 0.85, display: "flex", gap: 0.6, alignItems: "center", border: "1px solid #E8EDF5" }}>
                <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon sx={{ color: s.c, fontSize: 14 }} />
                </Box>
                <Box minWidth={0}>
                  <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.88rem", lineHeight: 1 }}>{s.v}</Typography>
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.48rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.l}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Tasks + Calendar */}
        <Box display="grid" gridTemplateColumns="1.55fr 0.9fr" gap={0.7} flex={1}>
          <Box sx={{ bgcolor: "#FFF", borderRadius: 2, p: 1, border: "1px solid #E8EDF5" }}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.68rem", mb: 0.6 }}>My Tasks</Typography>
            <Box display="grid" gridTemplateColumns="2fr 0.95fr 0.75fr 0.9fr" gap={0.4} sx={{ borderBottom: "1px solid #F1F5F9", pb: 0.35, mb: 0.35 }}>
              {["Task", "Due Date", "Priority", "Status"].map((h) => (
                <Typography key={h} sx={{ color: "#94A3B8", fontSize: "0.48rem", fontWeight: 600 }}>{h}</Typography>
              ))}
            </Box>
            {TASKS.map((t) => (
              <Box key={t.t} display="grid" gridTemplateColumns="2fr 0.95fr 0.75fr 0.9fr" gap={0.4} alignItems="center" py={0.35} sx={{ borderBottom: "1px solid #F8FAFC" }}>
                <Typography sx={{ color: "#334155", fontSize: "0.52rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.t}</Typography>
                <Typography sx={{ color: "#94A3B8", fontSize: "0.48rem" }}>{t.d}</Typography>
                <PriorityDot color={t.pc} label={t.p} />
                <Chip label={t.s} size="small" sx={{ height: 15, fontSize: "0.42rem", fontWeight: 600, bgcolor: t.sb, color: t.sc, maxWidth: "100%", borderRadius: 1 }} />
              </Box>
            ))}
          </Box>

          <Box display="flex" flexDirection="column" gap={0.7}>
            <Box sx={{ bgcolor: "#FFF", borderRadius: 2, p: 1, border: "1px solid #E8EDF5", flex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.65rem" }}>My Calendar</Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.48rem", fontWeight: 600 }}>May 2025</Typography>
              </Box>
              <Box display="grid" gridTemplateColumns="repeat(7,1fr)" gap={0.15} mb={0.25}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <Typography key={i} align="center" sx={{ fontSize: "0.4rem", color: "#94A3B8", fontWeight: 600 }}>{d}</Typography>
                ))}
              </Box>
              <Box display="grid" gridTemplateColumns="repeat(7,1fr)" gap={0.15}>
                {Array.from({ length: 31 }, (_, i) => (
                  <Box key={i} sx={{
                    width: 14, height: 14, borderRadius: "50%", mx: "auto", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.4rem", fontWeight: i + 1 === 20 ? 700 : 400,
                    bgcolor: i + 1 === 20 ? "#0056D2" : "transparent", color: i + 1 === 20 ? "#FFF" : "#64748B",
                  }}>{i + 1}</Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ bgcolor: "#FFF", borderRadius: 2, p: 1, border: "1px solid #E8EDF5" }}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.62rem", mb: 0.5 }}>Tasks Nearing Due</Typography>
              {UPCOMING.map((u) => (
                <Box key={u.t} display="flex" alignItems="center" justifyContent="space-between" gap={0.5} py={0.3}>
                  <Typography sx={{ fontSize: "0.5rem", color: "#334155", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.t}</Typography>
                  <Chip label={u.tag} size="small" sx={{ height: 14, fontSize: "0.38rem", fontWeight: 600, bgcolor: u.tb, color: u.tc, borderRadius: 1, flexShrink: 0 }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Workflow */}
        <Box sx={{ bgcolor: "#FFF", borderRadius: 2, p: 1, border: "1px solid #E8EDF5" }}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.62rem", mb: 0.8 }}>Task Workflow</Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            {WORKFLOW.map((step, i) => {
              const Icon = step.icon;
              return (
                <Box key={step.label} display="flex" alignItems="center" sx={{ flex: i < WORKFLOW.length - 1 ? 1 : "none" }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ minWidth: 36 }}>
                    <Box sx={{
                      width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: step.active ? "#0056D2" : "#FFF", border: step.active ? "none" : "1.5px solid #E2E8F0", mb: 0.3,
                    }}>
                      <Icon sx={{ fontSize: 11, color: step.active ? "#FFF" : "#94A3B8" }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.38rem", color: step.active ? "#0056D2" : "#94A3B8", fontWeight: step.active ? 600 : 400, textAlign: "center", lineHeight: 1.2 }}>
                      {step.n}. {step.label}
                    </Typography>
                  </Box>
                  {i < WORKFLOW.length - 1 && (
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", pb: 1.2 }}>
                      <ArrowForwardIcon sx={{ fontSize: 10, color: step.active ? "#0056D2" : "#CBD5E1" }} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
