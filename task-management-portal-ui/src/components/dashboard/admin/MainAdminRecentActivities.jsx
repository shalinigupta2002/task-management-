import { Box, Typography, Chip } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { card } from "../../main-admin/shared";
import { RECENT_ACTIVITIES } from "../../../data/mainAdminData";

const TYPE_COLOR = { success: "#16A34A", warning: "#F97316", info: "#2563EB" };

export default function MainAdminRecentActivities() {
  return (
    <Box sx={card}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <HistoryIcon sx={{ color: "#2563EB" }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Recent Activities</Typography>
      </Box>
      {RECENT_ACTIVITIES.map((a) => (
        <Box key={a.id} display="flex" justifyContent="space-between" alignItems="flex-start" py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { borderBottom: "none" } }}>
          <Box display="flex" gap={1.5} alignItems="flex-start">
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TYPE_COLOR[a.type] || "#2563EB", mt: 0.8, flexShrink: 0 }} />
            <Typography sx={{ color: "#334155", fontSize: "0.85rem", lineHeight: 1.5 }}>{a.text}</Typography>
          </Box>
          <Chip label={a.time} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "#F8FAFC", color: "#94A3B8", flexShrink: 0, ml: 1 }} />
        </Box>
      ))}
    </Box>
  );
}
