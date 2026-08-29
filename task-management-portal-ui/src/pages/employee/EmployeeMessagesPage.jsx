import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Typography, TextField, InputAdornment, List, ListItemButton, ListItemText, Avatar, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import AddIcon from "@mui/icons-material/Add";
import MessageLinkAttach from "../../components/shared/MessageLinkAttach";
import EmployeeLayout from "../../components/layouts/EmployeeLayout";
import { PageHeader, card, fieldSx } from "../../components/employee/shared";
import conversationService from "../../services/conversationService";
import messageService from "../../services/messageService";
import { getAuthUser, getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";
import {
  contactDisplayName,
  contactMetaLabel,
  contactRoleLabel,
} from "../../utils/roleContactMessaging";

const CONTACT_ROLE_META = {
  SUB_ADMIN: {
    actionLabel: "Contact Sub Admin",
    selectLabel: "Select Sub Admin",
    emptyMessage: "No eligible Sub Admin found for your company/department",
    loadError: "Failed to load Sub Admin contacts",
  },
};

export default function EmployeeMessagesPage() {
  const location = useLocation();
  const currentUser = getAuthUser();
  const currentUserId = currentUser?.id;

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [actionLabel, setActionLabel] = useState("Contact Sub Admin");
  const [selectLabel, setSelectLabel] = useState("Select Sub Admin");
  const [openContact, setOpenContact] = useState(false);
  const [contactUserId, setContactUserId] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const handledContactKeyRef = useRef(null);

  const loadConversations = useCallback(async (shouldShowLoading = false) => {
    if (shouldShowLoading) setLoadingConv(true);
    try {
      const res = await conversationService.getAll({ limit: 100 });
      setConversations(res.items || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      if (shouldShowLoading) setLoadingConv(false);
    }
  }, []);

  const loadMessages = useCallback(async (convId, shouldShowLoading = false) => {
    if (!convId) return;
    if (shouldShowLoading) setLoadingMsg(true);
    try {
      const res = await messageService.getAll({ conversationId: convId, limit: 100 });
      const sorted = (res.items || []).reverse();
      setMessages(sorted);
      try {
        await messageService.markRead({ conversationId: convId });
      } catch (markErr) {
        console.warn("mark-read failed:", markErr);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast.error(getErrorMessage(err, "Failed to load messages"));
    } finally {
      if (shouldShowLoading) setLoadingMsg(false);
    }
  }, []);

  useEffect(() => {
    loadConversations(true);
    const interval = setInterval(() => {
      loadConversations(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId, true);
      const interval = setInterval(() => {
        loadMessages(selectedId, false);
      }, 5000);
      return () => clearInterval(interval);
    }
    setMessages([]);
    return undefined;
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversationWithUser = useCallback(async (otherUserId) => {
    setStartingChat(true);
    try {
      const conv = await conversationService.create({ otherUserId });
      await loadConversations(false);
      setSelectedId(conv.id);
      setOpenContact(false);
      setContactUserId("");
      toast.success("Conversation opened");
    } catch (err) {
      console.error("Failed to start conversation:", err);
      toast.error(getErrorMessage(err, "Failed to start conversation"));
    } finally {
      setStartingChat(false);
    }
  }, [loadConversations]);

  const handleContactRole = useCallback(async (targetRole = "SUB_ADMIN") => {
    const meta = CONTACT_ROLE_META[targetRole] || CONTACT_ROLE_META.SUB_ADMIN;
    setLoadingContacts(true);
    setActionLabel(meta.actionLabel);
    setSelectLabel(meta.selectLabel);
    try {
      const res = await conversationService.getEligibleContacts({ targetRole });
      const list = res?.contacts || [];
      setContacts(list);
      setActionLabel(res?.actionLabel || meta.actionLabel);
      if (list.length === 0) {
        toast.error(meta.emptyMessage);
        return;
      }
      if (list.length === 1) {
        await openConversationWithUser(list[0].id);
        return;
      }
      setContactUserId("");
      setOpenContact(true);
    } catch (err) {
      console.error("Failed to load eligible contacts:", err);
      toast.error(getErrorMessage(err, meta.loadError));
    } finally {
      setLoadingContacts(false);
    }
  }, [openConversationWithUser]);

  // Deep-link from sidebar Contact buttons
  useEffect(() => {
    const role = location.state?.contactRole;
    if (!role || !CONTACT_ROLE_META[role]) return;
    const key = `${role}:${location.key || "default"}`;
    if (handledContactKeyRef.current === key) return;
    handledContactKeyRef.current = key;
    handleContactRole(role);
  }, [location.state, location.key, handleContactRole]);

  const handleConfirmContact = async () => {
    if (!contactUserId) return;
    await openConversationWithUser(contactUserId);
  };

  const sendMessage = async () => {
    if ((!reply.trim() && !pendingAttachment) || !selectedId) return;
    try {
      const payload = {
        conversationId: selectedId,
        message: pendingAttachment?.url ? pendingAttachment.name || pendingAttachment.url : reply,
        messageType: pendingAttachment?.url ? "PDF" : "TEXT",
        ...(pendingAttachment?.url ? { attachmentUrl: pendingAttachment.url, attachmentName: pendingAttachment.name } : {})
      };

      await messageService.send(payload);
      setReply("");
      setPendingAttachment(null);
      await loadMessages(selectedId, false);
      await loadConversations(false);
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const mappedThreads = useMemo(() => {
    return conversations.map((c) => {
      const otherPart = c.participants.find((p) => p.userId !== currentUserId)?.user;
      const name = otherPart ? `${otherPart.firstName} ${otherPart.lastName}` : "Unknown User";
      const role = otherPart?.role?.name || "Employee";
      const lastMsg = c.messages?.[0];
      const lastMessageText = lastMsg?.message || "No messages yet";
      const lastTime = lastMsg?.createdAt
        ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
      const unreadCount = (lastMsg && !lastMsg.isRead && lastMsg.senderId !== currentUserId) ? 1 : 0;

      return {
        id: c.id,
        name,
        role,
        lastMessage: lastMessageText,
        lastTime,
        unread: unreadCount,
        online: false,
      };
    });
  }, [conversations, currentUserId]);

  const filteredThreads = useMemo(() => {
    const q = search.toLowerCase();
    return mappedThreads.filter(
      (t) => !q || t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q)
    );
  }, [mappedThreads, search]);

  const activeThread = mappedThreads.find((t) => t.id === selectedId);
  const unreadTotal = mappedThreads.reduce((s, t) => s + (t.unread || 0), 0);

  return (
    <EmployeeLayout>
      <Box sx={{ pb: 3 }}>
        <PageHeader title="Messages" crumbs={[{ label: "Messages" }]} />
        <Typography sx={{ color: "#64748B", mb: 2, fontSize: "0.9rem" }}>
          {unreadTotal} unread · Real-time conversation with company members
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 2 }}>
          <Box sx={card}>
            <Box display="flex" gap={1} mb={1.5} flexWrap="wrap">
              <TextField
                fullWidth
                size="small"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ ...fieldSx, flex: 1, minWidth: 160 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={() => handleContactRole("SUB_ADMIN")}
                disabled={loadingContacts || startingChat}
                sx={{ minWidth: 44, p: 0, bgcolor: "#2563EB", borderRadius: 2 }}
                title="Contact Sub Admin"
              >
                {loadingContacts || startingChat ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
              </Button>
            </Box>

            <Box mb={1.5}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleContactRole("SUB_ADMIN")}
                disabled={loadingContacts || startingChat}
                sx={{
                  textTransform: "none",
                  borderColor: "#E2E8F0",
                  color: "#475569",
                  borderRadius: 2,
                  fontSize: "0.75rem",
                  px: 1.25,
                }}
              >
                Contact Sub Admin
              </Button>
            </Box>

            <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, mb: 1, textTransform: "uppercase" }}>
              Recent Chats
            </Typography>

            {loadingConv ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
            ) : filteredThreads.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mb: 2 }}>
                  No messages yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleContactRole("SUB_ADMIN")}
                  disabled={loadingContacts || startingChat}
                  sx={{ textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, fontWeight: 600 }}
                >
                  {loadingContacts || startingChat ? "Opening..." : "Contact Sub Admin"}
                </Button>
              </Box>
            ) : (
              <List disablePadding sx={{ maxHeight: 420, overflowY: "auto" }}>
                {filteredThreads.map((t) => (
                  <ListItemButton
                    key={t.id}
                    selected={selectedId === t.id}
                    onClick={() => setSelectedId(t.id)}
                    sx={{ borderRadius: 2, mb: 0.5, bgcolor: selectedId === t.id ? "#EFF6FF" : "transparent" }}
                  >
                    <Box position="relative" mr={1.5}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.8rem" }}>
                        {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </Avatar>
                      {t.online && (
                        <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, bgcolor: "#16A34A", borderRadius: "50%", border: "2px solid #FFF" }} />
                      )}
                    </Box>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.name}</Typography>
                          {t.unread > 0 && (
                            <Chip label={t.unread} size="small" sx={{ height: 18, minWidth: 18, fontSize: "0.6rem", bgcolor: "#2563EB", color: "#FFF" }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }} noWrap>
                            {t.lastMessage}
                          </Typography>
                          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            {t.role} · {t.lastTime}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>

          {selectedId && activeThread ? (
            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem" }}>
                {activeThread.name}
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.82rem", mb: 2 }}>
                {activeThread.role}
              </Typography>

              <Box sx={{ height: 360, overflowY: "auto", mb: 2, p: 1, border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#F8FAFC" }}>
                {loadingMsg ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress size={24} /></Box>
                ) : messages.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>Say hello to start the conversation!</Typography>
                  </Box>
                ) : (
                  messages.map((m) => {
                    const isOwn = m.senderId === currentUserId;
                    const timeStr = new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const dateStr = new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });

                    return (
                      <Box key={m.id} mb={1.5} display="flex" flexDirection="column" alignItems={isOwn ? "flex-end" : "flex-start"}>
                        <Box sx={{ maxWidth: "75%", p: 1.5, borderRadius: 2, bgcolor: isOwn ? "#2563EB" : "#FFFFFF", color: isOwn ? "#FFF" : "#334155", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: isOwn ? "none" : "1px solid #E2E8F0" }}>
                          {m.attachmentUrl ? (
                            <Box component="a" href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" display="flex" alignItems="center" gap={1} sx={{ color: "inherit", textDecoration: "none" }}>
                              <InsertDriveFileOutlinedIcon fontSize="small" />
                              <Typography sx={{ fontSize: "0.85rem", textDecoration: "underline", fontWeight: 600 }}>{m.attachmentName || "View Attachment"}</Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: "0.9rem" }}>{m.message}</Typography>
                          )}
                        </Box>
                        <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.3 }}>
                          {dateStr} · {timeStr} {isOwn && (m.isRead ? "· Read" : "· Sent")}
                        </Typography>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Box display="flex" gap={1} mb={1} alignItems="center">
                <MessageLinkAttach onAttach={setPendingAttachment} />
                {pendingAttachment?.url && (
                  <Chip
                    label={pendingAttachment.name || "Attached link"}
                    onDelete={() => setPendingAttachment(null)}
                    size="small"
                  />
                )}
                <IconButton size="small" sx={{ color: "#64748B", bgcolor: "#F8FAFC" }}>
                  <EmojiEmotionsOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Type a message..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={fieldSx}
              />
              <Button
                startIcon={<SendIcon />}
                variant="contained"
                onClick={sendMessage}
                sx={{ mt: 1.5, textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}
              >
                Send
              </Button>
            </Box>
          ) : (
            <Box sx={{ ...card, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
              <Typography sx={{ color: "#64748B" }}>Select a chat to start messaging</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={openContact} onClose={() => setOpenContact(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>{actionLabel}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="contact-role-label">{selectLabel}</InputLabel>
            <Select
              labelId="contact-role-label"
              value={contactUserId}
              onChange={(e) => setContactUserId(e.target.value)}
              label={selectLabel}
            >
              <MenuItem value="" disabled>{selectLabel}</MenuItem>
              {contacts.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {contactDisplayName(u)} — {contactRoleLabel(u)}
                  {contactMetaLabel(u) ? ` — ${contactMetaLabel(u)}` : ""}
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
            onClick={handleConfirmContact}
            variant="contained"
            disabled={!contactUserId || startingChat}
            sx={{ textTransform: "none", bgcolor: "#2563EB" }}
          >
            {startingChat ? "Opening..." : "Open Conversation"}
          </Button>
        </DialogActions>
      </Dialog>
    </EmployeeLayout>
  );
}
