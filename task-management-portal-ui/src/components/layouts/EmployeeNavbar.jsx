import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Avatar, Badge, Box, IconButton, Toolbar, Typography, Menu, MenuItem, Divider, ListItemIcon, InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonOutline from "@mui/icons-material/PersonOutline";
import Logout from "@mui/icons-material/Logout";
import { EMPLOYEE_DRAWER_WIDTH } from "./EmployeeSidebar";
import useCurrentUser from "../../hooks/useCurrentUser";
import notificationService from "../../services/notificationService";
import { STORAGE_KEYS } from "../../constants/storageKeys";

const PAGE_TITLES = {
  "/employee/dashboard": "Dashboard",
  "/employee/tasks": "My Tasks",
  "/employee/calendar": "Calendar",
  "/employee/notifications": "Notifications",
  "/employee/messages": "Messages",
  "/employee/activity": "Activity History",
  "/employee/profile": "Profile",
};

function getPageTitle(pathname) {
  if (pathname.match(/\/employee\/tasks\/[^/]+$/)) return "Task Details";
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path)) return title;
  }
  return "Dashboard";
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.isAuthenticated);
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem("userRole");
  localStorage.removeItem("isAuthenticated");
}

export default function EmployeeNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await notificationService.getCount();
        if (active) setUnreadCount(result?.unreadCount ?? 0);
      } catch {
        if (active) setUnreadCount(0);
      }
    })();
    return () => { active = false; };
  }, [location.pathname]);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  const displayName = `${firstName} ${lastName}`.trim() || (loading ? "…" : "Employee");

  return (
    <AppBar position="fixed" elevation={0} sx={{
      width: `calc(100% - ${EMPLOYEE_DRAWER_WIDTH}px)`, ml: `${EMPLOYEE_DRAWER_WIDTH}px`,
      bgcolor: "#FFFFFF", borderBottom: "1px solid #E8EDF5", zIndex: (t) => t.zIndex.drawer + 1,
    }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 }, gap: 2, minHeight: 64 }}>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem", flexShrink: 0 }}>{getPageTitle(location.pathname)}</Typography>
        <Box sx={{
          display: { xs: "none", md: "flex" }, alignItems: "center", flex: 1, maxWidth: 460, mx: "auto",
          bgcolor: "#F8FAFC", borderRadius: 2.5, px: 2, py: 0.5, border: "1px solid #E8EDF5",
        }}>
          <SearchIcon sx={{ color: "#94A3B8", fontSize: 20, mr: 1 }} />
          <InputBase placeholder="Search tasks..." sx={{ flex: 1, fontSize: "0.875rem", color: "#334155" }} />
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton size="small" onClick={() => navigate("/employee/notifications")}>
            <Badge badgeContent={unreadCount || undefined} color="error" max={99}>
              <NotificationsNoneIcon sx={{ color: "#64748B" }} />
            </Badge>
          </IconButton>
          <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", ml: 1, p: 0.5, borderRadius: 2, "&:hover": { bgcolor: "#F8FAFC" } }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563EB", fontSize: "0.85rem" }}>
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#0F172A", lineHeight: 1.2 }}>{displayName}</Typography>
              <Typography sx={{ fontSize: 11, color: "#64748B" }}>Employee</Typography>
            </Box>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, minWidth: 180, border: "1px solid #E2E8F0" } }}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate("/employee/profile"); }}>
              <ListItemIcon><PersonOutline fontSize="small" sx={{ color: "#2563EB" }} /></ListItemIcon>View Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); clearAuth(); navigate("/login"); }} sx={{ color: "#EF4444" }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: "#EF4444" }} /></ListItemIcon>Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
