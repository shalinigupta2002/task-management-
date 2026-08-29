import { Box, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import { card } from "../../main-admin/shared";

const DEPT_PERF = [
  { name: "IT", pct: 92 },
  { name: "HR", pct: 88 },
  { name: "Finance", pct: 85 },
  { name: "Operations", pct: 78 },
  { name: "Compliance", pct: 95 },
];

const EMP_PERF = [
  { name: "Anita Desai", pct: 98 },
  { name: "Rahul Verma", pct: 94 },
  { name: "Priya Sharma", pct: 91 },
  { name: "Amit Patel", pct: 87 },
];

function BarRow({ label, pct, color }) {
  return (
    <Box mb={1.5}>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography sx={{ fontSize: "0.82rem", color: "#334155", fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>{pct}%</Typography>
      </Box>
      <Box sx={{ height: 8, bgcolor: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: color, borderRadius: 4 }} />
      </Box>
    </Box>
  );
}

export default function MainAdminCharts() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2.5 }}>
      <Box sx={card}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon sx={{ color: "#2563EB" }} />
          <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Task Completion</Typography>
        </Box>
        <Box textAlign="center" py={2}>
          <Typography sx={{ fontWeight: 800, fontSize: "2.5rem", color: "#2563EB" }}>78%</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>Overall completion rate this month</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          {[{ l: "Completed", v: 432, c: "#16A34A" }, { l: "Pending", v: 356, c: "#F97316" }, { l: "Overdue", v: 98, c: "#DC2626" }].map((x) => (
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
          <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Department Performance</Typography>
        </Box>
        {DEPT_PERF.map((d) => <BarRow key={d.name} label={d.name} pct={d.pct} color="#7C3AED" />)}
      </Box>

      <Box sx={card}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BarChartIcon sx={{ color: "#14B8A6" }} />
          <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Employee Performance</Typography>
        </Box>
        {EMP_PERF.map((e) => <BarRow key={e.name} label={e.name} pct={e.pct} color="#14B8A6" />)}
      </Box>
    </Box>
  );
}
