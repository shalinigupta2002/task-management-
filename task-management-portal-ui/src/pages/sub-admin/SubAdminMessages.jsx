import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Typography, TextField, InputAdornment, List, ListItemButton, ListItemText, Avatar, Chip, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import MessageLinkAttach from "../../components/shared/MessageLinkAttach";
import SubAdminLayout from "../../components/layouts/SubAdminLayout";
import { PageHeader, card, fieldSx } from "../../components/main-admin/shared";
import conversationService from "../../services/conversationService";
import messageService from "../../services/messageService";
import { getAuthUser, getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";


function getOtherParticipant(conversation, currentUserId) {
  const participant = (conversation.participants || []).find((p) => p.userId !== currentUserId && p.user?.id !== currentUserId);
  const user = participant?.user || participant;
  if (!user) return { name: "Unknown", role: "User", id: null };
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
    role: user.role?.name || "User",
  };
}

function formatMessageTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SubAdminMessages() {
  const location = useLocation();
  const authUser = getAuthUser();
  const currentUserId = authUser?.id || authUser?.userId;

  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const [loadingContacts, setLoadingContacts] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [openContact, setOpenContact] = useState(false);
  const [contactUserId, setContactUserId] = useState("");
  const handledContactKeyRef = useRef(null);

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await conversationService.getAll({ limit: 50 });
      setThreads(result.items || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load conversations"));
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (threads.length > 0 && !selected) setSelected(threads[0].id);
  }, [threads, selected]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoadingMessages(true);
      const result = await messageService.getAll({ conversationId, limit: 100 });
      const items = (result.items || []).slice().reverse();
      setMessages(items);
      await messageService.markRead({ conversationId }).catch(() => {});
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load messages"));
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selected) loadMessages(selected);
  }, [selected, loadMessages]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return threads.filter((t) => {
      const other = getOtherParticipant(t, currentUserId);
      return !q || other.name.toLowerCase().includes(q) || other.role.toLowerCase().includes(q);
    });
  }, [threads, search, currentUserId]);

  const activeThread = threads.find((t) => t.id === selected);
  const activeContact = activeThread ? getOtherParticipant(activeThread, currentUserId) : null;

  const openConversationWithUser = useCallback(async (otherUserId) => {
    setStartingChat(true);
    try {
      const conv = await conversationService.create({ otherUserId });
      await loadThreads();
      setSelected(conv.id);
      setOpenContact(false);
      setContactUserId("");
      toast.success("Conversation opened");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to start conversation"));
    } finally {
      setStartingChat(false);
    }
  }, [loadThreads]);

  const handleContactMainAdmin = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const res = await conversationService.getEligibleContacts({ targetRole: "MAIN_ADMIN" });
      const list = res?.contacts || [];
      setContacts(list);
      if (list.length === 0) {
        toast.error("No eligible Main Admin found for your company");
        return;
      }
      if (list.length === 1) {
        await openConversationWithUser(list[0].id);
        return;
      }
      setContactUserId("");
      setOpenContact(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Main Admin contacts"));
    } finally {
      setLoadingContacts(false);
    }
  }, [openConversationWithUser]);

  useEffect(() => {
    if (location.state?.contactRole !== "MAIN_ADMIN") return;
    const key = `MAIN_ADMIN:${location.key || "default"}`;
    if (handledContactKeyRef.current === key) return;
    handledContactKeyRef.current = key;
    handleContactMainAdmin();
  }, [location.state, location.key, handleContactMainAdmin]);

  const sendMessage = async () => {
    if ((!reply.trim() && !pendingAttachment?.url) || !selected) return;
    try {
      setSending(true);
      await messageService.send({
        conversationId: selected,
        message: reply.trim() || pendingAttachment?.name || pendingAttachment?.url,
        attachmentUrl: pendingAttachment?.url || undefined,
      });
      setReply("");
      setPendingAttachment(null);
      await loadMessages(selected);
      await loadThreads();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  return (
    <SubAdminLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Messages" crumbs={[{ label: "Messages" }]} homePath="/sub-admin/dashboard" />
        <Typography sx={{ color: "#64748B", mb: 2, fontSize: "0.9rem" }}>Company-scoped conversations</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 2 }}>
            <Box sx={card}>
              <Box display="flex" gap={1} mb={1.5} alignItems="center">
                <TextField fullWidth size="small" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} sx={fieldSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} /></InputAdornment> }} />
                <Button
                  variant="outlined"
                  onClick={handleContactMainAdmin}
                  disabled={loadingContacts || startingChat}
                  sx={{ textTransform: "none", borderRadius: 2, whiteSpace: "nowrap", fontWeight: 600 }}
                >
                  {loadingContacts || startingChat ? "..." : "Contact Main Admin"}
                </Button>
              </Box>
              <List disablePadding sx={{ maxHeight: 420, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>No messages yet.</Typography>
                    <Button
                      variant="contained"
                      onClick={handleContactMainAdmin}
                      disabled={loadingContacts || startingChat}
                      sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600 }}
                    >
                      {loadingContacts || startingChat ? "Opening..." : "Contact Main Admin"}
                    </Button>
                  </Box>
                ) : filtered.map((t) => {
                  const other = getOtherParticipant(t, currentUserId);
                  const lastMsg = t.messages?.[0];
                  return (
                    <ListItemButton key={t.id} selected={selected === t.id} onClick={() => setSelected(t.id)} sx={{ borderRadius: 2, mb: 0.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.8rem", mr: 1.5 }}>
                        {other.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </Avatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{other.name}</Typography>}
                        secondary={<Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{other.role} · {lastMsg?.message?.slice(0, 40) || "No messages"}</Typography>}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>

            {activeThread ? (
              <Box sx={card}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>{activeContact?.name}</Typography>
                {loadingMessages ? (
                  <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                ) : (
                  <Box sx={{ maxHeight: 320, overflowY: "auto", mb: 2 }}>
                    {messages.length === 0 ? (
                      <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>No messages yet</Typography>
                    ) : messages.map((m) => {
                      const isMine = m.senderId === currentUserId;
                      return (
                        <Box key={m.id} mb={1.5} display="flex" flexDirection="column" alignItems={isMine ? "flex-end" : "flex-start"}>
                          <Box sx={{ p: 1.5, borderRadius: 2, maxWidth: "75%", bgcolor: isMine ? "#2563EB" : "#F1F5F9", color: isMine ? "#FFF" : "#334155" }}>
                            <Typography sx={{ fontSize: "0.9rem" }}>{m.message}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.3 }}>{formatMessageTime(m.createdAt)}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                <Box display="flex" gap={1} mb={1} alignItems="center">
                  <MessageLinkAttach onAttach={setPendingAttachment} />
                  {pendingAttachment?.url && <Chip label={pendingAttachment.name || "Attached link"} onDelete={() => setPendingAttachment(null)} size="small" />}
                </Box>
                <TextField fullWidth multiline rows={2} placeholder="Type a message..." value={reply} onChange={(e) => setReply(e.target.value)} sx={fieldSx} />
                <Button startIcon={<SendIcon />} variant="contained" disabled={sending} onClick={sendMessage} sx={{ mt: 1.5, textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}>
                  {sending ? "Sending..." : "Send"}
                </Button>
              </Box>
            ) : (
              <Box sx={card}><Typography sx={{ color: "#64748B" }}>Select a conversation</Typography></Box>
            )}
          </Box>
        )}
      </Box>

      <Dialog open={openContact} onClose={() => setOpenContact(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Contact Main Admin</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="contact-main-admin-label">Select Main Admin</InputLabel>
            <Select
              labelId="contact-main-admin-label"
              value={contactUserId}
              onChange={(e) => setContactUserId(e.target.value)}
              label="Select Main Admin"
            >
              <MenuItem value="" disabled>Choose a Main Admin</MenuItem>
              {contacts.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenContact(false)} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={() => contactUserId && openConversationWithUser(contactUserId)}
            variant="contained"
            disabled={!contactUserId || startingChat}
            sx={{ textTransform: "none", bgcolor: "#2563EB" }}
          >
            {startingChat ? "Opening..." : "Open Conversation"}
          </Button>
        </DialogActions>
      </Dialog>

    </SubAdminLayout>
  );
}
