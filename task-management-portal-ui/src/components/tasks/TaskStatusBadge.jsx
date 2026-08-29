import { Chip } from "@mui/material";
import { STATUS_STYLE } from "./taskShared";
import { normalizeOverdueStatus, OVERDUE_FULL, isOverdueDisplayStatus } from "../../constants/overdueStyles";

export default function TaskStatusBadge({ status }) {
  const normalized = normalizeOverdueStatus(status);
  const s = STATUS_STYLE[normalized] || STATUS_STYLE[status] || STATUS_STYLE.Open;
  const overdue = isOverdueDisplayStatus(status);
  return (
    <Chip
      label={s.label || normalized || status}
      size="small"
      sx={{
        height: 26,
        fontSize: "0.75rem",
        fontWeight: 700,
        bgcolor: overdue ? OVERDUE_FULL.bg : s.bg,
        color: overdue ? OVERDUE_FULL.color : s.color,
        border: overdue ? `1px solid ${OVERDUE_FULL.border}` : undefined,
      }}
    />
  );
}
