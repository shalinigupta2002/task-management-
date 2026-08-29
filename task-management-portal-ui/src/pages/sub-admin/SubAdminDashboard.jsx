import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Alert, CircularProgress } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TodayIcon from "@mui/icons-material/Today";
import EventIcon from "@mui/icons-material/Event";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, StatCard } from "../../components/main-admin/shared";
import taskService from "../../services/taskService";
import employeeService from "../../services/employeeService";
import dashboardService from "../../services/dashboardService";
import { getErrorMessage } from "../../utils/session";

export default function SubAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    employees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    todayTasks: 0,
    nearingDueTasks: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
    completionPercentage: 0,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [taskStats, employees, summary] = await Promise.all([
          taskService.getDashboardStats(),
          employeeService.getAll({ limit: 100 }),
          dashboardService.getSummary().catch(() => ({})),
        ]);
        if (!active) return;
        setStats({
          employees: (employees.items || []).length,
          totalTasks: taskStats?.totalTasks ?? 0,
          completedTasks: taskStats?.completedTasks ?? 0,
          pendingTasks: taskStats?.pendingTasks ?? 0,
          overdueTasks: taskStats?.overdueTasks ?? 0,
          todayTasks: taskStats?.todayTasks ?? 0,
          nearingDueTasks: taskStats?.nearingDueTasks ?? 0,
          unreadNotifications: summary?.unreadNotifications ?? 0,
          unreadMessages: summary?.unreadMessages ?? 0,
          completionPercentage: taskStats?.completionPercentage ?? 0,
        });
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const cards = [
    { title: "Department Employees", value: String(stats.employees), icon: PeopleIcon, color: "#14B8A6", bg: "#F0FDFA", onClick: () => navigate("/sub-admin/employees") },
    { title: "Total Tasks", value: String(stats.totalTasks), icon: AssignmentIcon, color: "#2563EB", bg: "#EFF6FF", onClick: () => navigate("/sub-admin/tasks") },
    { title: "Completed Tasks", value: String(stats.completedTasks), trend: stats.completionPercentage ? `${stats.completionPercentage}% complete` : undefined, icon: CheckCircleOutlineIcon, color: "#16A34A", bg: "#F0FDF4" },
    { title: "Pending Tasks", value: String(stats.pendingTasks), icon: HourglassEmptyIcon, color: "#F97316", bg: "#FFF7ED", onClick: () => navigate("/sub-admin/tasks?status=pending") },
    { title: "Overdue Tasks", value: String(stats.overdueTasks), icon: AccessTimeIcon, color: "#FFFFFF", bg: "#DC2626", onClick: () => navigate("/sub-admin/tasks?dueWindow=overdue") },
    { title: "Today's Tasks", value: String(stats.todayTasks), icon: TodayIcon, color: "#0EA5E9", bg: "#F0F9FF", onClick: () => navigate("/sub-admin/tasks?dueWindow=today") },
    { title: "Tasks Nearing Due", value: String(stats.nearingDueTasks), icon: EventIcon, color: "#D97706", bg: "#FFFBEB", onClick: () => navigate("/sub-admin/tasks?dueWindow=nearingDue") },
  ];

  return (
    <SubAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Sub Admin Dashboard" crumbs={[{ label: "Dashboard" }]} homePath="/sub-admin/dashboard" />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {cards.map((s) => {
                const Icon = s.icon;
                return (
                  <Grid key={s.title} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box
                      sx={{
                        cursor: s.onClick ? "pointer" : "default",
                        height: "100%",
                        borderRadius: 3,
                        transition: s.onClick ? "box-shadow 0.2s ease, transform 0.2s ease" : undefined,
                        ...(s.onClick
                          ? {
                            "&:hover": {
                              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                              transform: "translateY(-1px)",
                            },
                          }
                          : {}),
                      }}
                      onClick={s.onClick}
                    >
                      <StatCard title={s.title} value={s.value} trend={s.trend} icon={Icon} color={s.color} bg={s.bg} />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ borderRadius: 3, bgcolor: "#FFF", border: "1px solid #E8EDF5", p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box component="span" sx={{ fontWeight: 700, color: "#0F172A" }}>Quick Actions</Box>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {[
                      { label: "Create Task", path: "/sub-admin/tasks/add" },
                      { label: "View Tasks", path: "/sub-admin/tasks" },
                      { label: "Employees", path: "/sub-admin/employees" },
                      { label: "Calendar", path: "/sub-admin/calendar" },
                      { label: "Reports", path: "/sub-admin/reports" },
                    ].map((a) => (
                      <Box
                        key={a.label}
                        component="button"
                        onClick={() => navigate(a.path)}
                        sx={{
                          border: "1px solid #E2E8F0", borderRadius: 2, px: 2, py: 1, bgcolor: "#F8FAFC",
                          cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#2563EB",
                          "&:hover": { bgcolor: "#EFF6FF" },
                        }}
                      >
                        {a.label}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ borderRadius: 3, bgcolor: "#FFF", border: "1px solid #E8EDF5", p: 2.5 }}>
                  <Box component="span" sx={{ fontWeight: 700, color: "#0F172A", display: "block", mb: 1 }}>Activity Summary</Box>
                  <Box component="span" sx={{ color: "#64748B", fontSize: "0.9rem", display: "block" }}>
                    {stats.unreadNotifications} unread notifications · {stats.unreadMessages} unread messages
                  </Box>
                  <Box component="span" sx={{ color: "#64748B", fontSize: "0.9rem", display: "block", mt: 0.5 }}>
                    {stats.overdueTasks} overdue tasks require attention
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </SubAdminLayout>
  );
}
