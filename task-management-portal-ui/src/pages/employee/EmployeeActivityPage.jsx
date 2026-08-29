import { useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, card } from "../../components/employee/shared";
import { getActivity } from "../../utils/employeeStorage";

const TYPE_CONFIG = {
  assigned: { label: "Task Assigned", color: "#2563EB" },
  opened: { label: "Task Opened", color: "#0EA5E9" },
  status: { label: "Status Changed", color: "#F97316" },
  comment: { label: "Comment Added", color: "#7C3AED" },
  attachment: { label: "Attachment Uploaded", color: "#14B8A6" },
  extension: { label: "Extension Requested", color: "#EA580C" },
  completed: { label: "Task Completed", color: "#16A34A" },
};

export default function EmployeeActivityPage() {
  const [activities] = useState(getActivity());

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Activity History" crumbs={[{ label: "Activity History" }]} />
        <Typography sx={{ color: "#64748B", mb: 2, fontSize: "0.9rem" }}>Complete timeline of your task activities</Typography>

        <Box sx={card}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <HistoryIcon sx={{ color: "#2563EB" }} />
            <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Activity Timeline</Typography>
          </Box>

          {activities.map((a, i) => {
            const config = TYPE_CONFIG[a.type] || { label: a.type, color: "#64748B" };
            return (
              <Box key={a.id} display="flex" gap={2} position="relative" pb={i < activities.length - 1 ? 3 : 0}>
                {i < activities.length - 1 && (
                  <Box sx={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 2, bgcolor: "#E8EDF5" }} />
                )}
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: `${config.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: config.color }} />
                </Box>
                <Box flex={1}>
                  <Box display="flex" flexWrap="wrap" alignItems="center" gap={1} mb={0.5}>
                    <Chip label={config.label} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: `${config.color}15`, color: config.color }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{a.time}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>{a.text}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </EmployeeLayout>
  );
}
