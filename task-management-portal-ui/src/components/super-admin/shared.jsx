import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Chip, Breadcrumbs, Link, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";

export const card = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #E8EDF5",
  p: 2,
};

const STATUS_STYLE = {
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Suspended: { bg: "#FEF2F2", color: "#DC2626" },
  Inactive: { bg: "#F1F5F9", color: "#64748B" },
  Pending: { bg: "#FFF7ED", color: "#EA580C" },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Active;
  return (
    <Chip label={status} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 600, bgcolor: s.bg, color: s.color }} />
  );
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
    <Box mb={1}>
      <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.5rem" }}>{title}</Typography>
      {crumbs.length > 0 && (
        <Breadcrumbs sx={{ mt: 0.5, fontSize: "0.8rem", "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
          <Link component={RouterLink} to="/super-admin/dashboard" underline="hover" color="#94A3B8" sx={{ fontSize: "0.8rem" }}>Home</Link>
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

export function ConfirmDialog({ open, title, message, confirmLabel, confirmColor, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" sx={{ textTransform: "none", bgcolor: confirmColor || "#2563EB", "&:hover": { bgcolor: confirmColor ? confirmColor : "#1D4ED8" } }}>
          {confirmLabel || "Confirm"}
        </Button>
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
