import { useState } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Chip, IconButton, Tabs, Tab } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { card } from "./styles";

const CATEGORY_MAP = {
  task: { label: "Task", color: "#2563EB" },
  message: { label: "Message", color: "#7C3AED" },
  reminder: { label: "Reminder", color: "#F97316" },
  system: { label: "System", color: "#64748B" },
};

function inferCategory(type) {
  if (!type) return "system";
  if (type.includes("task") || type.includes("due") || type.includes("overdue") || type.includes("extension")) return "task";
  if (type.includes("message")) return "message";
  if (type.includes("reminder")) return "reminder";
  return "system";
}

export default function NotificationCenter({
  items, onMarkRead, onMarkAllRead, onDelete, showCategories = true,
}) {
  const unread = items.filter((n) => !n.read).length;
  const [tab, setTab] = useState(0);

  const filtered = tab === 1 ? items.filter((n) => !n.read) : tab === 2 ? items.filter((n) => n.read) : items;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>{unread} unread · {items.length} total</Typography>
        {unread > 0 && onMarkAllRead && (
          <Chip label="Mark all as read" onClick={onMarkAllRead} clickable sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }} aria-label="Mark all notifications as read" />
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { textTransform: "none", minHeight: 36, fontSize: "0.82rem" } }}>
        <Tab label="All" />
        <Tab label={`Unread (${unread})`} />
        <Tab label="Read" />
      </Tabs>

      {filtered.length === 0 ? (
        <Box sx={{ ...card, textAlign: "center", py: 4 }}>
          <Typography sx={{ color: "#64748B", fontWeight: 600 }}>No notifications</Typography>
          <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mt: 0.5 }}>
            {tab === 1 ? "You're all caught up!" : tab === 2 ? "No read notifications yet" : "Notifications will appear here"}
          </Typography>
        </Box>
      ) : filtered.map((n) => {
        const cat = inferCategory(n.type);
        const catCfg = CATEGORY_MAP[cat];
        return (
          <Box key={n.id} sx={{ ...card, mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", opacity: n.read ? 0.75 : 1, borderLeft: n.read ? undefined : "3px solid #2563EB" }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{n.title}</Typography>
                {showCategories && <Chip label={catCfg.label} size="small" sx={{ height: 20, fontSize: "0.6rem", bgcolor: `${catCfg.color}15`, color: catCfg.color }} />}
                {!n.read && <Chip label="Unread" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#EFF6FF", color: "#2563EB" }} />}
              </Box>
              <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>{n.message}</Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", mt: 0.5 }}>{n.time}</Typography>
            </Box>
            <Box>
              {!n.read && onMarkRead && (
                <IconButton size="small" onClick={() => onMarkRead(n.id)} sx={{ color: "#2563EB" }} aria-label={`Mark ${n.title} as read`}>
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton size="small" onClick={() => onDelete(n.id)} sx={{ color: "#94A3B8" }} aria-label={`Delete ${n.title}`}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

NotificationCenter.propTypes = {
  items: PropTypes.array.isRequired,
  onMarkRead: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  onDelete: PropTypes.func,
  showCategories: PropTypes.bool,
};
