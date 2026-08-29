import { useCallback, useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { StatCard, PageHeader } from "../../components/super-admin/shared";
import { LoadingSkeleton, ErrorState } from "../../components/shared";
import superAdminDashboardService from "../../services/superAdminDashboardService";
import {
  CompanyOverviewSummary,
  RecentCompaniesTable,
  SubscriptionOverview,
  PlanDistribution,
  PlatformTaskOverview,
  RecentPlatformActivity,
  PendingActionsCard,
  PlatformAlerts,
  QuickActionsBar,
  DashboardRefreshButton,
  DashboardErrorBanner,
} from "../../components/super-admin/dashboard/SuperAdminDashboardSections";

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminDashboardService.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard data");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = dashboard?.stats;
  const formatted = dashboard?.statsFormatted;

  const statRows = stats ? [
    [
      { title: "Total Companies", value: String(stats.totalCompanies), icon: BusinessIcon, color: "#2563EB", bg: "#EFF6FF" },
      { title: "Active Companies", value: String(stats.activeCompanies), sub: stats.totalCompanies ? `${Math.round((stats.activeCompanies / stats.totalCompanies) * 100)}% active` : undefined, icon: CheckCircleOutlineIcon, color: "#16A34A", bg: "#F0FDF4" },
      { title: "Total Users", value: stats.totalUsers.toLocaleString("en-IN"), icon: GroupsIcon, color: "#7C3AED", bg: "#F5F3FF" },
      { title: "Total Employees", value: stats.totalEmployees.toLocaleString("en-IN"), icon: PeopleIcon, color: "#14B8A6", bg: "#F0FDFA" },
    ],
    [
      { title: "Active Subscriptions", value: String(stats.activeSubscriptions), icon: CardMembershipIcon, color: "#2563EB", bg: "#EFF6FF" },
      { title: "Trial / Pending", value: String(stats.trialPending), icon: HourglassEmptyIcon, color: "#F97316", bg: "#FFF7ED" },
      { title: "Monthly Revenue", value: formatted.monthlyRevenue, icon: CurrencyRupeeIcon, color: "#16A34A", bg: "#F0FDF4" },
      { title: "Total Revenue", value: formatted.totalRevenue, sub: "Estimated cumulative", icon: AccountBalanceWalletIcon, color: "#0EA5E9", bg: "#F0F9FF" },
    ],
    [
      { title: "Total Tasks", value: stats.totalTasks.toLocaleString("en-IN"), icon: AssignmentIcon, color: "#2563EB", bg: "#EFF6FF" },
      { title: "Completed Tasks", value: stats.completedTasks.toLocaleString("en-IN"), icon: TaskAltIcon, color: "#16A34A", bg: "#F0FDF4" },
      { title: "Pending / In Progress", value: stats.pendingInProgressTasks.toLocaleString("en-IN"), icon: PendingActionsIcon, color: "#F97316", bg: "#FFF7ED" },
      { title: "Overdue Tasks", value: stats.overdueTasks.toLocaleString("en-IN"), icon: AccessTimeIcon, color: "#DC2626", bg: "#FEF2F2" },
    ],
  ] : [];

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3, width: "100%", maxWidth: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={0.5}>
          <PageHeader title="Super Admin Dashboard" crumbs={[{ label: "Dashboard" }]} />
          <DashboardRefreshButton onRefresh={loadDashboard} loading={loading} />
        </Box>

        {error && !loading && (
          <DashboardErrorBanner message={error} onRetry={loadDashboard} />
        )}

        {loading ? (
          <LoadingSkeleton variant="dashboard" />
        ) : !dashboard ? (
          <ErrorState type="network" title="Dashboard unavailable" description={error || "Unable to load platform data."} actionLabel="Retry" onAction={loadDashboard} />
        ) : (
          <>
            {statRows.map((row, rowIdx) => (
              <Grid container spacing={2} sx={{ mb: rowIdx < statRows.length - 1 ? 2 : 2.5 }} key={rowIdx}>
                {row.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
                      <StatCard title={s.title} value={s.value} sub={s.sub} trend={s.trend} icon={Icon} color={s.color} bg={s.bg} />
                    </Grid>
                  );
                })}
              </Grid>
            ))}

            <Box sx={{ mb: 2.5 }}>
              <CompanyOverviewSummary overview={dashboard.companyOverview} />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <RecentCompaniesTable companies={dashboard.recentCompanies} />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <SubscriptionOverview planDistribution={dashboard.planDistribution} chartData={dashboard.subscriptionChartData} />
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <PlanDistribution planDistribution={dashboard.planDistribution} maxCompanies={dashboard.maxPlanCompanies} />
              </Grid>
            </Grid>

            <Box sx={{ mb: 2.5 }}>
              <PlatformTaskOverview taskStats={dashboard.taskStats} taskChartData={dashboard.taskChartData} />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <RecentPlatformActivity activities={dashboard.activities} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <PendingActionsCard actions={dashboard.pendingActions} />
              </Grid>
            </Grid>

            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <PlatformAlerts alerts={dashboard.alerts} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <QuickActionsBar />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </SuperAdminLayout>
  );
}
