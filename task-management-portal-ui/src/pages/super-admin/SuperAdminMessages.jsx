import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputAdornment, InputLabel, List, ListItemButton, ListItemText, MenuItem, Select,
  TextField, Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import MessageLinkAttach from "../../components/shared/MessageLinkAttach";
import SuperAdminLayout from "../../components/layouts/SuperAdminLayout";
import { PageHeader, card, fieldSx } from "../../components/super-admin/shared";
import conversationService from "../../services/conversationService";
import messageService from "../../services/messageService";
import companyService from "../../services/companyService";
import employeeService from "../../services/employeeService";
import { getAuthUser, getErrorMessage } from "../../utils/session";
import { toast } from "../../utils/toast";

/**
 * Super Admin Messages — participant-scoped platform inbox.
 *
 * Visibility rule (existing chat RBAC):
 * - Super Admin only sees conversations they participate in.
 * - ALLOWED_CHAT_PAIRS permits SUPER_ADMIN ↔ MAIN_ADMIN only.
 * - Private MAIN_ADMIN↔EMPLOYEE / SUB_ADMIN↔EMPLOYEE threads are NOT visible
 *   unless Super Admin is a participant (they are not by default).
 */
const CHAT_HEIGHT = { xs: "auto", md: "calc(100vh - 220px)" };
const panelCard = {
  ...card,
  p: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: CHAT_HEIGHT,
  height: { md: CHAT_HEIGHT },
};

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SuperAdminMessages() {
  const currentUser = getAuthUser();
  const currentUserId = currentUser?.id || currentUser?.userId;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [error, setError] = useState("");

  const [openNewChat, setOpenNewChat] = useState(false);
  const [mainAdmins, setMainAdmins] = useState([]);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [startingChat, setStartingChat] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const messagesEndRef = useRef(null);
  const convReqId = useRef(0);
  const msgReqId = useRef(0);

  const loadUnread = useCallback(async () => {
    try {
      const res = await messageService.getUnreadCount();
      setUnreadTotal(res?.unreadCount ?? 0);
    } catch {
      /* ignore badge errors */
    }
  }, []);

  const loadConversations = useCallback(async (showLoading = false) => {
    const reqId = ++convReqId.current;
    if (showLoading) setLoadingConv(true);
    try {
      const params = { limit: 100 };
      if (companyFilter && companyFilter !== "all") params.companyId = companyFilter;
      const res = await conversationService.getAll(params);
      if (reqId !== convReqId.current) return;
      setConversations(res.items || []);
      setError("");
    } catch (err) {
      if (reqId !== convReqId.current) return;
      console.error("Failed to load conversations:", err);
      setConversations([]);
      setError(getErrorMessage(err, "Failed to load conversations"));
    } finally {
      if (reqId === convReqId.current) setLoadingConv(false);
    }
  }, [companyFilter]);

  const loadMessages = useCallback(async (convId, showLoading = false) => {
    if (!convId) return;
    const reqId = ++msgReqId.current;
    if (showLoading) setLoadingMsg(true);
    try {
      const res = await messageService.getAll({ conversationId: convId, limit: 100 });
      if (reqId !== msgReqId.current) return;
      const sorted = (res.items || []).slice().reverse();
      setMessages(sorted);
      try {
        await messageService.markRead({ conversationId: convId });
        await loadUnread();
      } catch (markErr) {
        console.warn("mark-read failed:", markErr);
      }
    } catch (err) {
      if (reqId !== msgReqId.current) return;
      console.error("Failed to load messages:", err);
      setMessages([]);
      toast.error(getErrorMessage(err, "Failed to load messages"));
    } finally {
      if (reqId === msgReqId.current) setLoadingMsg(false);
    }
  }, [loadUnread]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await companyService.getAll({ limit: 100 });
        if (active) setCompanies(res.items || []);
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    loadConversations(true);
    loadUnread();
    const interval = setInterval(() => {
      loadConversations(false);
      loadUnread();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadConversations, loadUnread]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return undefined;
    }
    loadMessages(selectedId, true);
    const interval = setInterval(() => loadMessages(selectedId, false), 5000);
    return () => clearInterval(interval);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mappedThreads = useMemo(() => {
    return conversations.map((c) => {
      const otherPart =
        (c.participants || []).find(
          (p) => p.userId !== currentUserId && p.user?.role?.name !== "SUPER_ADMIN"
        )?.user
        || (c.participants || []).find((p) => p.userId !== currentUserId)?.user;
      const name = otherPart
        ? `${otherPart.firstName || ""} ${otherPart.lastName || ""}`.trim() || otherPart.email
        : "Unknown User";
      const role = otherPart?.role?.name || "MAIN_ADMIN";
      const companyName = c.company?.companyName || "—";
      const companyId = c.companyId || c.company?.id || null;
      const lastMsg = c.messages?.[0];
      const lastMessageText = lastMsg?.message || "No messages yet";
      const lastTime = formatTime(lastMsg?.createdAt || c.updatedAt);
      const unread = (lastMsg && !lastMsg.isRead && lastMsg.senderId !== currentUserId) ? 1 : 0;

      return {
        id: c.id,
        name,
        role,
        companyName,
        companyId,
        email: otherPart?.email || "",
        lastMessage: lastMessageText,
        lastTime,
        unread,
      };
    });
  }, [conversations, currentUserId]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mappedThreads.filter((t) => {
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q)
        || t.email.toLowerCase().includes(q)
        || t.companyName.toLowerCase().includes(q)
        || t.role.toLowerCase().includes(q)
        || t.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [mappedThreads, search]);

  const activeThread = mappedThreads.find((t) => t.id === selectedId);

  const handleOpenNewChat = async () => {
    setOpenNewChat(true);
    setLoadingAdmins(true);
    try {
      const params = { roleName: "MAIN_ADMIN", limit: 100, status: "ACTIVE" };
      if (companyFilter !== "all") params.companyId = companyFilter;
      const res = await employeeService.getUsers(params);
      setMainAdmins(
        (res.items || []).filter((u) => u.id !== currentUserId && u.status === "ACTIVE")
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Main Admins"));
      setMainAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatUserId) return;
    setStartingChat(true);
    try {
      const conv = await conversationService.create({ otherUserId: newChatUserId });
      await loadConversations(false);
      setSelectedId(conv.id);
      setOpenNewChat(false);
      setNewChatUserId("");
      toast.success("Conversation started");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to start conversation"));
    } finally {
      setStartingChat(false);
    }
  };

  const sendMessage = async () => {
    if ((!reply.trim() && !pendingAttachment) || !selectedId) return;
    try {
      const payload = {
        conversationId: selectedId,
        message: pendingAttachment?.url
          ? (pendingAttachment.name || pendingAttachment.url)
          : reply.trim(),
        messageType: pendingAttachment?.url ? "PDF" : "TEXT",
        ...(pendingAttachment?.url
          ? {
            attachmentUrl: pendingAttachment.url,
            attachmentName: pendingAttachment.name,
          }
          : {}),
      };
      await messageService.send(payload);
      setReply("");
      setPendingAttachment(null);
      await loadMessages(selectedId, false);
      await loadConversations(false);
      await loadUnread();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send message"));
    }
  };

  return (
    <SuperAdminLayout>
      <Box sx={{ pb: 3, width: "100%", maxWidth: "100%" }}>
        <PageHeader title="Messages" crumbs={[{ label: "Messages" }]} />
        <Typography sx={{ color: "#64748B", mb: 2, fontSize: "0.9rem" }}>
          {unreadTotal} unread message{unreadTotal === 1 ? "" : "s"} · Platform inbox with Main Admins
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
        )}

        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(300px, 360px) minmax(0, 1fr)" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <Box sx={panelCard}>
            <Box sx={{ p: 2, borderBottom: "1px solid #E8EDF5" }}>
              <FormControl fullWidth size="small" sx={{ ...fieldSx, mb: 1.5 }}>
                <InputLabel id="sa-company-filter">Company</InputLabel>
                <Select
                  labelId="sa-company-filter"
                  label="Company"
                  value={companyFilter}
                  onChange={(e) => {
                    setCompanyFilter(e.target.value);
                    setSelectedId(null);
                  }}
                >
                  <MenuItem value="all">All Companies</MenuItem>
                  {companies.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={fieldSx}
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
                  onClick={handleOpenNewChat}
                  sx={{ minWidth: 44, p: 0, bgcolor: "#2563EB", borderRadius: 2 }}
                  title="Message a Main Admin"
                >
                  <AddIcon />
                </Button>
              </Box>

              <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, mt: 1.5, textTransform: "uppercase" }}>
                Company Inbox
              </Typography>
            </Box>

            <List disablePadding sx={{ flex: 1, overflowY: "auto", p: 1 }}>
              {loadingConv ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
              ) : error ? (
                <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                  <Typography sx={{ color: "#B91C1C", fontSize: "0.85rem", mb: 1.5 }}>{error}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => loadConversations(true)}
                    sx={{ textTransform: "none" }}
                  >
                    Retry
                  </Button>
                </Box>
              ) : filteredThreads.length === 0 ? (
                <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", textAlign: "center", py: 4, px: 2 }}>
                  No conversations yet. When a Main Admin contacts Super Admin, threads appear here.
                </Typography>
              ) : (
                filteredThreads.map((t) => (
                  <ListItemButton
                    key={t.id}
                    selected={selectedId === t.id}
                    onClick={() => setSelectedId(t.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      alignItems: "flex-start",
                      py: 1.25,
                      px: 1.5,
                      bgcolor: selectedId === t.id ? "#EFF6FF" : "transparent",
                      border: selectedId === t.id ? "1px solid #BFDBFE" : "1px solid transparent",
                    }}
                  >
                    <Avatar sx={{ width: 42, height: 42, bgcolor: "#2563EB", fontSize: "0.85rem", mr: 1.5, flexShrink: 0 }}>
                      {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </Avatar>
                    <ListItemText
                      sx={{ m: 0 }}
                      primary={(
                        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0F172A" }} noWrap>
                            {t.name}
                          </Typography>
                          {t.unread > 0 && (
                            <Chip
                              label={t.unread}
                              size="small"
                              sx={{ height: 18, minWidth: 18, fontSize: "0.6rem", bgcolor: "#2563EB", color: "#FFF", flexShrink: 0 }}
                            />
                          )}
                        </Box>
                      )}
                      secondary={(
                        <Box mt={0.4}>
                          <Typography sx={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 500 }} noWrap>
                            {t.lastMessage}
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: 0.25 }} noWrap>
                            {t.role} · {t.companyName} · {t.lastTime}
                          </Typography>
                        </Box>
                      )}
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          </Box>

          {selectedId && activeThread ? (
            <Box sx={panelCard}>
              <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #E8EDF5" }}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem" }}>
                  {activeThread.name}
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mt: 0.3 }}>
                  {activeThread.role} — {activeThread.companyName}
                  {activeThread.email ? ` · ${activeThread.email}` : ""}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, bgcolor: "#FAFBFE" }}>
                {loadingMsg ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress size={28} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Typography sx={{ color: "#94A3B8", textAlign: "center", mt: 6 }}>
                    No messages yet. Send the first message.
                  </Typography>
                ) : (
                  messages.map((m) => {
                    const isOwn = m.senderId === currentUserId;
                    return (
                      <Box
                        key={m.id}
                        mb={1.5}
                        display="flex"
                        flexDirection="column"
                        alignItems={isOwn ? "flex-end" : "flex-start"}
                      >
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mb: 0.5 }}>
                          {isOwn ? "You" : activeThread.name} · {formatTime(m.createdAt)}
                        </Typography>
                        <Box
                          sx={{
                            maxWidth: { xs: "100%", sm: "75%" },
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: isOwn ? "#2563EB" : "#FFFFFF",
                            color: isOwn ? "#FFF" : "#334155",
                            border: isOwn ? "none" : "1px solid #E8EDF5",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          }}
                        >
                          {m.attachmentUrl ? (
                            <Box
                              component="a"
                              href={m.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              display="flex"
                              alignItems="center"
                              gap={1}
                              sx={{ color: "inherit", textDecoration: "none" }}
                            >
                              <InsertDriveFileOutlinedIcon fontSize="small" />
                              <Typography sx={{ fontSize: "0.9rem", textDecoration: "underline", fontWeight: 600 }}>
                                {m.attachmentName || "View Attachment"}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.7 }}>{m.message}</Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{ p: 2.5, borderTop: "1px solid #E8EDF5", bgcolor: "#FFFFFF" }}>
                <Box display="flex" gap={1} mb={1.5} alignItems="center">
                  <MessageLinkAttach onAttach={setPendingAttachment} />
                  {pendingAttachment?.url && (
                    <Chip
                      label={pendingAttachment.name || "Attached link"}
                      onDelete={() => setPendingAttachment(null)}
                      sx={{ bgcolor: "#EFF6FF", color: "#2563EB" }}
                    />
                  )}
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Reply to Main Admin..."
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
                  sx={{ mt: 1.5, textTransform: "none", bgcolor: "#2563EB", borderRadius: 2, px: 3 }}
                >
                  Send Message
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ ...panelCard, p: 3, justifyContent: "center", alignItems: "center" }}>
              <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>
                Select a conversation to view messages
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={openNewChat} onClose={() => !startingChat && setOpenNewChat(false)} fullWidth maxWidth="xs">
        <DialogTitle>Message Main Admin</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
            Platform policy allows Super Admin chats with Main Admins only.
          </Typography>
          {loadingAdmins ? (
            <Box display="flex" justifyContent="center" py={3}><CircularProgress size={24} /></Box>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Main Admin</InputLabel>
              <Select
                value={newChatUserId}
                label="Main Admin"
                onChange={(e) => setNewChatUserId(e.target.value)}
              >
                {mainAdmins.length === 0 && (
                  <MenuItem value="" disabled>No Main Admins found</MenuItem>
                )}
                {mainAdmins.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}
                    {u.company?.companyName ? ` · ${u.company.companyName}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewChat(false)} disabled={startingChat}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStartNewChat}
            disabled={!newChatUserId || startingChat}
            sx={{ bgcolor: "#2563EB" }}
          >
            {startingChat ? "Starting…" : "Start Chat"}
          </Button>
        </DialogActions>
      </Dialog>
    </SuperAdminLayout>
  );
}
