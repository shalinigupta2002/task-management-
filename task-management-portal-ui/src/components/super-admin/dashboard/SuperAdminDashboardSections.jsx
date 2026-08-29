import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Link, Button, IconButton, Tooltip,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import AddIcon from "@mui/icons-material/Add";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { card, StatusBadge, tableHeadCell } from "../shared";
import { EmptyState } from "../../shared";
import { formatINR } from "../../../utils/superAdminDashboard";

const sectionCard = { ...card, height: "100%" };

const TYPE_COLOR = { success: "#16A34A", warning: "#F97316", info: "#2563EB", alert: "#DC2626" };

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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr || "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function DashboardRefreshButton({ onRefresh, loading }) {
  return (
    <Tooltip title="Refresh dashboard">
      <IconButton onClick={onRefresh} disabled={loading} size="small" sx={{ color: "#64748B", border: "1px solid #E8EDF5", borderRadius: 2 }}>
        <RefreshIcon fontSize="small" sx={loading ? { animation: "spin 1s linear infinite", "@keyframes spin": { "100%": { transform: "rotate(360deg)" } } } : undefined} />
      </IconButton>
    </Tooltip>
  );
}

export function CompanyOverviewSummary({ overview }) {
  const items = [
    { label: "Total", value: overview.total, color: "#2563EB" },
    { label: "Active", value: overview.active, color: "#16A34A" },
    { label: "Suspended", value: overview.suspended, color: "#DC2626" },
    { label: "Trial", value: overview.trial, color: "#7C3AED" },
    { label: "Pending", value: overview.pending, color: "#F97316" },
  ];

  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Company Overview" actionLabel="View All Companies" actionTo="/super-admin/companies" />
      <Box display="flex" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
        {items.map((item) => (
          <Box key={item.label} sx={{ flex: { xs: "1 1 calc(50% - 12px)", sm: "1 1 calc(33.33% - 12px)", md: "1 1 calc(20% - 12px)" }, minWidth: 100 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#F8FAFC", textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, color: item.color, fontSize: "1.25rem" }}>{item.value}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>{item.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function RecentCompaniesTable({ companies }) {
  return (
    <Box sx={{ ...sectionCard, p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <SectionHeader title="Recent Companies" actionLabel="View All Companies" actionTo="/super-admin/companies" />
      </Box>
      {companies.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}>
          <EmptyState type="companies" title="No companies yet" description="Registered companies will appear here." />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Company Name", "Main Admin", "Plan", "Users", "Status", "Created", "Action"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.5 } }}>
                  <TableCell sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{c.name}</TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{c.mainAdmin?.name || "—"}</TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>{c.planName || "—"}</TableCell>
                  <TableCell sx={{ color: "#334155", fontSize: "0.85rem" }}>{c.employees ?? 0}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{formatDate(c.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      component={RouterLink}
                      to={`/super-admin/companies/${c.id}`}
                      size="small"
                      sx={{ color: "#2563EB" }}
                      aria-label={`View ${c.name}`}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
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

export function SubscriptionOverview({ planDistribution, chartData }) {
  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Subscription Overview" actionLabel="Manage Plans" actionTo="/super-admin/plans" />
      {planDistribution.length === 0 ? (
        <EmptyState type="plans" title="No plans configured" description="Add subscription plans to see distribution." />
      ) : (
        <>
          {chartData.length > 0 && (
            <Box sx={{ height: 180, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip formatter={(value, name) => [name === "revenue" ? formatINR(value) : value, name === "revenue" ? "Revenue" : "Companies"]} />
                  <Bar dataKey="companies" name="Companies" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill="#2563EB" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Plan", "Companies", "Revenue / mo", "Status"].map((h) => (
                    <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {planDistribution.map((p) => (
                  <TableRow key={p.id} sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 1.25 } }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{p.name}</TableCell>
                    <TableCell sx={{ color: "#64748B" }}>{p.companies}</TableCell>
                    <TableCell sx={{ color: "#16A34A", fontWeight: 600 }}>{formatINR(p.revenue)}</TableCell>
                    <TableCell>
                      <Chip label={p.enabled ? "Active" : "Disabled"} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: p.enabled ? "#F0FDF4" : "#F1F5F9", color: p.enabled ? "#16A34A" : "#64748B" }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

export function PlanDistribution({ planDistribution, maxCompanies }) {
  const navigate = useNavigate();

  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Plan Distribution" actionLabel="View Plans" actionTo="/super-admin/plans" />
      {planDistribution.length === 0 ? (
        <EmptyState type="plans" title="No plan data" description="Plan distribution will appear once companies subscribe." />
      ) : (
        planDistribution.map((p) => (
          <Box
            key={p.id}
            mb={1.75}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/super-admin/plans")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/super-admin/plans")}
          >
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>{p.name}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{p.companies} companies</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(p.companies / maxCompanies) * 100}
              sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#2563EB", borderRadius: 4 } }}
            />
          </Box>
        ))
      )}
    </Box>
  );
}

export function PlatformTaskOverview({ taskStats, taskChartData }) {
  const items = [
    { label: "Open", count: taskStats.open, color: "#F97316" },
    { label: "In Progress", count: taskStats.inProgress, color: "#2563EB" },
    { label: "Completed", count: taskStats.completed, color: "#16A34A" },
    { label: "Overdue", count: taskStats.overdue, color: "#DC2626" },
  ];

  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Platform Task Overview" actionLabel="View Reports" actionTo="/super-admin/reports" />
      <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
        {taskStats.total.toLocaleString("en-IN")} total tasks across all tenants
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {items.map((item) => (
          <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${item.color}14`, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, color: item.color, fontSize: "1.2rem" }}>{item.count}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>{item.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {taskStats.total > 0 && (
        <Box sx={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskChartData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} width={72} axisLine={false} tickLine={false} />
              <RechartsTooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {taskChartData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export function RecentPlatformActivity({ activities }) {
  return (
    <Box sx={sectionCard}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <HistoryIcon sx={{ color: "#2563EB", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", flex: 1 }}>Recent Platform Activity</Typography>
        <Link component={RouterLink} to="/super-admin/audit-logs" underline="hover" sx={{ color: "#2563EB", fontSize: "0.78rem", fontWeight: 600 }}>
          View Audit Logs
        </Link>
      </Box>
      {activities.length === 0 ? (
        <EmptyState type="generic" title="No recent activity" description="Platform events will appear here." />
      ) : (
        activities.map((a) => (
          <Box key={a.id} display="flex" justifyContent="space-between" alignItems="flex-start" py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { borderBottom: "none" } }}>
            <Box display="flex" gap={1.5} alignItems="flex-start" minWidth={0}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TYPE_COLOR[a.type] || "#2563EB", mt: 0.8, flexShrink: 0 }} />
              <Box minWidth={0}>
                <Typography sx={{ color: "#334155", fontSize: "0.85rem", lineHeight: 1.45 }}>{a.description}</Typography>
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

export function PendingActionsCard({ actions }) {
  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Pending Actions</Typography>
      {actions.length === 0 ? (
        <EmptyState type="generic" title="All clear" description="No pending actions require your attention." />
      ) : (
        actions.map((a) => (
          <Box
            key={a.id}
            component={RouterLink}
            to={a.path}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1.25,
              px: 1.5,
              mb: 1,
              borderRadius: 2,
              bgcolor: "#FFF7ED",
              border: "1px solid #FED7AA",
              textDecoration: "none",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#FFEDD5", borderColor: "#F97316" },
            }}
          >
            <WarningAmberIcon sx={{ color: "#F97316", fontSize: 20 }} />
            <Typography sx={{ color: "#9A3412", fontSize: "0.85rem", fontWeight: 600 }}>{a.label}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

export function PlatformAlerts({ alerts }) {
  return (
    <Box sx={sectionCard}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <NotificationsNoneIcon sx={{ color: "#2563EB", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", flex: 1 }}>Platform Alerts</Typography>
        <Link component={RouterLink} to="/super-admin/notifications" underline="hover" sx={{ color: "#2563EB", fontSize: "0.78rem", fontWeight: 600 }}>
          View All
        </Link>
      </Box>
      {alerts.length === 0 ? (
        <EmptyState type="notifications" title="No alerts" description="Important platform alerts will show here." />
      ) : (
        alerts.map((a) => (
          <Box key={a.id} py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { borderBottom: "none" } }}>
            <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem" }}>{a.title}</Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mt: 0.3 }}>{a.message}</Typography>
            <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.3 }}>{a.time}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

const QUICK_ACTIONS = [
  { label: "Add Company", icon: AddIcon, color: "#2563EB", bg: "#EFF6FF", path: "/super-admin/companies/add" },
  { label: "Manage Plans", icon: CardMembershipIcon, color: "#7C3AED", bg: "#F5F3FF", path: "/super-admin/plans" },
  { label: "View Companies", icon: BusinessIcon, color: "#14B8A6", bg: "#F0FDFA", path: "/super-admin/companies" },
  { label: "View Reports", icon: AssessmentIcon, color: "#F97316", bg: "#FFF7ED", path: "/super-admin/reports" },
  { label: "Audit Logs", icon: HistoryIcon, color: "#64748B", bg: "#F1F5F9", path: "/super-admin/audit-logs" },
  { label: "Notifications", icon: NotificationsNoneIcon, color: "#0EA5E9", bg: "#F0F9FF", path: "/super-admin/notifications" },
];

export function QuickActionsBar() {
  const navigate = useNavigate();

  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Quick Actions</Typography>
      <Box display="flex" flexWrap="wrap" gap={1.5}>
        {QUICK_ACTIONS.map((q) => {
          const Icon = q.icon;
          return (
            <Box key={q.label} sx={{ flex: { xs: "1 1 calc(50% - 12px)", sm: "1 1 calc(33.33% - 12px)", md: "1 1 calc(16.66% - 12px)" }, minWidth: 120 }}>
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

export function DashboardErrorBanner({ message, onRetry }) {
  return (
    <Box sx={{ ...card, mb: 2, bgcolor: "#FEF2F2", borderColor: "#FECACA" }}>
      <Typography sx={{ color: "#991B1B", fontSize: "0.9rem", mb: 1 }}>{message}</Typography>
      <Button size="small" onClick={onRetry} sx={{ textTransform: "none", color: "#DC2626" }}>Retry</Button>
    </Box>
  );
}
