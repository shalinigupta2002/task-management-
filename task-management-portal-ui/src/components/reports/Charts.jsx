import { Box, Typography, LinearProgress, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#2563EB", "#22C55E", "#F97316", "#8B5CF6", "#EF4444"];
const card = { borderRadius: 3, bgcolor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", p: 2.5 };

export default function Charts({ data, type, isLoading }) {
  if (isLoading) {
    return (
      <Box sx={{ ...card, display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={32} sx={{ color: "#2563EB" }} />
      </Box>
    );
  }

  if (!data?.length) {
    return (
      <Box sx={{ ...card, textAlign: "center", py: 8 }}>
        <Typography sx={{ color: "#94A3B8" }}>No chart data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem", mb: 2.5 }}>
        {type} Overview
      </Typography>

      <Box sx={{ height: 240, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13 }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box display="flex" flexDirection="column" gap={1.5}>
        {data.map((item, i) => {
          const max = Math.max(...data.map((d) => d.value || 1));
          const pct = Math.round(((item.value || 0) / max) * 100);
          return (
            <Box key={item.label}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>{item.label}</Typography>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: COLORS[i % COLORS.length] }}>{item.value}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: COLORS[i % COLORS.length] } }} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
