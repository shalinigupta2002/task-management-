import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, StatCard, card } from "../../components/employee/shared";
import taskService from "../../services/taskService";
import { getAuthUser, getErrorMessage } from "../../utils/session";
import { mapEmployeeTask } from "../../utils/employeeTaskMapper";
import { classifyCalendarSidebarTasks, formatNearingDueSubtitle, isNearingDue } from "../../utils/taskDueWindows";

export default function EmployeePortalDashboard() {
  const authUser = useMemo(() => getAuthUser() || {}, []);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const now = useMemo(() => new Date(), []);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await taskService.getAll({ limit: 100 });
      setTasks((result.items || []).map((t) => {
        const mapped = mapEmployeeTask(t, authUser.id);
        return { ...mapped, dueDate: mapped.dueDateRaw || mapped.dueDate };
      }));
    } catch (err) {
      setTasks([]);
      setError(getErrorMessage(err, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, [authUser.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const { todayTasks, nearingDueTasks, completedTasks, overdueTasks } = classifyCalendarSidebarTasks(tasks, now);
  const pending = tasks.filter((t) => t.status === "Open").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = completedTasks.length;
  const overdue = overdueTasks.length;
  const nearing = nearingDueTasks.length;
  const deadlines = tasks
    .filter((t) => isNearingDue(t, now) || todayTasks.some((x) => x.id === t.id))
    .slice(0, 5);

  const stats = [
    { title: "Today's Tasks", value: String(todayTasks.length), icon: TodayIcon, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Pending Tasks", value: String(pending), icon: HourglassEmptyIcon, color: "#F97316", bg: "#FFF7ED" },
    { title: "In Progress", value: String(inProgress), icon: PendingActionsIcon, color: "#0EA5E9", bg: "#F0F9FF" },
    { title: "Completed Tasks", value: String(completed), icon: CheckCircleOutlineIcon, color: "#16A34A", bg: "#F0FDF4" },
    { title: "Overdue Tasks", value: String(overdue), icon: AccessTimeIcon, color: "#FFFFFF", bg: "#DC2626" },
    { title: "Tasks Nearing Due", value: String(nearing), icon: EventIcon, color: "#D97706", bg: "#FFFBEB" },
  ];

  const PRIORITY_COLOR = { High: "#DC2626", Medium: "#F97316", Low: "#16A34A" };

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Employee Dashboard" crumbs={[{ label: "Dashboard" }]} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2, mb: 2.5 }}>
              {stats.map((s) => {
                const Icon = s.icon;
                return <StatCard key={s.title} title={s.title} value={s.value} icon={Icon} color={s.color} bg={s.bg} />;
              })}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 2.5 }}>
              <Box sx={card}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EventIcon sx={{ color: "#F59E0B" }} />
                  <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Tasks Nearing Due</Typography>
                </Box>
                {deadlines.length === 0 ? (
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>No tasks nearing due</Typography>
                ) : (
                  deadlines.map((d) => (
                    <Box key={d.id} display="flex" justifyContent="space-between" alignItems="center" py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { borderBottom: "none" } }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0F172A" }}>{d.title}</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{formatNearingDueSubtitle(d, now) || d.dueDate}</Typography>
                      </Box>
                      <Chip label={d.priority} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: `${PRIORITY_COLOR[d.priority] || "#64748B"}15`, color: PRIORITY_COLOR[d.priority] || "#64748B" }} />
                    </Box>
                  ))
                )}
              </Box>

              <Box sx={card}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TrendingUpIcon sx={{ color: "#16A34A" }} />
                  <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Task Completion</Typography>
                </Box>
                <Box textAlign="center" py={2}>
                  <Typography sx={{ fontWeight: 800, fontSize: "2.5rem", color: "#16A34A" }}>
                    {tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%
                  </Typography>
                  <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>Overall completion rate</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                  {[{ l: "Done", v: completed, c: "#16A34A" }, { l: "Active", v: inProgress + pending, c: "#2563EB" }, { l: "Overdue", v: overdue, c: "#DC2626" }].map((x) => (
                    <Box key={x.l} textAlign="center" sx={{ px: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, color: x.c }}>{x.v}</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{x.l}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </EmployeeLayout>
  );
}
