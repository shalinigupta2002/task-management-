import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, Button, Chip, CircularProgress, Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, TaskStatusBadge, PriorityBadge, card } from "../../components/employee/shared";
import taskService from "../../services/taskService";
import { getAuthUser, getErrorMessage } from "../../utils/session";
import { mapEmployeeTask } from "../../utils/employeeTaskMapper";
import { getCompleteDateDisplay } from "../../utils/dateUtils";
import { toast } from "../../utils/toast";

const STATUS_FLOW = ["Open", "In Progress", "Completed"];
const STATUS_TO_API = {
  Open: "OPEN",
  "In Progress": "IN_PROGRESS",
  Completed: "COMPLETED",
};

export default function EmployeeTaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const authUser = useMemo(() => getAuthUser() || {}, []);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await taskService.getById(id);
      setTask(mapEmployeeTask(data, authUser.id));
    } catch (err) {
      setTask(null);
      setError(getErrorMessage(err, "Task not found or you are not assigned to this task"));
    } finally {
      setLoading(false);
    }
  }, [id, authUser.id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const changeStatus = async (newStatus) => {
    try {
      setSaving(true);
      await taskService.changeStatus(id, { status: STATUS_TO_API[newStatus] || newStatus });
      toast.success(`Status updated to ${newStatus}`);
      await loadTask();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </EmployeeLayout>
    );
  }

  if (!task) {
    return (
      <EmployeeLayout>
        <Box sx={{ pb: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography sx={{ color: "#64748B" }}>Task not found.</Typography>
          <Button onClick={() => navigate("/employee/tasks")} sx={{ mt: 2, textTransform: "none" }}>Back to Tasks</Button>
        </Box>
      </EmployeeLayout>
    );
  }

  const nextStatus = task.status === "Open" ? "In Progress" : task.status === "In Progress" ? "Completed" : null;

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title={task.title} crumbs={[{ label: "My Tasks", to: "/employee/tasks" }, { label: task.taskCode }]} />
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/employee/tasks")} sx={{ textTransform: "none", color: "#64748B" }}>Back</Button>
          {nextStatus && (
            <Button
              variant="contained"
              disabled={saving}
              onClick={() => changeStatus(nextStatus)}
              sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}
            >
              Mark as {nextStatus}
            </Button>
          )}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2 }}>
          <Box>
            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 1 }}>Description</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.7, mb: 2 }}>
                {task.description || "No description provided."}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <Chip label={task.category} size="small" sx={{ bgcolor: "#F8FAFC", color: "#64748B" }} />
                <Chip label={task.frequency} size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB" }} />
              </Box>
            </Box>

            <Box sx={{ ...card, mt: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Status Workflow</Typography>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                {STATUS_FLOW.map((s, i) => (
                  <Box key={s} display="flex" alignItems="center" gap={1}>
                    <Chip label={s} size="small" sx={{ fontWeight: 600, bgcolor: task.status === s ? "#2563EB" : "#F1F5F9", color: task.status === s ? "#FFF" : "#64748B" }} />
                    {i < STATUS_FLOW.length - 1 && <Typography sx={{ color: "#94A3B8" }}>→</Typography>}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box>
            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Task Details</Typography>
              {[
                ["Task ID", task.taskCode],
                ["Assigned By", task.assignedBy],
                ["Department", task.assignedDepartment],
                ["Category", task.category],
                ["Priority", task.priority],
                ["Frequency", task.frequency],
                ["Assigned Date", task.assignedDate],
                ["Due Date", task.dueDate],
                ["Complete Date", getCompleteDateDisplay(task)],
              ].map(([label, value]) => (
                <Box key={label} mb={1.5}>
                  <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 600 }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: "#0F172A", fontWeight: 500 }}>{value || "—"}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </EmployeeLayout>
  );
}
