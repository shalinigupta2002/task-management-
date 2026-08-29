import { useEffect, useState } from "react";
import { Box, Typography, Button, Chip, Grid, CircularProgress, Alert } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card } from "../../components/main-admin/shared";
import taskService from "../../services/taskService";
import employeeService from "../../services/employeeService";
import reportService from "../../services/reportService";
import { getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";

export default function SubAdminReports() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    employees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionPercentage: 0,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [taskStats, employees] = await Promise.all([
          taskService.getDashboardStats(),
          employeeService.getAll({ limit: 100 }),
        ]);
        if (!active) return;
        setStats({
          employees: (employees.items || []).length,
          totalTasks: taskStats?.totalTasks ?? 0,
          completedTasks: taskStats?.completedTasks ?? 0,
          pendingTasks: taskStats?.pendingTasks ?? 0,
          overdueTasks: taskStats?.overdueTasks ?? 0,
          completionPercentage: taskStats?.completionPercentage ?? 0,
        });
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load report data"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await reportService.exportReport();
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `department-task-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report exported");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to export report"));
    } finally {
      setExporting(false);
    }
  };

  const reports = [
    { title: "Employee Report", desc: "Employees in your department", value: `${stats.employees} employees` },
    { title: "Task Report", desc: "All department-scoped tasks", value: `${stats.totalTasks} tasks` },
    { title: "Completion Report", desc: "Task completion rate", value: `${stats.completionPercentage}%` },
    { title: "Pending Tasks", desc: "Open and in-progress tasks", value: `${stats.pendingTasks} pending` },
    { title: "Overdue Report", desc: "Tasks past due date", value: `${stats.overdueTasks} overdue` },
  ];

  return (
    <SubAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Reports" crumbs={[{ label: "Reports" }]} homePath="/sub-admin/dashboard" />
        <Typography sx={{ color: "#64748B", mb: 2, fontSize: "0.9rem" }}>
          Reports scoped to your department (company-enforced on backend)
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {[
                { label: "Total Tasks", value: stats.totalTasks, color: "#2563EB", bg: "#EFF6FF" },
                { label: "Completed", value: stats.completedTasks, color: "#16A34A", bg: "#F0FDF4" },
                { label: "Pending", value: stats.pendingTasks, color: "#F97316", bg: "#FFF7ED" },
                { label: "Overdue", value: stats.overdueTasks, color: "#FFFFFF", bg: "#DC2626" },
              ].map((s) => (
                <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                  <Box sx={{ ...card, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AssessmentIcon sx={{ color: s.color, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0F172A" }}>{s.value}</Typography>
                      <Typography sx={{ color: "#64748B", fontSize: "0.75rem" }}>{s.label}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              {reports.map((r) => (
                <Box key={r.title} sx={card}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{r.title}</Typography>
                    <Chip label={r.value} size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: "0.72rem" }} />
                  </Box>
                  <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>{r.desc}</Typography>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    variant="outlined"
                    disabled={exporting}
                    onClick={handleExport}
                    sx={{ textTransform: "none", borderRadius: 2, borderColor: "#E2E8F0", color: "#64748B" }}
                  >
                    {exporting ? "Exporting..." : "Export CSV"}
                  </Button>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </SubAdminLayout>
  );
}
