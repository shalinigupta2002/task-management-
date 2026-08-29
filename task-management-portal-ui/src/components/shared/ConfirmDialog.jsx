import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress,
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmColor = "#2563EB",
  onClose,
  onConfirm,
  children,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slots={{ transition: undefined }}
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.96, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 0.2 },
        sx: { borderRadius: 3 },
      }}
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700, color: "#0F172A" }}>{title}</DialogTitle>
      <DialogContent>
        {message && <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: children ? 2 : 0 }}>{message}</Typography>}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B" }} aria-label="Cancel">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          autoFocus
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ textTransform: "none", bgcolor: confirmColor, "&:hover": { bgcolor: confirmColor, filter: "brightness(0.92)" } }}
          aria-label={confirmLabel}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  confirmColor: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  children: PropTypes.node,
  loading: PropTypes.bool,
};
