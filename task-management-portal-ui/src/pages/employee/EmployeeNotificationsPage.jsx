import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Chip, IconButton, CircularProgress, Alert } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, card } from "../../components/employee/shared";
import notificationService from "../../services/notificationService";
import { getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";

const TYPE_LABEL = {
  TASK_ASSIGNED: "New Task Assigned",
  TASK_UPDATED: "Task Updated",
  TASK_COMPLETED: "Task Completed",
  TASK_REMINDER: "Task Reminder",
  TASK_DUE_TODAY: "Due Today",
  TASK_OVERDUE: "Task Overdue",
  EXTENSION_REQUEST: "Extension Pending",
  EXTENSION_APPROVED: "Extension Approved",
  EXTENSION_REJECTED: "Extension Rejected",
  APPROVAL_REQUIRED: "Approval Required",
  SYSTEM: "System",
  new_task: "New Task",
  task_reminder: "Task Reminder",
  due_today: "Due Today",
  task_overdue: "Task Overdue",
  extension_pending: "Extension Pending",
};

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function EmployeeNotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await notificationService.getAll({ limit: 100 });
      const list = result.items || (Array.isArray(result) ? result : []);
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setItems([]);
      setError(getErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unread = items.filter((n) => !n.isRead && !n.read).length;

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to mark as read"));
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to mark all as read"));
    }
  };

  const remove = async (id) => {
    try {
      await notificationService.delete(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete notification"));
    }
  };

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Notifications" crumbs={[{ label: "Notifications" }]} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
            {loading ? "Loading..." : `${unread} unread · ${Math.max(items.length - unread, 0)} read`}
          </Typography>
          {unread > 0 && (
            <Chip
              label="Mark all as read"
              onClick={markAllRead}
              sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, cursor: "pointer" }}
            />
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ ...card, textAlign: "center", py: 6 }}>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: 1 }}>
              {error ? "Failed to load notifications" : "No notifications yet."}
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
              {error
                ? "Please try again later."
                : "You’ll see alerts here when tasks are assigned to you or when reminders are due."}
            </Typography>
          </Box>
        ) : (
          items.map((n) => {
            const isRead = Boolean(n.isRead || n.read);
            return (
              <Box
                key={n.id}
                sx={{
                  ...card,
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  opacity: isRead ? 0.75 : 1,
                  borderLeft: isRead ? undefined : "3px solid #2563EB",
                }}
              >
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                    <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{n.title}</Typography>
                    <Chip
                      label={TYPE_LABEL[n.type] || n.type}
                      size="small"
                      sx={{ height: 20, fontSize: "0.6rem", bgcolor: "#F8FAFC", color: "#64748B" }}
                    />
                    {!isRead && (
                      <Chip label="Unread" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#EFF6FF", color: "#2563EB" }} />
                    )}
                  </Box>
                  <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>{n.message}</Typography>
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", mt: 0.5 }}>
                    {formatTime(n.createdAt || n.time)}
                  </Typography>
                </Box>
                <Box display="flex" gap={0.5} flexShrink={0}>
                  {!isRead && (
                    <IconButton size="small" onClick={() => markRead(n.id)} sx={{ color: "#2563EB" }}>
                      <MarkEmailReadIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => remove(n.id)} sx={{ color: "#94A3B8" }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </EmployeeLayout>
  );
}
