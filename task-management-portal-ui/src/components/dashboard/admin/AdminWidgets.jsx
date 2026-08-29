import { Box, Typography, Grid, Avatar, Chip, LinearProgress, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5", p: 2.5, height: "100%" };

const OVERDUE = [
  { task: "Security Audit Checklist", user: "Rahul Verma", due: "20 May 2025", days: 6 },
  { task: "Quarterly Budget Review", user: "Priya Sharma", due: "22 May 2025", days: 4 },
  { task: "Compliance Report Q2", user: "Amit Patel", due: "24 May 2025", days: 2 },
];

const TOP_USERS = [
  { name: "Anita Desai", done: 42, active: 8, overdue: 1, av: "AD" },
  { name: "Rahul Verma", done: 38, active: 12, overdue: 3, av: "RV" },
  { name: "Priya Sharma", done: 35, active: 6, overdue: 0, av: "PS" },
];

const DEPTS = [
  { name: "IT", total: 320, open: 80, progress: 65, color: "#2563EB" },
  { name: "Compliance", total: 280, open: 60, progress: 55, color: "#7C3AED" },
  { name: "Finance", total: 210, open: 45, progress: 70, color: "#16A34A" },
  { name: "HR", total: 180, open: 30, progress: 80, color: "#F97316" },
];

const QUICK = [
  { label: "Create Task", icon: AddIcon, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Assign Task", icon: AssignmentIcon, color: "#16A34A", bg: "#F0FDF4" },
  { label: "Add User", icon: PersonAddIcon, color: "#7C3AED", bg: "#F5F3FF" },
  { label: "Add Department", icon: ApartmentIcon, color: "#F97316", bg: "#FFF7ED" },
  { label: "Generate Report", icon: AssessmentIcon, color: "#14B8A6", bg: "#F0FDFA" },
];

const SYSTEM = [
  { label: "Active Workflows", value: "24", icon: AccountTreeIcon, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Pending Approvals", value: "8", icon: AssignmentIcon, color: "#F97316", bg: "#FFF7ED" },
  { label: "Tasks Due Today", value: "15", icon: AssignmentIcon, color: "#EF4444", bg: "#FEF2F2" },
  { label: "Tasks Nearing Due", value: "32", icon: AssignmentIcon, color: "#D97706", bg: "#FFFBEB" },
];

const ACTIVITY = [
  { text: "Anita Sharma completed task Monthly Compliance Report", time: "10 min ago", color: "#16A34A" },
  { text: "New approval request from Rahul Verma", time: "25 min ago", color: "#2563EB" },
  { text: "Priya Sharma assigned task IT Asset Verification", time: "1 hour ago", color: "#7C3AED" },
  { text: "System backup check marked overdue", time: "2 hours ago", color: "#EF4444" },
  { text: "New user Amit Patel added to Finance dept", time: "3 hours ago", color: "#14B8A6" },
];

export function AdminDataRow() {
  return (
    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={4}>
        <Box sx={card}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Recent Overdue Tasks</Typography>
            <Typography sx={{ color: "#2563EB", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>View All</Typography>
          </Box>
          {OVERDUE.map((t) => (
            <Box key={t.task} py={1.2} sx={{ borderBottom: "1px solid #F1F5F9" }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>{t.task}</Typography>
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem" }}>{t.user} · Due {t.due}</Typography>
                </Box>
                <Chip label={`${t.days}d overdue`} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#DC2626", color: "#FFFFFF" }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Box sx={card}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Top Active Users</Typography>
          {TOP_USERS.map((u) => (
            <Box key={u.name} display="flex" alignItems="center" gap={1.5} py={1.2} sx={{ borderBottom: "1px solid #F1F5F9" }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.8rem" }}>{u.av}</Avatar>
              <Box flex={1}>
                <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>{u.name}</Typography>
                <Box display="flex" gap={1.5} mt={0.3}>
                  <Typography sx={{ fontSize: "0.7rem", color: "#16A34A" }}>{u.done} done</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#F97316" }}>{u.active} active</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#EF4444" }}>{u.overdue} overdue</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Box sx={card}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Tasks by Department</Typography>
          {DEPTS.map((d) => (
            <Box key={d.name} mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>{d.name}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{d.total} tasks</Typography>
              </Box>
              <LinearProgress variant="determinate" value={d.progress} sx={{ height: 6, borderRadius: 3, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: d.color, borderRadius: 3 } }} />
            </Box>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}

export function AdminBottomRow() {
  return (
    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={4}>
        <Box sx={card}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Quick Actions</Typography>
          <Grid container spacing={1.5}>
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <Grid item xs={6} key={q.label}>
                  <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 2.5, border: "1px solid #E8EDF5", cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: q.bg, borderColor: q.color } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: q.bg, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 0.8 }}>
                      <Icon sx={{ color: q.color, fontSize: 22 }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>{q.label}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Box sx={card}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>System Summary</Typography>
          <Grid container spacing={1.5}>
            {SYSTEM.map((s) => {
              const Icon = s.icon;
              return (
                <Grid item xs={6} key={s.label}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: s.bg, textAlign: "center" }}>
                    <Icon sx={{ color: s.color, fontSize: 24, mb: 0.5 }} />
                    <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.25rem" }}>{s.value}</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 500 }}>{s.label}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Box sx={card}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Activity Feed</Typography>
            <Typography sx={{ color: "#2563EB", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>View All</Typography>
          </Box>
          {ACTIVITY.map((a, i) => (
            <Box key={i} display="flex" gap={1.5} py={1.2} sx={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: a.color, mt: 0.6, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.4 }}>{a.text}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.3 }}>{a.time}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}

export function AdminToolbar() {
  return (
    <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" gap={2} mb={2.5}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{ bgcolor: "#FFF", border: "1px solid #E8EDF5", borderRadius: 2, px: 2, py: 0.8, fontSize: "0.85rem", color: "#334155", fontWeight: 500 }}>
          20 May 2025 – 26 May 2025
        </Box>
        <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>This Week</Typography>
      </Box>
      <Button variant="contained" startIcon={<AssessmentIcon />} sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>
        Export Report
      </Button>
    </Box>
  );
}
