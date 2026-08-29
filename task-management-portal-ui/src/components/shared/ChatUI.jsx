import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box, Typography, TextField, InputAdornment, List, ListItemButton, ListItemText, Avatar, Chip, IconButton, Popover, Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PushPinIcon from "@mui/icons-material/PushPin";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import HistoryIcon from "@mui/icons-material/History";
import { card, fieldSx } from "./styles";
import { buildSearchIndex, searchAll } from "../../utils/searchIndex";
import { addRecentSearch, getRecentSearches, clearRecentSearches, highlightMatch } from "../../utils/recentSearches";
import { fadeIn, scaleIn } from "../../utils/motion";

const EMOJIS = ["👍", "😊", "🎉", "✅", "📎", "🙏", "💡", "⏰"];

export function ChatMessageList({ messages, autoScroll = true }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScroll]);

  return (
    <Box sx={{ maxHeight: 360, overflowY: "auto", mb: 2, p: 1 }} role="log" aria-live="polite">
      {messages.map((m) => (
        <Box key={m.id} mb={1.5} display="flex" flexDirection="column" alignItems={m.sender === "You" ? "flex-end" : "flex-start"}>
          <Box sx={{ maxWidth: "75%", p: 1.5, borderRadius: 2, bgcolor: m.sender === "You" ? "#2563EB" : "#F1F5F9", color: m.sender === "You" ? "#FFF" : "#334155" }}>
            <Typography sx={{ fontSize: "0.9rem" }}>{m.text}</Typography>
          </Box>
          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.3 }}>
            {m.date} · {m.time} {m.sender === "You" && (m.seen ? "· Seen" : "· Sent")}
          </Typography>
        </Box>
      ))}
      <div ref={bottomRef} />
    </Box>
  );
}

ChatMessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  autoScroll: PropTypes.bool,
};

export function ChatContactList({ threads, selected, onSelect, search = "" }) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return threads.filter((t) => !q || t.name.toLowerCase().includes(q) || t.role?.toLowerCase().includes(q));
  }, [threads, search]);

  return (
    <List disablePadding sx={{ maxHeight: 420, overflowY: "auto" }} role="listbox" aria-label="Recent chats">
      {filtered.map((t) => (
        <ListItemButton key={t.id} selected={selected === t.id} onClick={() => onSelect(t.id)} role="option" aria-selected={selected === t.id} sx={{ borderRadius: 2, mb: 0.5 }}>
          <Box position="relative" mr={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.8rem" }}>{t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</Avatar>
            {t.online && <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, bgcolor: "#16A34A", borderRadius: "50%", border: "2px solid #FFF" }} aria-label="Online" />}
          </Box>
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={0.5}>
                  {t.pinned && <PushPinIcon sx={{ fontSize: 14, color: "#94A3B8" }} />}
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.name}</Typography>
                </Box>
                {t.unread > 0 && <Chip label={t.unread} size="small" sx={{ height: 18, minWidth: 18, fontSize: "0.6rem", bgcolor: "#2563EB", color: "#FFF" }} />}
              </Box>
            }
            secondary={
              <>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }} noWrap>{t.lastMessage}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{t.online ? "Online" : t.lastSeen || t.role} · {t.lastTime}</Typography>
              </>
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
}

ChatContactList.propTypes = {
  threads: PropTypes.array.isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  search: PropTypes.string,
};

export function TypingIndicator({ name = "Someone" }) {
  return (
    <Box display="flex" alignItems="center" gap={0.5} mb={1} aria-live="polite" aria-label={`${name} is typing`}>
      <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", fontStyle: "italic" }}>{name} is typing</Typography>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 4, height: 4, borderRadius: "50%", background: "#94A3B8", display: "inline-block" }}
        />
      ))}
    </Box>
  );
}

TypingIndicator.propTypes = { name: PropTypes.string };

export function EmojiPickerButton({ onSelect }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Open emoji picker" sx={{ bgcolor: "#F8FAFC" }}>
        <EmojiEmotionsOutlinedIcon fontSize="small" />
      </IconButton>
      <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "top", horizontal: "left" }} transformOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Box sx={{ p: 1.5, display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 220 }}>
          {EMOJIS.map((em) => (
            <IconButton key={em} onClick={() => { onSelect?.(em); setAnchor(null); }} sx={{ fontSize: "1.25rem" }} aria-label={`Insert ${em}`}>{em}</IconButton>
          ))}
        </Box>
      </Popover>
    </>
  );
}

EmojiPickerButton.propTypes = { onSelect: PropTypes.func };

function HighlightedText({ text, query }) {
  const parts = highlightMatch(text, query);
  return (
    <Typography component="span" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
      {parts.map((p, i) => (
        <Box key={i} component="span" sx={p.match ? { bgcolor: "#FEF08A", borderRadius: 0.5, px: 0.25 } : undefined}>{p.text}</Box>
      ))}
    </Typography>
  );
}

HighlightedText.propTypes = { text: PropTypes.string, query: PropTypes.string };

export function GlobalSearchDialog({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => (query.trim() ? searchAll(index, query) : []), [index, query]);

  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSelect = useCallback((r) => {
    if (query.trim()) addRecentSearch(query.trim());
    onNavigate?.(r);
    onClose?.();
    setQuery("");
  }, [query, onNavigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{ position: "fixed", inset: 0, bgcolor: "rgba(15,23,42,0.4)", zIndex: 1400, display: "flex", justifyContent: "center", pt: { xs: 4, sm: 10 }, px: 2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <Box
            component={motion.div}
            {...scaleIn}
            sx={{ ...card, width: "100%", maxWidth: 560, maxHeight: { xs: "85vh", sm: 480 }, overflow: "hidden", p: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid #E8EDF5" }}>
              <TextField
                fullWidth
                autoFocus
                placeholder="Search companies, employees, tasks, departments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={fieldSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94A3B8" }} /></InputAdornment> }}
                inputProps={{ "aria-label": "Global search", "aria-keyshortcuts": "Control+K Meta+K" }}
              />
              <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 1 }}>Press Esc to close · Ctrl+K / ⌘K to open</Typography>
            </Box>
            <List sx={{ maxHeight: { xs: "calc(85vh - 120px)", sm: 360 }, overflowY: "auto", py: 1 }}>
              {!query.trim() && recent.length > 0 && (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={0.5}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <HistoryIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>Recent searches</Typography>
                    </Box>
                    <Button size="small" onClick={() => { clearRecentSearches(); setRecent([]); }} sx={{ textTransform: "none", fontSize: "0.72rem" }}>Clear</Button>
                  </Box>
                  {recent.map((term) => (
                    <ListItemButton key={term} onClick={() => setQuery(term)} sx={{ px: 2 }}>
                      <ListItemText primary={term} primaryTypographyProps={{ fontSize: "0.85rem" }} />
                    </ListItemButton>
                  ))}
                </>
              )}
              {query.trim() && results.length === 0 && (
                <Typography sx={{ p: 2, color: "#94A3B8", fontSize: "0.85rem" }}>No results found for &quot;{query}&quot;</Typography>
              )}
              {!query.trim() && recent.length === 0 && (
                <Typography sx={{ p: 2, color: "#94A3B8", fontSize: "0.85rem" }}>Type to search across the portal</Typography>
              )}
              {results.map((r) => (
                <ListItemButton key={r.id} onClick={() => handleSelect(r)} sx={{ px: 2 }}>
                  <ListItemText
                    primary={<HighlightedText text={r.title} query={query} />}
                    secondary={`${r.type} · ${r.subtitle || ""}`}
                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}

GlobalSearchDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onNavigate: PropTypes.func,
};
