import { Box, Typography } from "@mui/material";
import Layout from "../components/layouts/Layout";
import MainAdminStatsCards from "../components/dashboard/admin/MainAdminStatsCards";
import MainAdminCharts from "../components/dashboard/admin/MainAdminCharts";
import MainAdminRecentActivities from "../components/dashboard/admin/MainAdminRecentActivities";
import { AdminToolbar } from "../components/dashboard/admin/AdminWidgets";
import { PageHeader } from "../components/main-admin/shared";

export default function Dashboard() {
  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Main Admin Dashboard" crumbs={[{ label: "Dashboard" }]} />
        <AdminToolbar />
        <MainAdminStatsCards />
        <MainAdminCharts />
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 1.5, mt: 0.5 }}>Recent Activities</Typography>
        <MainAdminRecentActivities />
      </Box>
    </Layout>
  );
}
