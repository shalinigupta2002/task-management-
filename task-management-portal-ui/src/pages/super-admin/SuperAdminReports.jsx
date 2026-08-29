import { useCallback, useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { StatCard, PageHeader } from "../../components/super-admin/shared";
import { LoadingSkeleton, ErrorState } from "../../components/shared";
import superAdminReportsService from "../../services/superAdminReportsService";
import { getCompanies, getPlans } from "../../utils/superAdminStorage";
import { downloadReportCsv, printReport } from "../../utils/superAdminReports";
import {
  ReportFiltersBar,
  RevenueAnalytics,
  CompanyAnalyticsSection,
  SubscriptionAnalyticsSection,
  UserAnalyticsSection,
  TaskAnalyticsSection,
  CategoryAnalyticsTable,
  CompanyPerformanceTable,
  TopCompaniesTable,
  RevenueByPlanTable,
  SubscriptionsAttentionTable,
  RecentActivitySection,
  ExportReportSection,
} from "../../components/super-admin/reports/SuperAdminReportsSections";

export default function SuperAdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    datePreset: "last30",
    customStart: "",
    customEnd: "",
    companyId: null,
    planId: null,
  });

  const allCompanies = getCompanies();
  const allPlans = getPlans();

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminReportsService.getReports(filters);
      setReport(res.data);
    } catch (err) {
      setError(err?.message || "Failed to load reports");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleFilterChange = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const overview = report?.overview;

  const statCards = overview ? [
    { title: "Total Revenue", value: overview.totalRevenueFormatted, sub: "Selected period", icon: TrendingUpIcon, color: "#16A34A", bg: "#F0FDF4" },
    { title: "Monthly Recurring Revenue", value: overview.mrrFormatted, sub: "MRR", icon: CurrencyRupeeIcon, color: "#0EA5E9", bg: "#F0F9FF" },
    { title: "Active Companies", value: String(overview.activeCompanies), icon: BusinessIcon, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Total Companies", value: String(overview.totalCompanies), icon: BusinessIcon, color: "#64748B", bg: "#F1F5F9" },
    { title: "Total Users", value: overview.totalUsers.toLocaleString("en-IN"), icon: GroupsIcon, color: "#7C3AED", bg: "#F5F3FF" },
    { title: "Total Employees", value: overview.totalEmployees.toLocaleString("en-IN"), icon: PeopleIcon, color: "#14B8A6", bg: "#F0FDFA" },
    { title: "Total Tasks", value: overview.totalTasks.toLocaleString("en-IN"), icon: AssignmentIcon, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Completion Rate", value: overview.completionRateLabel, sub: "Platform average", icon: TaskAltIcon, color: "#16A34A", bg: "#F0FDF4" },
  ] : [];

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3, width: "100%", maxWidth: "100%" }} className="print-area">
        <PageHeader title="Reports" crumbs={[{ label: "Reports" }]} />

        <ReportFiltersBar
          {...filters}
          companies={allCompanies}
          plans={allPlans}
          onChange={handleFilterChange}
          onRefresh={loadReport}
          loading={loading}
        />

        {error && !loading && (
          <ErrorState type="network" title="Report load failed" description={error} actionLabel="Retry" onAction={loadReport} />
        )}

        {loading ? (
          <LoadingSkeleton variant="dashboard" />
        ) : report ? (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {statCards.slice(0, 4).map((s) => {
                const Icon = s.icon;
                return (
                  <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title={s.title} value={s.value} sub={s.sub} icon={Icon} color={s.color} bg={s.bg} />
                  </Grid>
                );
              })}
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {statCards.slice(4).map((s) => {
                const Icon = s.icon;
                return (
                  <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title={s.title} value={s.value} sub={s.sub} icon={Icon} color={s.color} bg={s.bg} />
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ mb: 2.5 }}>
              <RevenueAnalytics revenue={report.revenue} />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <CompanyAnalyticsSection company={report.company} />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <SubscriptionAnalyticsSection subscription={report.subscription} />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <UserAnalyticsSection users={report.users} />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <TopCompaniesTable rows={report.topCompanies} />
              </Grid>
            </Grid>

            <Box sx={{ mb: 2.5 }}>
              <TaskAnalyticsSection tasks={report.tasks} />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <CategoryAnalyticsTable categories={report.tasks.categoryAnalytics} />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <CompanyPerformanceTable rows={report.companyPerformance} />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <RevenueByPlanTable rows={report.subscription.revenueByPlan} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SubscriptionsAttentionTable rows={report.subscriptionsAttention} />
              </Grid>
            </Grid>

            <Box sx={{ mb: 2.5 }}>
              <RecentActivitySection activities={report.activities} />
            </Box>

            <ExportReportSection
              onExportCsv={() => downloadReportCsv(report.exportRows)}
              onPrint={printReport}
            />
          </>
        ) : null}
      </Box>
    </SuperAdminLayout>
  );
}
