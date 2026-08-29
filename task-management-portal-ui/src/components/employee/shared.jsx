import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Chip, Breadcrumbs, Link, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import { OVERDUE_FULL, isOverdueDisplayStatus, normalizeOverdueStatus } from "../../constants/overdueStyles";

export const card = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #E8EDF5",
  p: 2,
};

const TASK_STATUS_STYLE = {
  Open: { bg: "#EFF6FF", color: "#2563EB" },
  "In Progress": { bg: "#FFF7ED", color: "#EA580C" },
  Completed: { bg: "#F0FDF4", color: "#16A34A" },
  Overdue: { bg: OVERDUE_FULL.bg, color: OVERDUE_FULL.color },
  OVERDUE: { bg: OVERDUE_FULL.bg, color: OVERDUE_FULL.color },
};

const PRIORITY_STYLE = {
  High: { bg: "#FEF2F2", color: "#DC2626" },
  Medium: { bg: "#FFF7ED", color: "#EA580C" },
  Low: { bg: "#F0FDF4", color: "#16A34A" },
};

export function TaskStatusBadge({ status }) {
  const normalized = normalizeOverdueStatus(status);
  const overdue = isOverdueDisplayStatus(status);
  const s = TASK_STATUS_STYLE[normalized] || TASK_STATUS_STYLE[status] || TASK_STATUS_STYLE.Open;
  return (
    <Chip
      label={normalized || status}
      size="small"
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

export function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLE[priority] || PRIORITY_STYLE.Medium;
  return <Chip label={priority} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: s.bg, color: s.color }} />;
}

export function StatCard({ title, value, sub, icon: Icon, color, bg, trend }) {
  return (
    <Box sx={card}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        {trend && <Chip label={trend} size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#F0FDF4", color: "#16A34A" }} />}
      </Box>
      <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.75rem", lineHeight: 1.2 }}>{value}</Typography>
      <Typography sx={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500, mt: 0.3 }}>{title}</Typography>
      {sub && <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.3 }}>{sub}</Typography>}
    </Box>
  );
}

export function PageHeader({ title, crumbs = [] }) {
  return (
    <Box mb={2}>
      <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>{title}</Typography>
      {crumbs.length > 0 && (
        <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem", "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
          <Link component={RouterLink} to="/employee/dashboard" underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
          {crumbs.map((c, i) => (
            c.to ? (
              <Link key={c.label} component={RouterLink} to={c.to} underline="hover" color={i === crumbs.length - 1 ? "#2563EB" : "#64748B"} sx={{ fontSize: "0.8rem", fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>{c.label}</Link>
            ) : (
              <Typography key={c.label} color={i === crumbs.length - 1 ? "#2563EB" : "#64748B"} sx={{ fontSize: "0.8rem", fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>{c.label}</Typography>
            )
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel, onClose, onConfirm, children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>{title}</DialogTitle>
      <DialogContent>
        {message && <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: children ? 2 : 0 }}>{message}</Typography>}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" sx={{ textTransform: "none", bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}>{confirmLabel || "Confirm"}</Button>
      </DialogActions>
    </Dialog>
  );
}

export const tableHeadCell = {
  fontWeight: 700,
  color: "#64748B",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  borderBottom: "1px solid #E8EDF5",
  py: 1.5,
};

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#2563EB" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "2px" },
  },
};

export const EMP_HOME = "/employee/dashboard";
