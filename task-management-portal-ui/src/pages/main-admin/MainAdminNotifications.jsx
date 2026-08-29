import { useState } from "react";
import { Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReplyIcon from "@mui/icons-material/Reply";
import Layout from "../../components/layouts/Layout";
import { PageHeader, card } from "../../components/main-admin/shared";
import { getNotifications, setNotifications } from "../../utils/mainAdminStorage";

export default function MainAdminNotifications() {
  const [items, setItems] = useState(getNotifications());
  const [replyOpen, setReplyOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [replyText, setReplyText] = useState("");
  const unread = items.filter((n) => !n.read).length;

  const markRead = (id) => {
    const next = items.map((n) => (n.id === id ? { ...n, read: true } : n));
    setItems(next);
    setNotifications(next);
  };

  const markAllRead = () => {
    const next = items.map((n) => ({ ...n, read: true }));
    setItems(next);
    setNotifications(next);
  };

  const remove = (id) => {
    const next = items.filter((n) => n.id !== id);
    setItems(next);
    setNotifications(next);
  };

  const handleReplyClick = (n) => {
    setActiveNotification(n);
    setReplyText(n.reply || "");
    setReplyOpen(true);
  };

  const handleSendReply = () => {
    const next = items.map((n) =>
      n.id === activeNotification.id ? { ...n, reply: replyText, read: true } : n
    );
    setItems(next);
    setNotifications(next);
    setReplyOpen(false);
    setReplyText("");
  };

  const TYPE_LABEL = {
    task_assigned: "Task Assigned",
    task_updated: "Task Updated",
    task_completed: "Task Completed",
    task_overdue: "Task Overdue",
    extension_request: "Extension Request",
  };

  return (
    <Layout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Notifications" crumbs={[{ label: "Notifications" }]} />
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>{unread} unread · {items.filter((n) => n.read).length} read</Typography>
          {unread > 0 && (
            <Chip label="Mark all as read" onClick={markAllRead} sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, cursor: "pointer" }} />
          )}
        </Box>
        {items.map((n) => (
          <Box key={n.id} sx={{ ...card, mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", opacity: n.read ? 0.75 : 1, borderLeft: n.read ? undefined : "3px solid #2563EB" }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{n.title}</Typography>
                <Chip label={TYPE_LABEL[n.type] || n.type} size="small" sx={{ height: 20, fontSize: "0.6rem", bgcolor: "#F8FAFC", color: "#64748B" }} />
                {!n.read && <Chip label="Unread" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#EFF6FF", color: "#2563EB" }} />}
              </Box>
              <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>{n.message}</Typography>
              
              {n.reply && (
                <Box sx={{ mt: 1, p: 1.2, bgcolor: "#F8FAFC", borderRadius: 2, borderLeft: "3px solid #10B981" }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1E293B" }}>Your Reply:</Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#475569", mt: 0.2 }}>{n.reply}</Typography>
                </Box>
              )}

              <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", mt: 0.5 }}>{n.time}</Typography>
            </Box>
            <Box display="flex" gap={0.5} flexShrink={0}>
              <IconButton size="small" onClick={() => handleReplyClick(n)} sx={{ color: "#10B981" }}>
                <ReplyIcon fontSize="small" />
              </IconButton>
              {!n.read && (
                <IconButton size="small" onClick={() => markRead(n.id)} sx={{ color: "#2563EB" }}>
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={() => remove(n.id)} sx={{ color: "#94A3B8" }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Reply to Notification</DialogTitle>
        <DialogContent>
          {activeNotification && (
            <Box mt={1} display="flex" flexDirection="column" gap={2}>
              <Box sx={{ bgcolor: "#F8FAFC", p: 2, borderRadius: 2, border: "1px solid #E2E8F0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>{activeNotification.title}</Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>{activeNotification.message}</Typography>
              </Box>
              <TextField fullWidth multiline rows={4} label="Type your reply..." placeholder="Write a response..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReplyOpen(false)} variant="outlined" sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSendReply} variant="contained" sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, "&:hover": { bgcolor: "#1D4ED8" } }} disabled={!replyText.trim()}>Send Reply</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
