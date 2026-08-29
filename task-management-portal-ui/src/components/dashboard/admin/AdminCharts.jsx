import { Box, Typography, Grid } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E8EDF5", p: 2.5, height: "100%" };

const STATUS = [
  { name: "Open", value: 312, color: "#2563EB" },
  { name: "In Progress", value: 356, color: "#F97316" },
  { name: "Completed", value: 432, color: "#16A34A" },
  { name: "Overdue", value: 98, color: "#EF4444" },
  { name: "Closed", value: 50, color: "#94A3B8" },
];

const PRIORITY = [
  { name: "High", value: 420, color: "#EF4444" },
  { name: "Medium", value: 548, color: "#F97316" },
  { name: "Low", value: 280, color: "#16A34A" },
];

const TREND = [
  { day: "Mon", created: 45, completed: 32, overdue: 8 },
  { day: "Tue", created: 52, completed: 38, overdue: 6 },
  { day: "Wed", created: 38, completed: 42, overdue: 10 },
  { day: "Thu", created: 60, completed: 45, overdue: 5 },
  { day: "Fri", created: 48, completed: 50, overdue: 7 },
  { day: "Sat", created: 25, completed: 28, overdue: 3 },
  { day: "Sun", created: 20, completed: 22, overdue: 2 },
];

function DonutChart({ data, total, title }) {
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>{title}</Typography>
      <Box sx={{ height: 200, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>{total}</Typography>
          <Typography sx={{ color: "#94A3B8", fontSize: "0.65rem" }}>Total</Typography>
        </Box>
      </Box>
      <Box mt={1}>
        {data.map((d) => (
          <Box key={d.name} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Box display="flex" alignItems="center" gap={0.8}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.color }} />
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{d.name}</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>{d.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function AdminCharts() {
  return (
    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={4}>
        <DonutChart data={STATUS} total="1,248" title="Tasks by Status" />
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={card}>
          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", mb: 2 }}>Tasks Trend</Typography>
          <Box sx={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="created" stroke="#2563EB" strokeWidth={2} dot={false} name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#16A34A" strokeWidth={2} dot={false} name="Completed" />
                <Line type="monotone" dataKey="overdue" stroke="#EF4444" strokeWidth={2} dot={false} name="Overdue" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <DonutChart data={PRIORITY} total="1,248" title="Tasks by Priority" />
      </Grid>
    </Grid>
  );
}
