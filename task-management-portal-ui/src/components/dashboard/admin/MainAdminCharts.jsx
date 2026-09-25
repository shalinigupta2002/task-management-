import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import { card } from "../../main-admin/shared";
import dashboardService from "../../../services/dashboardService";
import departmentService from "../../../services/departmentService";
import employeeService from "../../../services/employeeService";

function BarRow({ label, pct, color }) {
  return (
    <Box mb={1.5}>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography sx={{ fontSize: "0.82rem", color: "#334155", fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>{pct}%</Typography>
      </Box>
      <Box sx={{ height: 8, bgcolor: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", bgcolor: color, borderRadius: 4 }} />
      </Box>
    </Box>
  );
}

export default function MainAdminCharts() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, pending: 0, overdue: 0, rate: 0 });
  const [deptPerf, setDeptPerf] = useState([]);
  const [empPerf, setEmpPerf] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [dash, depts, users] = await Promise.all([
          dashboardService.getAdminDashboard().catch(() => dashboardService.getDashboardStats().catch(() => null)),
          departmentService.getAll({ limit: 20 }).catch(() => ({ items: [] })),
          employeeService.getAll({ limit: 20, role: "EMPLOYEE" }).catch(() => ({ items: [] })),
        ]);
        if (!active) return;

        const d = dash || {};
        const completed = d.completedTasks ?? d.completed ?? 0;
        const pending = d.pendingTasks ?? d.pending ?? 0;
        const overdue = d.overdueTasks ?? d.overdue ?? 0;
        const total = d.totalTasks ?? (completed + pending + overdue);
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        setStats({ completed, pending, overdue, rate });

        const deptItems = depts.items || (Array.isArray(depts) ? depts : []);
        setDeptPerf(
          (deptItems || []).slice(0, 5).map((dep) => ({
            name: dep.departmentName || dep.name || "Department",
            pct: typeof dep.completionRate === "number" ? dep.completionRate : 0,
          }))
        );

        const userItems = users.items || (Array.isArray(users) ? users : []);
        setEmpPerf(
          (userItems || []).slice(0, 5).map((u) => ({
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Employee",
            pct: typeof u.completionRate === "number" ? u.completionRate : 0,
          }))
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ ...card, mb: 2.5, display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2.5 }}>
      <Box sx={card}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon sx={{ color: "#2563EB" }} />
          <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Task Completion</Typography>
        </Box>
        <Box textAlign="center" py={2}>
          <Typography sx={{ fontWeight: 800, fontSize: "2.5rem", color: "#2563EB" }}>{stats.rate}%</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>Overall completion rate</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          {[
            { l: "Completed", v: stats.completed, c: "#16A34A" },
            { l: "Pending", v: stats.pending, c: "#F97316" },
            { l: "Overdue", v: stats.overdue, c: "#DC2626" },
          ].map((x) => (
            <Box key={x.l} textAlign="center" sx={{ px: 1.5 }}>
              <Typography sx={{ fontWeight: 700, color: x.c, fontSize: "1.1rem" }}>{x.v}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{x.l}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={card}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BarChartIcon sx={{ color: "#7C3AED" }} />
          <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Departments</Typography>
        </Box>
        {deptPerf.length === 0 ? (
          <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>No departments yet.</Typography>
        ) : (
          deptPerf.map((d) => <BarRow key={d.name} label={d.name} pct={d.pct} color="#7C3AED" />)
        )}
      </Box>

      <Box sx={card}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BarChartIcon sx={{ color: "#14B8A6" }} />
          <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Employees</Typography>
        </Box>
        {empPerf.length === 0 ? (
          <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>No employees yet.</Typography>
        ) : (
          empPerf.map((e) => <BarRow key={e.name} label={e.name} pct={e.pct} color="#14B8A6" />)
        )}
      </Box>
    </Box>
  );
}
