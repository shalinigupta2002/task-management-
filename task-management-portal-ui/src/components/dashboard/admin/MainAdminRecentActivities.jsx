import { useEffect, useState } from "react";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { card } from "../../main-admin/shared";
import auditLogService from "../../../services/auditLogService";

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function MainAdminRecentActivities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const result = await auditLogService.getAll({ limit: 10 });
        const list = result.items || (Array.isArray(result) ? result : []);
        if (active) setItems(Array.isArray(list) ? list.slice(0, 10) : []);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <Box sx={card}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <HistoryIcon sx={{ color: "#2563EB" }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Recent Activities</Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" py={3}><CircularProgress size={24} /></Box>
      ) : items.length === 0 ? (
        <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>No recent activity yet.</Typography>
      ) : (
        items.map((a) => (
          <Box key={a.id} display="flex" justifyContent="space-between" alignItems="flex-start" py={1.25} sx={{ borderBottom: "1px solid #F1F5F9", "&:last-child": { borderBottom: "none" } }}>
            <Box display="flex" gap={1.5} alignItems="flex-start">
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2563EB", mt: 0.8, flexShrink: 0 }} />
              <Typography sx={{ color: "#334155", fontSize: "0.85rem", lineHeight: 1.5 }}>
                {a.action || a.message || a.description || "Activity"}
                {a.entityType ? ` · ${a.entityType}` : ""}
              </Typography>
            </Box>
            <Chip label={formatTime(a.createdAt || a.date || a.time)} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "#F8FAFC", color: "#94A3B8", flexShrink: 0, ml: 1 }} />
          </Box>
        ))
      )}
    </Box>
  );
}
