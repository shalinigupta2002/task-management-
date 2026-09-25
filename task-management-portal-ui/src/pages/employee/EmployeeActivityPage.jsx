import { useCallback, useEffect, useState } from "react";
import { Box, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, card } from "../../components/employee/shared";
import taskService from "../../services/taskService";
import { getErrorMessage } from "../../utils/session";

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function EmployeeActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await taskService.getAll({ limit: 50, mine: true });
      const tasks = result.items || (Array.isArray(result) ? result : []);
      const derived = (Array.isArray(tasks) ? tasks : []).flatMap((t) => {
        const title = t.title || "Task";
        const rows = [];
        if (t.createdAt) {
          rows.push({
            id: `${t.id}-created`,
            label: "Task Assigned",
            color: "#2563EB",
            text: `Assigned: ${title}`,
            time: t.createdAt,
          });
        }
        if (t.status) {
          rows.push({
            id: `${t.id}-status`,
            label: "Status",
            color: "#F97316",
            text: `${title} · ${t.status}`,
            time: t.updatedAt || t.createdAt,
          });
        }
        return rows;
      }).sort((a, b) => new Date(b.time) - new Date(a.time));
      setActivities(derived);
    } catch (err) {
      setActivities([]);
      setError(getErrorMessage(err, "Failed to load activity"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Activity History" crumbs={[{ label: "Activity History" }]} />
        <Typography sx={{ color: "#64748B", mb: 2, fontSize: "0.9rem" }}>Timeline from your assigned tasks</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
        )}

        <Box sx={card}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <HistoryIcon sx={{ color: "#2563EB" }} />
            <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Activity Timeline</Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : activities.length === 0 ? (
            <Typography sx={{ color: "#94A3B8", fontSize: "0.9rem", textAlign: "center", py: 4 }}>
              No activity yet. Assigned tasks will appear here.
            </Typography>
          ) : (
            activities.map((a, i) => (
              <Box key={a.id} display="flex" gap={2} position="relative" pb={i < activities.length - 1 ? 3 : 0}>
                {i < activities.length - 1 && (
                  <Box sx={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 2, bgcolor: "#E8EDF5" }} />
                )}
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: a.color }} />
                </Box>
                <Box flex={1}>
                  <Box display="flex" flexWrap="wrap" alignItems="center" gap={1} mb={0.5}>
                    <Chip label={a.label} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: `${a.color}15`, color: a.color }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{formatTime(a.time)}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>{a.text}</Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </EmployeeLayout>
  );
}
