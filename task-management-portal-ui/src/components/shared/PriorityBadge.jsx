import PropTypes from "prop-types";
import { Chip } from "@mui/material";

const PRIORITY_STYLE = {
  High: { bg: "#FEF2F2", color: "#DC2626" },
  Medium: { bg: "#FFF7ED", color: "#EA580C" },
  Low: { bg: "#F0FDF4", color: "#16A34A" },
};

export default function PriorityBadge({ priority, size = "small" }) {
  const s = PRIORITY_STYLE[priority] || PRIORITY_STYLE.Medium;
  return (
    <Chip
      label={priority}
      size={size}
      aria-label={`Priority: ${priority}`}
      sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: s.bg, color: s.color }}
    />
  );
}

PriorityBadge.propTypes = {
  priority: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["small", "medium"]),
};
