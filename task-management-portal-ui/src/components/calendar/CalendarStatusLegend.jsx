import { Box, Typography } from "@mui/material";
import { CALENDAR_STATUS_STYLES } from "../../utils/calendarStatusUtils";

const LEGEND_ITEMS = [
  { key: "completed", emoji: "🟩" },
  { key: "due", emoji: "🟨" },
  { key: "overdue", emoji: "🟥" },
];

export default function CalendarStatusLegend() {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 2 }}>
      {LEGEND_ITEMS.map(({ key, emoji }) => (
        <Box key={key} display="flex" alignItems="center" gap={0.75}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: 0.75,
              bgcolor: CALENDAR_STATUS_STYLES[key].bg,
              border: `1px solid ${CALENDAR_STATUS_STYLES[key].border}`,
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>
            {emoji} {CALENDAR_STATUS_STYLES[key].label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
