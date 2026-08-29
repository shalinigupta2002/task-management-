import { Box, Typography } from "@mui/material";
import { getCalendarStatusStyle } from "../../utils/calendarStatusUtils";

export default function CalendarEventBox({ title, visualStatus, subtitle, compact = false, showLabel = true }) {
  const style = getCalendarStatusStyle(visualStatus);

  return (
    <Box
      sx={{
        bgcolor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        borderRadius: 1.5,
        px: compact ? 0.75 : 1.25,
        py: compact ? 0.5 : 0.85,
        mb: compact ? 0.5 : 0.75,
        width: "100%",
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: compact ? "0.6rem" : "0.82rem",
          lineHeight: 1.3,
          color: style.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: compact ? "nowrap" : "normal",
        }}
      >
        {title}
      </Typography>
      {showLabel && style.label && (
        <Typography sx={{ fontSize: compact ? "0.55rem" : "0.72rem", color: style.text, opacity: 0.9, mt: 0.25 }}>
          {style.label}
        </Typography>
      )}
      {subtitle && (
        <Typography sx={{ fontSize: compact ? "0.55rem" : "0.68rem", color: style.text, opacity: 0.75, mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
