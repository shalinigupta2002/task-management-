import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Link, Avatar,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChatIcon from "@mui/icons-material/Chat";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { card, tableHeadCell } from "../../main-admin/shared";
import { EmptyState } from "../../shared";
import { PRIORITY_STYLE, STATUS_STYLE } from "../../../data/subAdminDashboardData";

const sectionCard = { ...card, height: "100%" };

const TYPE_COLOR = { success: "#16A34A", warning: "#F97316", info: "#2563EB" };

function SectionHeader({ title, actionLabel, actionTo }) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>{title}</Typography>
      {actionLabel && actionTo && (
        <Link component={RouterLink} to={actionTo} underline="hover" sx={{ color: "#2563EB", fontSize: "0.78rem", fontWeight: 600 }}>
          {actionLabel}
        </Link>
      )}
    </Box>
  );
}

export function TaskCompletionChart({ chartData, totalTasks }) {
  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Task Completion Overview</Typography>
      {totalTasks === 0 ? (
        <EmptyState type="tasks" title="No tasks yet" description="Assigned tasks will appear here once created." />
      ) : (
        <>
          <Box sx={{ height: 200, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>{totalTasks}</Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.65rem" }}>Total</Typography>
            </Box>
          </Box>
          <Box mt={1}>
            {chartData.map((d) => (
              <Box key={d.name} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Box display="flex" alignItems="center" gap={0.8}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.color }} />
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{d.name}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>{d.value}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

export function TaskStatusOverview({ statusCounts }) {
  const items = [
    { label: "Completed", count: statusCounts.Completed, style: STATUS_STYLE.Completed },
    { label: "In Progress", count: statusCounts["In Progress"], style: STATUS_STYLE["In Progress"] },
    { label: "Pending", count: statusCounts.Pending, style: STATUS_STYLE.Pending },
    { label: "Overdue", count: statusCounts.Overdue, style: STATUS_STYLE.Overdue },
  ];

  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Task Status Overview</Typography>
      <Grid container spacing={1.5}>
        {items.map((item) => (
          <Grid key={item.label} size={{ xs: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: item.style.bg, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, color: item.style.color, fontSize: "1.35rem", lineHeight: 1.2 }}>{item.count}</Typography>
              <Chip label={item.label} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, mt: 0.5, bgcolor: "#FFFFFF", color: item.style.color }} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function NearingDueDeadlines({ tasks }) {
  return (
    <Box sx={{ ...sectionCard, p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <SectionHeader title="Tasks Nearing Due" actionLabel="View All Tasks" actionTo="/sub-admin/tasks?dueWindow=nearingDue" />
      </Box>
      {tasks.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}>
          <EmptyState type="tasks" title="No tasks nearing due" description="All caught up — no tasks approaching their due date." />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Task", "Assigned Employee", "Due Date", "Priority", "Status"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                  <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{t.title}</TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{t.assignee}</TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{t.dueDate}</TableCell>
                  <TableCell>
                    <Chip label={t.priority} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: PRIORITY_STYLE[t.priority]?.bg, color: PRIORITY_STYLE[t.priority]?.color }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={t.status} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: STATUS_STYLE[t.status]?.bg, color: STATUS_STYLE[t.status]?.color }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export function EmployeePerformance({ employees }) {
  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Employee Performance" actionLabel="View Employees" actionTo="/sub-admin/employees" />
      {employees.length === 0 ? (
        <EmptyState type="employees" title="No assigned employees" description="Employees assigned to you will appear here." />
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Employee", "Assigned", "Completed", "Completion"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id} sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.25 } }}>
                  <TableCell sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>{e.name}</TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{e.total}</TableCell>
                  <TableCell sx={{ color: "#16A34A", fontSize: "0.85rem", fontWeight: 600 }}>{e.completed}</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress variant="determinate" value={e.pct} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#2563EB", borderRadius: 3 } }} />
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", minWidth: 32 }}>{e.pct}%</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export function RecentActivityFeed({ activities }) {
  return (
    <Box sx={sectionCard}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <HistoryIcon sx={{ color: "#2563EB", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Recent Activity</Typography>
      </Box>
      {activities.length === 0 ? (
        <EmptyState type="generic" title="No recent activity" description="Activity from your assigned employees will show here." />
      ) : (
        activities.slice(0, 6).map((a) => (
          <Box key={a.id} display="flex" justifyContent="space-between" alignItems="flex-start" py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { borderBottom: "none" } }}>
            <Box display="flex" gap={1.5} alignItems="flex-start" flex={1} minWidth={0}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TYPE_COLOR[a.type] || "#2563EB", mt: 0.8, flexShrink: 0 }} />
              <Box minWidth={0}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{a.activity}</Typography>
                <Typography sx={{ color: "#334155", fontSize: "0.85rem", lineHeight: 1.45 }}>{a.detail}</Typography>
                <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.3 }}>{a.user}</Typography>
              </Box>
            </Box>
            <Chip label={a.time} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "#F8FAFC", color: "#94A3B8", flexShrink: 0, ml: 1 }} />
          </Box>
        ))
      )}
    </Box>
  );
}

export function NotificationsSummary({ notifications, unreadCount }) {
  return (
    <Box sx={sectionCard}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <NotificationsNoneIcon sx={{ color: "#2563EB", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", flex: 1 }}>Notifications</Typography>
        {unreadCount > 0 && (
          <Chip label={`${unreadCount} unread`} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#EFF6FF", color: "#2563EB" }} />
        )}
        <Link component={RouterLink} to="/sub-admin/notifications" underline="hover" sx={{ color: "#2563EB", fontSize: "0.78rem", fontWeight: 600 }}>
          View All
        </Link>
      </Box>
      {notifications.length === 0 ? (
        <EmptyState type="notifications" title="All caught up" description="You have no notifications at the moment." />
      ) : (
        notifications.slice(0, 4).map((n) => (
          <Box key={n.id} py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", borderLeft: n.read ? undefined : "3px solid #2563EB", pl: n.read ? 0 : 1.5, "&:last-child": { borderBottom: "none" } }}>
            <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem" }}>{n.title}</Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mt: 0.3 }}>{n.message}</Typography>
            <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.3 }}>{n.time}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

export function MessagesSummary({ threads, unreadCount }) {
  return (
    <Box sx={sectionCard}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <ChatIcon sx={{ color: "#2563EB", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", flex: 1 }}>Messages</Typography>
        {unreadCount > 0 && (
          <Chip label={`${unreadCount} unread`} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#2563EB", color: "#FFF" }} />
        )}
        <Link component={RouterLink} to="/sub-admin/messages" underline="hover" sx={{ color: "#2563EB", fontSize: "0.78rem", fontWeight: 600 }}>
          View Messages
        </Link>
      </Box>
      {threads.length === 0 ? (
        <EmptyState type="messages" title="No recent messages" description="Start a conversation with Main Admin or assigned employees." />
      ) : (
        threads.slice(0, 4).map((t) => (
          <Box key={t.id} display="flex" alignItems="center" gap={1.5} py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { borderBottom: "none" } }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.75rem" }}>
              {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>{t.name}</Typography>
                {t.unread > 0 && <Chip label={t.unread} size="small" sx={{ height: 18, bgcolor: "#2563EB", color: "#FFF", fontSize: "0.6rem" }} />}
              </Box>
              <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{t.role}</Typography>
              <Typography noWrap sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.3 }}>{t.lastMessage}</Typography>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}

const QUICK_ACTIONS = [
  { label: "View Employees", icon: PeopleIcon, color: "#14B8A6", bg: "#F0FDFA", path: "/sub-admin/employees" },
  { label: "View Tasks", icon: AssignmentIcon, color: "#2563EB", bg: "#EFF6FF", path: "/sub-admin/tasks" },
  { label: "Open Calendar", icon: CalendarMonthIcon, color: "#7C3AED", bg: "#F5F3FF", path: "/sub-admin/calendar" },
  { label: "View Reports", icon: AssessmentIcon, color: "#F97316", bg: "#FFF7ED", path: "/sub-admin/reports", permission: "view_reports" },
  { label: "Messages", icon: ChatIcon, color: "#0EA5E9", bg: "#F0F9FF", path: "/sub-admin/messages" },
];

export function QuickActionsBar({ permissions = [] }) {
  const navigate = useNavigate();
  const actions = QUICK_ACTIONS.filter((a) => !a.permission || permissions.includes(a.permission));

  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Quick Actions</Typography>
      <Box display="flex" flexWrap="wrap" gap={1.5}>
        {actions.map((q) => {
          const Icon = q.icon;
          return (
            <Box key={q.label} sx={{ flex: { xs: "1 1 calc(50% - 12px)", sm: "1 1 calc(33.33% - 12px)", md: "1 1 calc(20% - 12px)" }, minWidth: 120 }}>
              <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate(q.path)}
                onKeyDown={(e) => e.key === "Enter" && navigate(q.path)}
                sx={{ textAlign: "center", p: 1.5, borderRadius: 2.5, border: "1px solid #E8EDF5", cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: q.bg, borderColor: q.color } }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: q.bg, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 0.8 }}>
                  <Icon sx={{ color: q.color, fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>{q.label}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
