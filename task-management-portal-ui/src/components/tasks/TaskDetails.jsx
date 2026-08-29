import React from "react";
import { Box, Paper, Typography, Button, Chip, Divider } from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import ConfirmDialog from "../shared/ConfirmDialog";
import taskService from "../../services/taskService";
import { getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";

export default function TaskDetails({
  task = {
    title: "Monthly Compliance Report",
    description: "Complete and verify all monthly compliance logs for the engineering department.",
    priority: "High",
    status: "In Progress",
    dueDate: "25 May 2026",
    assignedTo: "Sandeep Mallik",
  },
  onBack,
  onEdit,
  onDeleted,
}) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleDeleteConfirm = async () => {
    if (!task?.id || deleting) return;
    try {
      setDeleting(true);
      await taskService.delete(task.id);
      toast.success("Task deleted successfully.");
      setConfirmDelete(false);
      if (onDeleted) onDeleted();
      else if (onBack) onBack();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete task"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack} sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569" }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700} color="#0f172a">Task Details</Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.03)", maxWidth: 800 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" fontWeight={700} color="#0f172a">{task.title}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label={task.priority} color="error" size="small" sx={{ fontWeight: 600 }} />
            <Chip label={task.status} color="warning" size="small" sx={{ fontWeight: 600 }} />
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {task.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Assigned To</Typography>
            <Typography variant="subtitle1" fontWeight={600}>{task.assignedTo}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Due Date</Typography>
            <Typography variant="subtitle1" fontWeight={600}>{task.dueDate}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          {task?.id && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setConfirmDelete(true)}
              sx={{ textTransform: "none" }}
            >
              Delete Task
            </Button>
          )}
          <Button variant="contained" startIcon={<Edit />} onClick={onEdit} sx={{ bgcolor: "#2563eb", textTransform: "none" }}>Edit Task</Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        confirmColor="#DC2626"
        loading={deleting}
        onClose={() => { if (!deleting) setConfirmDelete(false); }}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
