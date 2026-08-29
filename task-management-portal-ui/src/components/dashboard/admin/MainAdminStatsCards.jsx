import { useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TodayIcon from "@mui/icons-material/Today";
import EventIcon from "@mui/icons-material/Event";
import { Box, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../main-admin/shared";
import taskService from "../../../services/taskService";
import employeeService from "../../../services/employeeService";
import departmentService from "../../../services/departmentService";

export default function MainAdminStatsCards() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    todayTasks: 0,
    nearingDueTasks: 0,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [taskStats, employees, departments] = await Promise.all([
          taskService.getDashboardStats().catch(() => ({})),
          employeeService.getAll({ limit: 1 }).catch(() => ({ meta: {} })),
          departmentService.getAll({ limit: 1 }).catch(() => ({ meta: {} })),
        ]);
        if (!active) return;
        setStats({
          employees: employees?.meta?.total ?? employees?.items?.length ?? 0,
          departments: departments?.meta?.total ?? departments?.items?.length ?? 0,
          totalTasks: taskStats?.totalTasks ?? 0,
          pendingTasks: taskStats?.pendingTasks ?? 0,
          completedTasks: taskStats?.completedTasks ?? 0,
          overdueTasks: taskStats?.overdueTasks ?? 0,
          todayTasks: taskStats?.todayTasks ?? 0,
          nearingDueTasks: taskStats?.nearingDueTasks ?? 0,
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { title: "Total Employees", value: String(stats.employees), icon: PeopleIcon, color: "#14B8A6", bg: "#F0FDFA", to: "/dashboard/employees" },
    { title: "Total Departments", value: String(stats.departments), icon: ApartmentIcon, color: "#EC4899", bg: "#FDF2F8", to: "/dashboard/departments" },
    { title: "Total Tasks", value: String(stats.totalTasks), icon: AssignmentIcon, color: "#2563EB", bg: "#EFF6FF", to: "/dashboard/tasks" },
    { title: "Pending Tasks", value: String(stats.pendingTasks), icon: HourglassEmptyIcon, color: "#F97316", bg: "#FFF7ED", to: "/dashboard/tasks" },
    { title: "Completed Tasks", value: String(stats.completedTasks), icon: CheckCircleOutlineIcon, color: "#16A34A", bg: "#F0FDF4", to: "/dashboard/tasks" },
    { title: "Overdue Tasks", value: String(stats.overdueTasks), icon: AccessTimeIcon, color: "#FFFFFF", bg: "#DC2626", to: "/dashboard/tasks?dueWindow=overdue" },
    { title: "Today's Tasks", value: String(stats.todayTasks), icon: TodayIcon, color: "#2563EB", bg: "#EFF6FF", to: "/dashboard/tasks?dueWindow=today" },
    { title: "Tasks Nearing Due", value: String(stats.nearingDueTasks), icon: EventIcon, color: "#D97706", bg: "#FFFBEB", to: "/dashboard/tasks?dueWindow=nearingDue" },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4} mb={2.5}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {cards.map((s) => {
        const Icon = s.icon;
        return (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={s.title} sx={{ display: "flex" }}>
            <Box
              sx={{ width: "100%", cursor: s.to ? "pointer" : "default" }}
              onClick={() => s.to && navigate(s.to)}
            >
              <StatCard title={s.title} value={s.value} icon={Icon} color={s.color} bg={s.bg} />
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
