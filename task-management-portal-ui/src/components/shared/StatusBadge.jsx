import PropTypes from "prop-types";
import { Chip } from "@mui/material";
import { OVERDUE_FULL, isOverdueDisplayStatus, normalizeOverdueStatus } from "../../constants/overdueStyles";

const STATUS_STYLE = {
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Inactive: { bg: "#F1F5F9", color: "#64748B" },
  Suspended: { bg: "#FEF2F2", color: "#DC2626" },
  Pending: { bg: "#FFF7ED", color: "#EA580C" },
  Locked: { bg: "#FEF2F2", color: "#DC2626" },
  Open: { bg: "#EFF6FF", color: "#2563EB" },
  "In Progress": { bg: "#FFF7ED", color: "#EA580C" },
  Completed: { bg: "#F0FDF4", color: "#16A34A" },
  Overdue: { bg: OVERDUE_FULL.bg, color: OVERDUE_FULL.color },
  OVERDUE: { bg: OVERDUE_FULL.bg, color: OVERDUE_FULL.color },
  Review: { bg: "#F5F3FF", color: "#7C3AED" },
};

export default function StatusBadge({ status, size = "small" }) {
  const normalized = normalizeOverdueStatus(status);
  const overdue = isOverdueDisplayStatus(status);
  const s = STATUS_STYLE[normalized] || STATUS_STYLE[status] || { bg: "#F8FAFC", color: "#64748B" };
  return (
    <Chip
      label={normalized || status}
      size={size}
      aria-label={`Status: ${normalized || status}`}
      sx={{
        height: 24,
        fontSize: "0.72rem",
        fontWeight: overdue ? 700 : 600,
        bgcolor: overdue ? OVERDUE_FULL.bg : s.bg,
        color: overdue ? OVERDUE_FULL.color : s.color,
        border: overdue ? `1px solid ${OVERDUE_FULL.border}` : undefined,
      }}
    />
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["small", "medium"]),
};
