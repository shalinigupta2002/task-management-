import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Link, FormControl, InputLabel, Select, MenuItem, TextField, TablePagination, IconButton, Tooltip,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { card, StatusBadge, tableHeadCell, fieldSx } from "../shared";
import { EmptyState, ExportButtons } from "../../shared";
import { DATE_PRESET_OPTIONS, formatINR } from "../../../utils/superAdminReports";

const sectionCard = { ...card, height: "100%" };
const TYPE_COLOR = { success: "#16A34A", warning: "#F97316", info: "#2563EB", alert: "#DC2626" };
const PIE_COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#F97316", "#DC2626", "#0EA5E9"];

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

export function ReportFiltersBar({
  datePreset, customStart, customEnd, companyId, planId,
  companies, plans, onChange, onRefresh, loading,
}) {
  return (
    <Box sx={{ ...card, mb: 2.5, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end" }}>
      <FormControl size="small" sx={{ minWidth: 160, ...fieldSx }}>
        <InputLabel>Date Range</InputLabel>
        <Select label="Date Range" value={datePreset} onChange={(e) => onChange({ datePreset: e.target.value })}>
          {DATE_PRESET_OPTIONS.map((o) => (
            <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {datePreset === "custom" && (
        <>
          <TextField size="small" label="From" type="date" value={customStart} onChange={(e) => onChange({ customStart: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ ...fieldSx, width: 160 }} />
          <TextField size="small" label="To" type="date" value={customEnd} onChange={(e) => onChange({ customEnd: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ ...fieldSx, width: 160 }} />
        </>
      )}
      <FormControl size="small" sx={{ minWidth: 180, ...fieldSx }}>
        <InputLabel>Company</InputLabel>
        <Select label="Company" value={companyId || ""} onChange={(e) => onChange({ companyId: e.target.value || null })}>
          <MenuItem value="">All Companies</MenuItem>
          {companies.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 160, ...fieldSx }}>
        <InputLabel>Plan</InputLabel>
        <Select label="Plan" value={planId || ""} onChange={(e) => onChange({ planId: e.target.value || null })}>
          <MenuItem value="">All Plans</MenuItem>
          {plans.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Tooltip title="Refresh report">
        <IconButton onClick={onRefresh} disabled={loading} size="small" sx={{ border: "1px solid #E8EDF5", borderRadius: 2 }}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export function RevenueAnalytics({ revenue }) {
  if (!revenue?.series?.length) {
    return (
      <Box sx={sectionCard}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Revenue Analytics</Typography>
        <EmptyState type="reports" title="No revenue data available" description="Revenue will appear once companies have active subscriptions." />
      </Box>
    );
  }

  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Revenue Analytics</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: "Current Period", value: revenue.currentFormatted, sub: revenue.growthLabel, positive: revenue.growth >= 0 },
          { label: "Previous Period", value: revenue.previousFormatted },
          { label: "Growth", value: revenue.growthLabel, sub: "vs previous period", positive: revenue.growth >= 0 },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#F8FAFC" }}>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>{item.label}</Typography>
              <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem" }}>{item.value}</Typography>
              {item.sub && (
                <Typography sx={{ fontSize: "0.75rem", color: item.positive ? "#16A34A" : "#DC2626", fontWeight: 600 }}>{item.sub}</Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenue.series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <RechartsTooltip formatter={(v) => [formatINR(v), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export function CompanyAnalyticsSection({ company }) {
  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Company Analytics" actionLabel="View Companies" actionTo="/super-admin/companies" />
      <Box display="flex" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
        {[
          { label: "Total", value: company.total },
          { label: "Active", value: company.active },
          { label: "Suspended", value: company.suspended },
          { label: "Trial", value: company.trial },
          { label: "New in Period", value: company.newlyRegistered },
        ].map((item) => (
          <Box key={item.label} sx={{ flex: { xs: "1 1 calc(50% - 12px)", sm: "1 1 calc(33% - 12px)", md: "1 1 calc(20% - 12px)" }, minWidth: 90 }}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#F8FAFC", textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, color: "#2563EB", fontSize: "1.1rem" }}>{item.value}</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B" }}>{item.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ height: 200 }}>
            {company.growthSeries?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={company.growthSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="total" name="Total Companies" stroke="#2563EB" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="newly" name="New" stroke="#16A34A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState type="companies" title="No growth data" description="Company growth chart unavailable for this filter." />
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Status", "Companies", "%"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {company.statusBreakdown.map((s) => (
                <TableRow key={s.status}>
                  <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{s.status}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem" }}>{s.count}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem" }}>{s.pct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Box>
  );
}

export function SubscriptionAnalyticsSection({ subscription }) {
  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Subscription Analytics" actionLabel="Manage Plans" actionTo="/super-admin/plans" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          {subscription.planPieData?.length ? (
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subscription.planPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {subscription.planPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState type="plans" title="No subscriptions" description="No plan distribution data for current filters." />
          )}
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Plan", "Companies", "%", "Revenue", "Active"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {subscription.planDistribution.map((p) => (
                <TableRow key={p.id}>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{p.name}</TableCell>
                  <TableCell>{p.companies}</TableCell>
                  <TableCell>{p.pct}%</TableCell>
                  <TableCell sx={{ color: "#16A34A", fontWeight: 600 }}>{formatINR(p.revenue)}</TableCell>
                  <TableCell>{p.activeSubscriptions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", mb: 1.5, color: "#64748B" }}>Subscription Status</Typography>
          {subscription.subscriptionStatus.length === 0 ? (
            <EmptyState type="generic" title="No status data" />
          ) : (
            subscription.subscriptionStatus.map((s) => (
              <Box key={s.status} mb={1.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{s.status}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>{s.count}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, s.count * 20)} sx={{ height: 6, borderRadius: 3, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#2563EB", borderRadius: 3 } }} />
              </Box>
            ))
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export function UserAnalyticsSection({ users }) {
  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>User Analytics</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Role", "Count"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.roles.map((r) => (
                <TableRow key={r.role}>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{r.role}</TableCell>
                  <TableCell>{r.count.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={users.roles} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} allowDecimals={false} />
                <YAxis type="category" dataKey="role" tick={{ fontSize: 10, fill: "#64748B" }} width={90} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box display="flex" gap={2} mt={1.5} flexWrap="wrap">
            <Chip label={`Active: ${users.activeUsers}`} size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }} />
            <Chip label={`Inactive: ${users.inactiveUsers}`} size="small" sx={{ bgcolor: "#F1F5F9", color: "#64748B", fontWeight: 600 }} />
            <Chip label={`New: ${users.newUsers}`} size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export function TaskAnalyticsSection({ tasks }) {
  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Task Analytics</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          {tasks.stats.total > 0 ? (
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tasks.chartData.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {tasks.chartData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState type="tasks" title="No tasks found" />
          )}
          <Box display="flex" gap={2} mt={1}>
            <Chip label={`Completion: ${tasks.completionRate}%`} size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }} />
            <Chip label={`Overdue: ${tasks.overdueRate}%`} size="small" sx={{ bgcolor: "#DC2626", color: "#FFFFFF", fontWeight: 700 }} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", mb: 1, color: "#64748B" }}>Priority Breakdown</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Priority", "Total", "Completed", "Pending"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.priorityAnalytics.map((p) => (
                <TableRow key={p.priority}>
                  <TableCell sx={{ fontWeight: 600 }}>{p.priority}</TableCell>
                  <TableCell>{p.total}</TableCell>
                  <TableCell sx={{ color: "#16A34A" }}>{p.completed}</TableCell>
                  <TableCell>{p.pending}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Box>
  );
}

export function CategoryAnalyticsTable({ categories }) {
  return (
    <Box sx={{ ...sectionCard, p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Tasks by Category</Typography>
      </Box>
      {categories.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}><EmptyState type="tasks" title="No category data" description="Task categories will appear when available." /></Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Category", "Task Count", "Completed", "Pending", "Completion %"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{c.name}</TableCell>
                  <TableCell>{c.total}</TableCell>
                  <TableCell sx={{ color: "#16A34A" }}>{c.completed}</TableCell>
                  <TableCell>{c.pending}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress variant="determinate" value={c.pct} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#2563EB", borderRadius: 3 } }} />
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, minWidth: 32 }}>{c.pct}%</Typography>
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

export function CompanyPerformanceTable({ rows }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  return (
    <Box sx={{ ...sectionCard, p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <SectionHeader title="Company Performance" actionLabel="View All Companies" actionTo="/super-admin/companies" />
      </Box>
      {rows.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}><EmptyState type="companies" title="No companies found" /></Box>
      ) : (
        <>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Company", "Plan", "Employees", "Total Tasks", "Completed", "Pending", "Overdue", "Completion %", "Status"].map((h) => (
                    <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{c.name}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{c.plan}</TableCell>
                    <TableCell>{c.employees}</TableCell>
                    <TableCell>{c.totalTasks}</TableCell>
                    <TableCell sx={{ color: "#16A34A" }}>{c.completedTasks}</TableCell>
                    <TableCell>{c.pendingTasks}</TableCell>
                    <TableCell sx={{ color: "#DC2626" }}>{c.overdueTasks}</TableCell>
                    <TableCell>{c.completionPct}%</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10]}
          />
        </>
      )}
    </Box>
  );
}

export function TopCompaniesTable({ rows }) {
  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Top Performing Companies</Typography>
      {rows.length === 0 ? (
        <EmptyState type="companies" title="No ranking data" description="Companies need tasks to appear in rankings." />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Rank", "Company", "Completed", "Total Tasks", "Completion %"].map((h) => (
                <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={{ fontWeight: 700, color: "#2563EB" }}>#{c.rank}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                <TableCell sx={{ color: "#16A34A" }}>{c.completedTasks}</TableCell>
                <TableCell>{c.totalTasks}</TableCell>
                <TableCell>{c.completionPct}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

export function RevenueByPlanTable({ rows }) {
  return (
    <Box sx={{ ...sectionCard, p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Revenue by Plan</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Plan", "Subscribers", "Price (₹/mo)", "Revenue", "% of Revenue"].map((h) => (
                <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                <TableCell>{p.companies}</TableCell>
                <TableCell>{formatINR(p.price)}</TableCell>
                <TableCell sx={{ color: "#16A34A", fontWeight: 600 }}>{formatINR(p.revenue)}</TableCell>
                <TableCell>{p.revenuePct}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function SubscriptionsAttentionTable({ rows }) {
  return (
    <Box sx={{ ...sectionCard, p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Subscriptions Requiring Attention</Typography>
      </Box>
      {rows.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}><EmptyState type="generic" title="No subscriptions need attention" description="All subscriptions are in good standing." /></Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Company", "Plan", "Expiry Date", "Status", "Action"].map((h) => (
                  <TableCell key={h} sx={tableHeadCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={`${r.id}-${r.status}`} hover>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{r.name}</TableCell>
                  <TableCell>{r.plan}</TableCell>
                  <TableCell>{r.expiry}</TableCell>
                  <TableCell><StatusBadge status={r.status === "Expiring Soon" ? "Pending" : r.status} /></TableCell>
                  <TableCell>
                    <IconButton component={RouterLink} to={`/super-admin/companies/${r.id}`} size="small" sx={{ color: "#2563EB" }}>
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

export function RecentActivitySection({ activities }) {
  return (
    <Box sx={sectionCard}>
      <SectionHeader title="Recent Platform Activity" actionLabel="Audit Logs" actionTo="/super-admin/audit-logs" />
      {activities.length === 0 ? (
        <EmptyState type="generic" title="No recent activity" />
      ) : (
        activities.map((a) => (
          <Box key={a.id} display="flex" justifyContent="space-between" py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { border: 0 } }}>
            <Box display="flex" gap={1.5} minWidth={0}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TYPE_COLOR[a.type] || "#2563EB", mt: 0.7, flexShrink: 0 }} />
              <Box minWidth={0}>
                <Typography sx={{ fontSize: "0.85rem", color: "#334155", fontWeight: 600 }}>{a.description}</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>{a.entity} · {a.user}</Typography>
              </Box>
            </Box>
            <Chip label={a.time} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "#F8FAFC", color: "#94A3B8", flexShrink: 0, ml: 1 }} />
          </Box>
        ))
      )}
    </Box>
  );
}

export function ExportReportSection({ onExportCsv, onPrint }) {
  return (
    <Box sx={sectionCard}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Export Report</Typography>
      <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>Export the currently filtered report summary.</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <ExportButtons formats={["CSV", "Excel", "Print"]} filename="taskflow-platform-report" />
        <Link component="button" type="button" onClick={onExportCsv} sx={{ fontSize: "0.8rem", color: "#2563EB", cursor: "pointer", border: 0, bgcolor: "transparent" }}>
          Download full CSV
        </Link>
        <Link component="button" type="button" onClick={onPrint} sx={{ fontSize: "0.8rem", color: "#2563EB", cursor: "pointer", border: 0, bgcolor: "transparent" }}>
          Print report
        </Link>
      </Box>
    </Box>
  );
}